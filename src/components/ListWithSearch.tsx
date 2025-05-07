import { useState, useMemo, useEffect, useRef, ChangeEvent } from "react";
import ReactDOM from "react-dom";

export interface Column<T> {
  label: string;
  key: keyof T;
  sortable?: boolean;
}

export interface SearchFilter<T> {
  label: string;
  key: keyof T;
  type: "text" | "date";
  placeholder?: string;
  /** Para filtros de fecha: "gte" (desde) o "lte" (hasta). Por defecto se usa "gte". */
  comparator?: "gte" | "lte";
}

export interface CheckboxFilterGroup<T> {
  label?: string; // opcional, se muestra como título del grupo
  key: keyof T;
  options: string[];
}

/** Cada opción del dropdown ahora recibe el item correspondiente. */
export interface DropdownOption<T = any> {
  label: string;
  onClick: (item: T) => void;
}

/**
 * Ahora, dropdownOptions puede ser un arreglo o una función que reciba un item y retorne un arreglo de opciones.
 */
export type DropdownOptionsType<T> =
  | DropdownOption<T>[]
  | ((item: T) => DropdownOption<T>[]);

export interface ListWithSearchProps<T> {
  data: T[];
  columns: Column<T>[];
  searchFilters?: SearchFilter<T>[];
  checkboxFilterGroups?: CheckboxFilterGroup<T>[];
  onDownloadExcel?: () => void;
  onSearch?: () => void;
  searchButtonDisabled?: boolean;
  showExcelButton?: boolean;
  /**
   * Configuración de colores para una columna.
   * - field: el campo cuyo valor se usará para mapear colores.
   * - bgMapping: mapeo de valor a clases de fondo.
   * - textMapping: mapeo de valor a clases de color de texto.
   * - mode: "cell" (aplicar solo en la celda) o "row" (aplicar a toda la fila).
   */
  colorConfig?: {
    field: keyof T;
    bgMapping: Record<string, string>;
    textMapping: Record<string, string>;
    mode?: "cell" | "row";
  };
  /** Opciones para desplegar en el menú (dropdown) de acciones por fila */
  dropdownOptions?: DropdownOptionsType<T>;
  /** Título para la sección de filtros, se muestra centrado arriba */
  filterTitle?: string;
  /** Título para la tabla */
  tableTitle?: string;
  /** Botón o elementos custom globales, se muestran encima de la tabla */
  globalButtons?: React.ReactNode;
  /** Función que recibe el item y retorna un array de botones custom (por fila) */
  customButtons?: (item: T) => React.ReactNode[];
}

