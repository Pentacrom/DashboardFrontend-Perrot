// src/components/ListWithSearch.tsx
import {
  useState,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  CSS,
} from "@dnd-kit/utilities";


// Import formatDateTime from format utils
import { formatDateTime } from "../utils/format";

// Función para resaltar texto encontrado
const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 font-semibold">{part}</mark>
    ) : part
  );
};

// Función para formatear valores según el tipo de dato
const formatCellValue = (
  value: any,
  column: Column<any>
): string | React.ReactNode => {
  // Manejar valores null, undefined o vacíos
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  switch (column.dataType) {
    case "currency":
      const symbol = column.currencySymbol || "$";
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue === 0) return "-";
      return `${symbol}${numValue.toLocaleString()}`;

    case "temperature":
      const unit = column.temperatureUnit || "C";
      const tempValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(tempValue)) return "-";
      return `${tempValue}°${unit}`;

    case "percentage":
      const pctValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(pctValue)) return "-";
      return `${pctValue}%`;

    case "lookup":
      if (!column.lookupData) return value === 0 ? "-" : String(value);
      const lookup = column.lookupData.find(
        item => item.code === value || item.code === String(value)
      );
      return lookup ? lookup.name : (value === 0 ? "-" : String(value));

    case "boolean":
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      );

    case "date":
      if (value instanceof Date || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))) {
        return formatDateTime(value);
      }
      return String(value);

    case "number":
      const numberValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numberValue) || numberValue === 0) return "-";
      return numberValue.toLocaleString();

    default:
      return String(value);
  }
};

export interface Column<T> {
  label: string;
  key: keyof T;
  sortable?: boolean;
  dataType?: "text" | "number" | "currency" | "temperature" | "percentage" | "lookup" | "date" | "boolean";
  lookupData?: Array<{ code: number | string; name: string }>;
  currencySymbol?: string;
  temperatureUnit?: "C" | "F";
  render?: (value: any, item: T) => React.ReactNode;
}

export interface SearchFilter<T> {
  label: string;
  key: keyof T;
  type: "text" | "date";
  placeholder?: string;
  comparator?: "gte" | "lte";
}

export interface GlobalSearchConfig<T> {
  enabled: boolean;
  placeholder?: string;
  searchableColumns?: Array<keyof T>; // Columnas específicas para buscar
  highlightResults?: boolean;
}

export interface CheckboxFilterGroup<T> {
  label?: string;
  key: keyof T;
  options: string[];
}

export interface DropdownOption<T = any> {
  label: string;
  onClick: (item: T) => void;
}

export type DropdownOptionsType<T> =
  | DropdownOption<T>[]
  | ((item: T) => DropdownOption<T>[]);

export interface ListButton {
  label: string;
  onClick: () => void;
  className?: string; // Para color, tamaño, etc.
  disabled?: boolean;
}

export interface ListWithSearchProps<T> {
  data: T[];
  columns?: Column<T>[];
  defaultVisibleColumns?: Array<keyof T>;
  searchFilters?: SearchFilter<T>[]; // Mantenido para compatibilidad pero no usado
  checkboxFilterGroups?: CheckboxFilterGroup<T>[];
  defaultCheckboxSelections?: Partial<Record<keyof T, string[]>>;
  onDownloadExcel?: () => void;
  onSearch?: () => void;
  searchButtonDisabled?: boolean;
  colorConfig?: {
    field: keyof T;
    bgMapping: Record<string, string>;
    textMapping: Record<string, string>;
    mode?: "cell" | "row";
  };
  dropdownOptions?: DropdownOptionsType<T>;
  filterTitle?: string;
  tableTitle?: string;
  globalButtons?: React.ReactNode;
  customButtons?: (item: T) => React.ReactNode[]; // Botones de celda, NO botones de la vista general
  customSortOrder?: Partial<Record<keyof T, T[keyof T][]>>;
  defaultSortKey?: keyof T;
  defaultSortOrder?: "asc" | "desc";
  preferencesKey?: string;
  buttons?: ListButton[]; // Botones de vista general
  globalSearch?: GlobalSearchConfig<T>; // Nueva configuración de búsqueda inteligente
}

