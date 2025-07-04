import { useState,useEffect, useRef } from "react";
interface SearchableDropdownProps<T> {
  options: T[];
  value: T | null;
  onChange: (item: T | null) => void;
  getOptionLabel: (item: T) => string;
  placeholder?: string;
}

export function SearchableDropdown<T extends { id: number }>(
  props: SearchableDropdownProps<T>
) {
  const { options, value, onChange, getOptionLabel, placeholder } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        className="input w-full"
        placeholder={placeholder}
        value={open ? query : value ? getOptionLabel(value) : ""}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setOpen(true);
          setQuery(e.target.value);
        }}
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border rounded max-h-48 overflow-y-auto shadow-lg">
          {filtered.map((opt) => (
            <li
              key={opt.id}
              className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {getOptionLabel(opt)}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-1 text-gray-500">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}