function ListWithSearch<T extends Record<string, any>>({
  data,
  columns,
  searchFilters = [],
  checkboxFilterGroups = [],
  onDownloadExcel,
  onSearch,
  searchButtonDisabled = false,
  showExcelButton = false,
  colorConfig,
  dropdownOptions = [],
  filterTitle,
  tableTitle,
  globalButtons,
  customButtons,
}: ListWithSearchProps<T>) {
  // Estado para cada filtro de búsqueda (inputs de texto o fecha)
  const [searchValues, setSearchValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      searchFilters.forEach((filter) => {
        initial[filter.key as string] = "";
      });
      return initial;
    }
  );

  // Estado para los grupos de checkbox.
  const [checkboxValues, setCheckboxValues] = useState<
    Record<string, string[]>
  >(() => {
    const initial: Record<string, string[]> = {};
    checkboxFilterGroups.forEach((group) => {
      initial[group.key as string] = [...group.options];
    });
    return initial;
  });

  // Ordenación
  const [sortKey, setSortKey] = useState<keyof T | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const renderSortIndicator = (key: keyof T) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? " ▲" : " ▼";
    }
    return null;
  };

  const handleSearchChange =
    (key: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
      setSearchValues((prev) => ({ ...prev, [key as string]: e.target.value }));
    };

  const toggleCheckbox = (groupKey: keyof T, option: string) => {
    setCheckboxValues((prev) => {
      const current = prev[groupKey as string] ?? [];
      if (current.includes(option)) {
        return {
          ...prev,
          [groupKey as string]: current.filter((v) => v !== option),
        };
      } else {
        return { ...prev, [groupKey as string]: [...current, option] };
      }
    });
  };

  interface MasterCheckboxRefs {
    [key: string]: HTMLInputElement | null;
  }
  const masterRefs = useRef<MasterCheckboxRefs>({});

  useEffect(() => {
    checkboxFilterGroups.forEach((group) => {
      const key = group.key as string;
      const master = masterRefs.current[key];
      const groupSelected = checkboxValues[key] ?? [];
      if (master) {
        master.indeterminate =
          groupSelected.length > 0 &&
          groupSelected.length < group.options.length;
      }
    });
  }, [checkboxValues, checkboxFilterGroups]);

  const toggleAllForGroup = (group: CheckboxFilterGroup<T>) => {
    const key = group.key as string;
    setCheckboxValues((prev) => ({
      ...prev,
      [key]:
        (prev[key] ?? []).length === group.options.length
          ? []
          : [...group.options],
    }));
  };

  // Estado para controlar qué fila tiene abierto su dropdown
  const [openDropdownRow, setOpenDropdownRow] = useState<number | null>(null);
  // Ref para el contenedor del dropdown
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // Ref para los botones de dropdown en cada fila
  const dropdownButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Efecto para cerrar el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !dropdownButtonRefs.current.some((btn) =>
          btn?.contains(event.target as Node)
        )
      ) {
        setOpenDropdownRow(null);
      }
    }
    if (openDropdownRow !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownRow]);

  const filteredData = useMemo(() => {
    let filtered = data;
    searchFilters.forEach((filter) => {
      const value = searchValues[filter.key as string];
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = item[filter.key];
          if (filter.type === "date") {
            if (filter.comparator === "lte") {
              return new Date(itemValue).getTime() <= new Date(value).getTime();
            }
            return new Date(itemValue).getTime() >= new Date(value).getTime();
          }
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    checkboxFilterGroups.forEach((group) => {
      const key = group.key as string;
      const selected = checkboxValues[key] ?? [];
      if (selected.length === 0) {
        filtered = [];
      } else {
        filtered = filtered.filter((item) => selected.includes(item[key]));
      }
    });
    return filtered;
  }, [data, searchFilters, searchValues, checkboxFilterGroups, checkboxValues]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (aVal && typeof aVal === "string" && sortKey === "fecha") {
        const aTime = new Date(aVal).getTime();
        const bTime = new Date(bVal).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  const showFiltersContainer =
    (searchFilters && searchFilters.length > 0) ||
    (checkboxFilterGroups && checkboxFilterGroups.length > 0);

  const headerDropdownVisible = data.some((item) => {
    const opts =
      typeof dropdownOptions === "function"
        ? dropdownOptions(item)
        : dropdownOptions;
    return opts && opts.length > 0;
  });
  const customButtonsProvided = typeof customButtons === "function";
  const extraColumnVisible = headerDropdownVisible || customButtonsProvided;

  return (
    <div className="p-6 relative">
      {filterTitle && showFiltersContainer && (
        <h2 className="text-xl font-bold text-center mb-4">{filterTitle}</h2>
      )}

      {showFiltersContainer && (
        <div className="bg-gray-100 p-4 rounded mb-6 drop-shadow-sm">
          {searchFilters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {searchFilters.map((filter) => (
                <div key={filter.key as string}>
                  <label className="block text-sm font-medium text-gray-700">
                    {filter.label}
                  </label>
                  <input
                    type={filter.type}
                    value={searchValues[filter.key as string] || ""}
                    onChange={handleSearchChange(filter.key)}
                    placeholder={filter.placeholder}
                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                  />
                </div>
              ))}
            </div>
          )}

          {checkboxFilterGroups.length > 0 && (
            <div className="mb-4">
              {checkboxFilterGroups.map((group) => {
                const key = group.key as string;
                return (
                  <div key={key} className="mb-2 border-b border-gray-300 pb-2">
                    {group.label && (
                      <div className="mb-1 text-sm font-medium text-gray-700">
                        {group.label}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option, idx) => (
                        <label
                          key={option}
                          className={`flex items-center text-sm text-gray-700 ${
                            idx > 0 ? "pt-1" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={(checkboxValues[key] ?? []).includes(
                              option
                            )}
                            onChange={() => toggleCheckbox(group.key, option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-1">{option}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center mt-1 gap-1">
                      <input
                        type="checkbox"
                        ref={(el) => {
                          masterRefs.current[key] = el;
                        }}
                        checked={
                          (checkboxValues[key] ?? []).length ===
                          group.options.length
                        }
                        onChange={() => toggleAllForGroup(group)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label className="text-sm text-gray-700">Todos</label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end items-center space-x-4 relative">
            <button
              onClick={onSearch}
              disabled={searchButtonDisabled}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Buscar
            </button>
            {showExcelButton && onDownloadExcel && (
              <button
                onClick={onDownloadExcel}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Descargar Informe en Excel
              </button>
            )}
          </div>
        </div>
      )}

      {tableTitle && (
        <h3 className="text-lg font-bold mb-4 text-center">{tableTitle}</h3>
      )}

      {/* Render global custom buttons, si se proporcionan */}
      {globalButtons && <div className="mb-4 text-right">{globalButtons}</div>}

      {colorConfig && (
        <div className="flex flex-wrap items-center mb-4">
          {Object.keys(colorConfig.bgMapping).map((key) => (
            <div key={key} className="inline-flex items-center mr-4">
              <span
                className={`inline-block w-4 h-4 rounded-full ${colorConfig.bgMapping[key]} ${colorConfig.textMapping[key]}`}
              />
              <span className="ml-1 text-sm text-gray-700">{key}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns
                .map((col) => (
                  <th
                    key={col.key as string}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                      col.sortable ? "hover:text-gray-700" : ""
                    }`}
                  >
                    {col.label}
                    {col.sortable && renderSortIndicator(col.key)}
                  </th>
                ))
                .concat(
                  extraColumnVisible
                    ? [
                        <th
                          key="actions"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          Acciones
                        </th>,
                      ]
                    : []
                )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((item, idx) => {
              let rowClass = "";
              if (colorConfig && colorConfig.mode === "row") {
                const value = String(item[colorConfig.field]);
                const bgClass = colorConfig.bgMapping[value] || "";
                const textClass = colorConfig.textMapping[value] || "";
                rowClass = `${bgClass} ${textClass}`;
              }
              const rowOptions =
                typeof dropdownOptions === "function"
                  ? dropdownOptions(item)
                  : dropdownOptions;
              return (
                <tr key={idx} className={rowClass}>
                  {columns
                    .map((col) => (
                      <td
                        key={col.key as string}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {colorConfig &&
                        colorConfig.mode === "cell" &&
                        col.key === colorConfig.field ? (
                          <span
                            className={`${
                              colorConfig.bgMapping[String(item[col.key])] || ""
                            } ${
                              colorConfig.textMapping[String(item[col.key])] ||
                              ""
                            } px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                          >
                            {String(item[col.key])}
                          </span>
                        ) : (
                          String(item[col.key])
                        )}
                      </td>
                    ))
                    .concat(
                      extraColumnVisible
                        ? [
                            <td
                              key="actions"
                              className="px-6 py-4 whitespace-nowrap relative"
                            >
                              {headerDropdownVisible &&
                                rowOptions.length > 0 && (
                                  <button
                                    ref={(el) => {
                                      dropdownButtonRefs.current[idx] = el;
                                    }}
                                    onClick={() =>
                                      setOpenDropdownRow((prev) =>
                                        prev === idx ? null : idx
                                      )
                                    }
                                    className="p-2 rounded hover:bg-gray-200"
                                  >
                                    ⋮
                                  </button>
                                )}
                              {customButtonsProvided &&
                                customButtons(item).map((btn, index) => (
                                  <span
                                    key={index}
                                    className="ml-2 inline-block"
                                  >
                                    {btn}
                                  </span>
                                ))}
                              {headerDropdownVisible &&
                                openDropdownRow === idx &&
                                dropdownButtonRefs.current[idx] &&
                                ReactDOM.createPortal(
                                  <div
                                    ref={dropdownRef}
                                    className="bg-white border rounded shadow-lg z-50 flex flex-col"
                                    style={{
                                    position: "fixed",
                                    top: Math.min(
                                      dropdownButtonRefs.current[idx]!.getBoundingClientRect().bottom + 4,
                                      window.innerHeight - 200 // margen inferior mínimo
                                    ),
                                    left: Math.min(
                                      dropdownButtonRefs.current[idx]!.getBoundingClientRect().left,
                                      window.innerWidth - 192 // 12rem = 192px, margen lateral mínimo
                                    ),
                                    width: "12rem",
                                  }}
                                  >
                                    {rowOptions.map((option, dIdx) => (
                                      <button
                                        key={dIdx}
                                        onClick={() => {
                                          option.onClick(item!);
                                          setOpenDropdownRow(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>,
                                  document.body
                                )}
                            </td>,
                          ]
                        : []
                    )}
                </tr>
              );
            })}
            {sortedData.length === 0 && (
              <tr>
                <td
                  className="px-6 py-4 text-center text-gray-500"
                  colSpan={columns.length + (extraColumnVisible ? 1 : 0)}
                >
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListWithSearch;