export interface ListPreferences<T> {
  visibleKeys: Array<keyof T>;
  itemsPerPage: number;
  sortKey: keyof T | "";
  sortOrder: "asc" | "desc";
  searchValues: Record<string, string>; // Mantenido para compatibilidad
  checkboxValues: Record<string, string[]>;
  columnOrder: Array<keyof T>;
  globalSearchValue?: string; // Ahora contiene la búsqueda inteligente
  globalSearchColumn?: keyof T | "all";
}

export interface ListWithSearchHandles<T> {
  exportPreferences: () => ListPreferences<T>;
  updatePreferences: (prefs: Partial<ListPreferences<T>>) => void;
}

// Componente para columna arrastrable
interface SortableColumnHeaderProps<T> {
  column: Column<T>;
  onSort: (key: keyof T) => void;
  renderSortIndicator: (key: keyof T) => React.ReactNode;
}

function SortableColumnHeader<T>({
  column,
  onSort,
  renderSortIndicator,
}: SortableColumnHeaderProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.key as string,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
        column.sortable ? "hover:text-gray-700" : ""
      } ${isDragging ? "bg-gray-200" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          {...listeners}
          className="mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          title="Arrastra para reordenar"
        >
          ⋮⋮
        </span>
        <div
          className={`flex-1 flex items-center ${column.sortable ? 'cursor-pointer' : ''}`}
          onClick={() => column.sortable && onSort(column.key)}
        >
          {column.label}
          {renderSortIndicator(column.key)}
        </div>
      </div>
    </th>
  );
}


function ListWithSearchInner<T extends Record<string, any>>(
  props: ListWithSearchProps<T>,
  ref: React.Ref<ListWithSearchHandles<T>>
) {
  const {
    data,
    columns,
    searchFilters = [], // Mantenido para compatibilidad pero no usado
    checkboxFilterGroups = [],
    onSearch,
    searchButtonDisabled = false,
    colorConfig,
    dropdownOptions = [],
    filterTitle,
    tableTitle,
    globalButtons,
    customButtons,
    customSortOrder,
    defaultSortKey,
    defaultSortOrder,
    defaultCheckboxSelections,
    preferencesKey,
    buttons,
    globalSearch
  } = props;

  // Construir lista completa de columnas
  const allColumns = useMemo<Column<T>[]>(() => {
    if (columns && columns.length > 0) {
      return columns;
    }
    if (data.length > 0) {
      return Object.keys(data[0]!).map((k) => ({
        key: k as keyof T,
        label: String(k),
        sortable: false,
      }));
    }
    return [];
  }, [columns, data]);

  // Estado para mostrar/ocultar el selector de columnas
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState<Array<keyof T>>(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          return JSON.parse(stored).visibleKeys;
        } catch { }
      }
    }
    return props.defaultVisibleColumns ?? allColumns.map((c) => c.key);
  });

  const toggleVisible = (key: keyof T) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Estado para el orden de columnas
  const [columnOrder, setColumnOrder] = useState<Array<keyof T>>(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          const prefs = JSON.parse(stored) as ListPreferences<T>;
          if (prefs.columnOrder) {
            console.log("📥 Cargando orden de columnas desde localStorage:", prefs.columnOrder);
            return prefs.columnOrder;
          }
        } catch { }
      }
    }
    const defaultOrder = allColumns.map((c) => c.key);
    console.log("📋 Usando orden por defecto:", defaultOrder);
    return defaultOrder;
  });

  // Sincronizar columnOrder cuando cambian las columnas (evitar bucle infinito)
  useEffect(() => {
    const currentKeys = allColumns.map(c => c.key);
    const newKeys = currentKeys.filter(key => !columnOrder.includes(key));
    const validKeys = columnOrder.filter(key => currentKeys.includes(key));
    
    if (newKeys.length > 0 || validKeys.length !== columnOrder.length) {
      setColumnOrder([...validKeys, ...newKeys]);
    }
  }, [allColumns]); // Solo dependemos de allColumns para evitar bucle

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumnOrder((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        console.log("🔄 Nuevo orden de columnas:", newOrder);
        return newOrder;
      });
    }
  };

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          return JSON.parse(stored).itemsPerPage;
        } catch { }
      }
    }
    return 20;
  });
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Filtros de texto/fecha
  const [searchValues, setSearchValues] = useState<Record<string, string>>(
    () => {
      if (preferencesKey) {
        const stored = localStorage.getItem(preferencesKey);
        if (stored) {
          try {
            return JSON.parse(stored).searchValues;
          } catch { }
        }
      }
      // inicial default
      const init: Record<string, string> = {};
      searchFilters.forEach((f) => (init[f.key as string] = ""));
      return init;
    }
  );

  const handleSearchChange =
    (key: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
      setSearchValues((prev) => ({
        ...prev,
        [key as string]: e.target.value,
      }));
    };

  // Filtros de checkbox
  const [checkboxValues, setCheckboxValues] = useState<
    Record<string, string[]>
  >(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          return JSON.parse(stored).checkboxValues;
        } catch { }
      }
    }
    const initial: Record<string, string[]> = {};
    checkboxFilterGroups.forEach((group) => {
      initial[group.key as string] = defaultCheckboxSelections?.[group.key] ?? [
        ...group.options,
      ];
    });
    return initial;
  });

  const toggleCheckbox = (groupKey: keyof T, option: string) => {
    setCheckboxValues((prev) => {
      const current = prev[groupKey as string] ?? [];
      if (current.includes(option)) {
        return {
          ...prev,
          [groupKey as string]: current.filter((v) => v !== option),
        };
      } else {
        return {
          ...prev,
          [groupKey as string]: [...current, option],
        };
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

  // Ordenación
  const [sortKey, setSortKey] = useState<keyof T | "">(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          return (JSON.parse(stored) as ListPreferences<T>).sortKey;
        } catch { }
      }
    }
    return defaultSortKey ?? "";
  });


  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          return (JSON.parse(stored) as ListPreferences<T>).sortOrder;
        } catch { }
      }
    }
    return defaultSortOrder ?? "asc";
  });

  // Estados para búsqueda inteligente
  const [smartSearchValue, setSmartSearchValue] = useState<string>(() => {
    if (preferencesKey) {
      const stored = localStorage.getItem(preferencesKey);
      if (stored) {
        try {
          return (JSON.parse(stored) as ListPreferences<T>).globalSearchValue || "";
        } catch { }
      }
    }
    return "";
  });

  const [showSearchHelp, setShowSearchHelp] = useState(false);

  // Función para parsear la búsqueda inteligente
  const parseSmartSearch = (searchValue: string): { field: keyof T | "all", value: string } => {
    const trimmed = searchValue.trim();
    if (!trimmed) return { field: "all", value: "" };
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      // Si no hay ":", buscar en todos los campos
      return { field: "all", value: trimmed };
    }
    
    const fieldName = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const searchTerm = trimmed.substring(colonIndex + 1).trim();
    
    // Buscar la columna que coincida con el nombre del campo
    const matchingColumn = allColumns.find(col => {
      const colLabel = col.label.toLowerCase();
      const colKey = String(col.key).toLowerCase();
      return colLabel === fieldName || colKey === fieldName || colLabel.includes(fieldName);
    });
    
    return {
      field: matchingColumn ? matchingColumn.key : "all",
      value: searchTerm
    };
  };

  // Parsear la búsqueda actual
  const { field: globalSearchColumn, value: globalSearchValue } = parseSmartSearch(smartSearchValue);


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

  // Filtrado de datos
  const filteredData = useMemo(() => {
    let filtered = data;

    // Aplicar filtros de fecha
    searchFilters.filter(f => f.type === 'date').forEach((filter) => {
      const value = searchValues[filter.key as string];
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = item[filter.key];
          try {
            const itemDate = new Date(itemValue);
            const filterDate = new Date(value);
            
            // Validar que ambas fechas sean válidas
            if (isNaN(itemDate.getTime()) || isNaN(filterDate.getTime())) {
              return false;
            }
            
            // Normalizar fechas a medianoche para comparación por día
            const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
            const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
            
            if (filter.comparator === "lte") {
              return itemDateOnly.getTime() <= filterDateOnly.getTime();
            }
            return itemDateOnly.getTime() >= filterDateOnly.getTime();
          } catch (error) {
            console.warn('Error parsing date for filter:', error);
            return false;
          }
        });
      }
    });

    // Aplicar filtros de checkbox
    checkboxFilterGroups.forEach((group) => {
      const key = group.key as string;
      const selected = checkboxValues[key] ?? [];
      if (selected.length === 0) {
        filtered = [];
      } else {
        filtered = filtered.filter((item) =>
          selected.includes(item[key] as string)
        );
      }
    });

    // Aplicar búsqueda inteligente solo si está habilitada
    if (globalSearch?.enabled && globalSearchValue.trim()) {
      const searchTerm = globalSearchValue.toLowerCase();
      const searchableColumns = globalSearch.searchableColumns || allColumns.map(c => c.key);
      
      filtered = filtered.filter((item) => {
        let hasMatch = false;

        if (globalSearchColumn === "all") {
          // Buscar en todas las columnas especificadas
          searchableColumns.forEach(columnKey => {
            const cellValue = formatCellValue(item[columnKey], 
              allColumns.find(c => c.key === columnKey) || { key: columnKey, label: String(columnKey) }
            );
            const valueStr = typeof cellValue === 'string' ? cellValue : String(cellValue);
            
            if (valueStr.toLowerCase().includes(searchTerm)) {
              hasMatch = true;
            }
          });
        } else {
          // Buscar solo en la columna específica
          const cellValue = formatCellValue(item[globalSearchColumn], 
            allColumns.find(c => c.key === globalSearchColumn) || { key: globalSearchColumn, label: String(globalSearchColumn) }
          );
          const valueStr = typeof cellValue === 'string' ? cellValue : String(cellValue);
          
          if (valueStr.toLowerCase().includes(searchTerm)) {
            hasMatch = true;
          }
        }

        return hasMatch;
      });
    }

    return filtered;
  }, [data, searchFilters, searchValues, checkboxFilterGroups, checkboxValues, globalSearch, globalSearchValue, globalSearchColumn, allColumns]);

  // Calcular matches para resaltado en un useMemo separado
  const globalSearchMatches = useMemo(() => {
    if (!globalSearch?.enabled || !globalSearchValue.trim()) {
      return new Map<number, Set<keyof T>>();
    }

    const newMatches = new Map<number, Set<keyof T>>();
    const searchTerm = globalSearchValue.toLowerCase();
    const searchableColumns = globalSearch.searchableColumns || allColumns.map(c => c.key);

    filteredData.forEach((item, index) => {
      const matchingFields = new Set<keyof T>();
      const originalIndex = data.indexOf(item);

      if (globalSearchColumn === "all") {
        searchableColumns.forEach(columnKey => {
          const cellValue = formatCellValue(item[columnKey], 
            allColumns.find(c => c.key === columnKey) || { key: columnKey, label: String(columnKey) }
          );
          const valueStr = typeof cellValue === 'string' ? cellValue : String(cellValue);
          
          if (valueStr.toLowerCase().includes(searchTerm)) {
            matchingFields.add(columnKey);
          }
        });
      } else {
        const cellValue = formatCellValue(item[globalSearchColumn], 
          allColumns.find(c => c.key === globalSearchColumn) || { key: globalSearchColumn, label: String(globalSearchColumn) }
        );
        const valueStr = typeof cellValue === 'string' ? cellValue : String(cellValue);
        
        if (valueStr.toLowerCase().includes(searchTerm)) {
          matchingFields.add(globalSearchColumn);
        }
      }

      if (matchingFields.size > 0) {
        newMatches.set(originalIndex, matchingFields);
      }
    });

    return newMatches;
  }, [filteredData, globalSearch, globalSearchValue, globalSearchColumn, allColumns, data]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const order = customSortOrder?.[sortKey];
    if (order) {
      return [...filteredData].sort((a, b) => {
        const ai = order.indexOf(a[sortKey]);
        const bi = order.indexOf(b[sortKey]);
        return sortOrder === "asc" ? ai - bi : bi - ai;
      });
    }

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (
        sortKey === "fecha" &&
        typeof aVal === "string" &&
        typeof bVal === "string"
      ) {
        const diff = new Date(aVal).getTime() - new Date(bVal).getTime();
        return sortOrder === "asc" ? diff : -diff;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [filteredData, sortKey, sortOrder, customSortOrder]);

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Dropdown acciones por fila
  const [openDropdownRow, setOpenDropdownRow] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    exportPreferences: () => ({
      visibleKeys,
      itemsPerPage,
      sortKey,
      sortOrder,
      searchValues,
      checkboxValues,
      columnOrder,
      globalSearchValue: smartSearchValue,
      globalSearchColumn: smartSearchValue ? globalSearchColumn : "all",
    }),
    updatePreferences: (newPrefs: Partial<ListPreferences<T>>) => {
      newPrefs.visibleKeys && setVisibleKeys(newPrefs.visibleKeys);
      newPrefs.itemsPerPage && setItemsPerPage(newPrefs.itemsPerPage);
      newPrefs.sortKey !== undefined && setSortKey(newPrefs.sortKey);
      newPrefs.sortOrder && setSortOrder(newPrefs.sortOrder);
      newPrefs.searchValues && setSearchValues(newPrefs.searchValues);
      newPrefs.checkboxValues && setCheckboxValues(newPrefs.checkboxValues);
      newPrefs.columnOrder && setColumnOrder(newPrefs.columnOrder);
      newPrefs.globalSearchValue !== undefined && setGlobalSearchValue(newPrefs.globalSearchValue);
      newPrefs.globalSearchColumn !== undefined && setGlobalSearchColumn(newPrefs.globalSearchColumn);
    },
  }));

  // ————————————————
  // Guardar preferencias en localStorage
  // ————————————————
  useEffect(() => {
    if (!preferencesKey) return;
    const prefs: ListPreferences<T> = {
      visibleKeys,
      itemsPerPage,
      sortKey,
      sortOrder,
      searchValues,
      checkboxValues,
      columnOrder,
      globalSearchValue: smartSearchValue,
      globalSearchColumn: smartSearchValue ? globalSearchColumn : "all",
    };
    console.log("🔖 Guardando prefs:", preferencesKey, prefs);
    localStorage.setItem(preferencesKey, JSON.stringify(prefs));
  }, [
    visibleKeys,
    itemsPerPage,
    sortKey,
    sortOrder,
    searchValues,
    checkboxValues,
    columnOrder,
    globalSearchValue,
    globalSearchColumn,
    preferencesKey,
  ]);


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

  const headerDropdownVisible = data.some((item) => {
    const opts =
      typeof dropdownOptions === "function"
        ? dropdownOptions(item)
        : dropdownOptions;
    return opts && opts.length > 0;
  });
  const customButtonsProvided = typeof customButtons === "function";
  const extraColumnVisible = headerDropdownVisible || customButtonsProvided;

  const showFiltersContainer =
    (searchFilters && searchFilters.filter(f => f.type === 'date').length > 0) ||
    (checkboxFilterGroups && checkboxFilterGroups.length > 0) ||
    (globalSearch?.enabled);

  return (
    <div className="p-6 relative max-w-full">
      {filterTitle && showFiltersContainer && (
        <h2 className="text-xl font-bold text-center mb-4">{filterTitle}</h2>
      )}

      {showFiltersContainer && (
        <div className="bg-gray-100 p-4 rounded mb-6 drop-shadow-sm">
          {/* Búsqueda inteligente */}
          {globalSearch?.enabled && (
            <div className="mb-4 p-3 bg-white rounded border">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Búsqueda inteligente
                  </label>
                  <button
                    onClick={() => setShowSearchHelp(!showSearchHelp)}
                    className="text-blue-500 hover:text-blue-700 text-sm underline"
                  >
                    ¿Cómo usar?
                  </button>
                </div>
                
                {showSearchHelp && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
                    <p className="font-medium text-blue-800 mb-2">Sintaxis de búsqueda:</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• <strong>Campo:valor</strong> - Buscar "valor" en el campo específico</li>
                      <li>• <strong>ID:123</strong> - Buscar el ID 123</li>
                      <li>• <strong>Cliente:empresa</strong> - Buscar "empresa" en la columna Cliente</li>
                      <li>• <strong>texto</strong> - Buscar "texto" en todas las columnas</li>
                    </ul>
                    <p className="mt-2 text-xs text-blue-600">
                      Campos disponibles: {allColumns.map(c => c.label).join(', ')}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={smartSearchValue}
                      onChange={(e) => setSmartSearchValue(e.target.value)}
                      placeholder="Ej: ID:123, Cliente:empresa, o solo texto para buscar en todo"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {smartSearchValue && (
                    <button
                      onClick={() => setSmartSearchValue("")}
                      className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                
                {smartSearchValue && (
                  <div className="text-xs text-gray-600">
                    {globalSearchColumn === "all" ? (
                      <span>Buscando "{globalSearchValue}" en <strong>todas las columnas</strong></span>
                    ) : (
                      <span>Buscando "{globalSearchValue}" en la columna <strong>{allColumns.find(c => c.key === globalSearchColumn)?.label}</strong></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filtros de fecha */}
          {searchFilters.filter(f => f.type === 'date').length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {searchFilters.filter(f => f.type === 'date').map((filter) => (
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
            {buttons && buttons.length > 0 && (
              <div className="flex justify-end items-center space-x-2 mb-4">
                {buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={btn.onClick}
                    className={
                      btn.className ||
                      "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    }
                    disabled={btn.disabled}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tableTitle && (
        <h3 className="text-lg font-bold mb-4 text-center">{tableTitle}</h3>
      )}

      {globalButtons && <div className="mb-4 text-right">{globalButtons}</div>}

      {/* Selector de columnas visibles (colapsable) */}
      {allColumns.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowColumnSelector((v) => !v)}
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Columnas</span>
            <span>{showColumnSelector ? "▲" : "▼"}</span>
          </button>
          {showColumnSelector && (
            <div className="mt-2 p-4 border rounded bg-gray-50 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allColumns.map((col) => (
                  <label
                    key={col.key as string}
                    className="inline-flex items-center text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(col.key)}
                      onChange={() => toggleVisible(col.key)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      <div className="flex justify-between items-center mb-4">
        <div>
          Mostrando del{" "}
          <strong>{Math.min(startIndex + 1, sortedData.length)}</strong> al{" "}
          <strong>{Math.min(endIndex, sortedData.length)}</strong> de{" "}
          <strong>{sortedData.length}</strong>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Ítems por página:</label>
          <input
            type="number"
            value={itemsPerPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              setItemsPerPage(Math.max(1, val));
              setCurrentPage(1);
            }}
            className="w-16 border rounded p-1 text-sm"
            min={1}
          />
          <label className="text-sm text-gray-700">Página:</label>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentPage(Math.min(Math.max(1, val), totalPages));
            }}
            className="w-16 border rounded p-1 text-sm"
            min={1}
          />
        </div>
      </div>

      {/* Contenedor del bloque de datos (tabla + paginación) */}
      <div className="bg-white p-6 rounded shadow min-w-full max-w-full">
        {/* Sólo la tabla queda en un contenedor con overflow-x-auto */}
        <div className="overflow-x-auto w-full">
          <div className="inline-block w-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="divide-y divide-gray-200 max-w-full min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <SortableContext
                      items={columnOrder.filter(key => visibleKeys.includes(key)).map(key => String(key))}
                      strategy={horizontalListSortingStrategy}
                    >
                      {columnOrder
                        .filter((key) => visibleKeys.includes(key))
                        .map((key) => {
                          const col = allColumns.find(c => c.key === key);
                          if (!col) return null;
                          return (
                            <SortableColumnHeader
                              key={col.key as string}
                              column={col}
                              onSort={handleSort}
                              renderSortIndicator={renderSortIndicator}
                            />
                          );
                        })}
                    </SortableContext>
                    {extraColumnVisible && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-100 border-l border-gray-200">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item, idx) => {
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
                      {columnOrder
                        .filter((key) => visibleKeys.includes(key))
                        .map((key) => {
                          const col = allColumns.find(c => c.key === key);
                          if (!col) return null;
                          const raw = item[col.key];
                          // Si esta columna es de tipo fecha, formateamos
                          // detectamos Date objetos o strings ISO
                          const isDateObj = (raw as any) instanceof Date;
                          const isIsoString =
                            typeof raw === "string" &&
                            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw);

                          // Usar la nueva función de formateo o el render personalizado de la columna
                          let cellContent;
                          if (col.render) {
                            cellContent = col.render(raw, item);
                          } else {
                            cellContent = formatCellValue(raw, col);
                          }

                          const displayValue =
                            isDateObj || isIsoString
                              ? formatDateTime(raw as any)
                              : String(raw);

                          // Aplicar resaltado de búsqueda global si está habilitado
                          const shouldHighlight = globalSearch?.enabled && 
                            globalSearch.highlightResults && 
                            globalSearchValue.trim() && 
                            globalSearchMatches.get(data.indexOf(item))?.has(col.key);

                          let finalCellContent = cellContent;
                          if (shouldHighlight && typeof cellContent === 'string') {
                            finalCellContent = highlightText(cellContent, globalSearchValue);
                          }

                          // Si hay un render personalizado, usarlo directamente
                          if (col.render) {
                            return (
                              <td
                                key={col.key as string}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {finalCellContent}
                              </td>
                            );
                          }

                          // Ahora aplicamos colorConfig o simplemente mostramos el valor formateado
                          if (
                            colorConfig &&
                            colorConfig.mode === "cell" &&
                            col.key === colorConfig.field
                          ) {
                            return (
                              <td
                                key={col.key as string}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                <span
                                  className={`
                        ${colorConfig.bgMapping[displayValue] || ""}
                        ${colorConfig.textMapping[displayValue] || ""}
                        px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      `}
                                >
                                  {finalCellContent}
                                </span>
                              </td>
                            );
                          }

                          const isCheckbox = typeof finalCellContent === "object" && finalCellContent !== null;
                          
                          return (
                            <td
                              key={col.key as string}
                              className={`px-6 py-4 whitespace-nowrap ${isCheckbox ? "text-center" : ""}`}
                            >
                              {finalCellContent}
                            </td>
                          );
                        })
                        .concat(
                          extraColumnVisible
                            ? [
                                <td
                                  key="actions"
                                  className={`px-6 py-4 whitespace-nowrap relative sticky right-0 border-l border-gray-200 ${
                                    colorConfig && colorConfig.mode === "row"
                                      ? colorConfig.bgMapping[String(item[colorConfig.field])] || "bg-white"
                                      : "bg-white"
                                  }`}
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
                                            dropdownButtonRefs.current[
                                              idx
                                            ]!.getBoundingClientRect().bottom +
                                              4,
                                            window.innerHeight - 200
                                          ),
                                          left: Math.min(
                                            dropdownButtonRefs.current[
                                              idx
                                            ]!.getBoundingClientRect().left,
                                            window.innerWidth - 192
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
                      colSpan={
                        allColumns.filter((c) => visibleKeys.includes(c.key))
                          .length + (extraColumnVisible ? 1 : 0)
                      }
                    >
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </DndContext>
          </div>
        </div>

        {/* Paginación fuera del contenedor con overflow */}
        <div className="mt-4 flex justify-center items-center space-x-1 text-sm">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages })
            .slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            )
            .map((_, idx) => {
              const page = Math.max(1, currentPage - 2) + idx;
              return (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ListWithSearch = forwardRef(ListWithSearchInner) as <T>(
  props: ListWithSearchProps<T> & { ref?: React.Ref<ListWithSearchHandles<T>> }
) => ReturnType<typeof ListWithSearchInner>;

export default ListWithSearch;
