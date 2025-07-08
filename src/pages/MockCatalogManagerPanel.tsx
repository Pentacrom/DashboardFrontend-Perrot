// src/pages/MockCatalogManagerPanel.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { MockCatalogManager } from "../utils/mockManager";
import { mockCatalogos } from "../utils/ServiceDrafts";
import type {
  Catalogos,
  Item,
  GrupoLugar,
  Lugar,
  Cliente,
} from "../utils/ServiceDrafts";

const manager = new MockCatalogManager(mockCatalogos);

type SectionKey = keyof Catalogos;
const sectionConfig: Record<SectionKey, { label: string; fields: string[] }> = {
  Operación: { label: "Operación", fields: ["codigo", "nombre"] },
  Zona: { label: "Zona", fields: ["codigo", "nombre"] },
  GrupoLugares: {
    label: "Grupo de Lugares",
    fields: ["id", "nombre", "descripcion"],
  },
  Lugares: { label: "Lugar", fields: ["id", "idGrupo", "nombre", "tipo"] },
  Tipo_contenedor: { label: "Tipo Contenedor", fields: ["codigo", "nombre"] },
  acciones: { label: "Acción", fields: ["codigo", "nombre"] },
  empresas: { label: "Empresa", fields: ["id", "nombre", "grupo"] },
  proveedores_extras: {
    label: "Proveedor Extra",
    fields: ["codigo", "nombre"],
  },
  grupoCliente: { label: "Grupo Cliente", fields: ["codigo", "nombre"] },
};

export default function MockCatalogManagerPanel() {
  const [catalogos, setCatalogos] = useState<Catalogos>(manager.getAll());
  const [current, setCurrent] = useState<SectionKey>("Operación");
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  const refresh = () => setCatalogos({ ...manager.getAll() });

  const onChangeSection = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrent(e.target.value as SectionKey);
    setFormData({});
  };

  const onInputChange =
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const val = field.match(/id|codigo/) ? +e.target.value : e.target.value;
      setFormData({ ...formData, [field]: val });
    };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Casting 'formData' a any para cumplir la firma requerida
    manager.addItem(current, formData as any);
    refresh();
    setFormData({});
  };

  const { label, fields } = sectionConfig[current];
  const items = catalogos[current] as any[];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Gestor de Catálogos</h1>

      {/* Selector de sección */}
      <div className="flex items-center gap-2">
        <label className="w-32 font-medium">Catálogo:</label>
        <select
          className="flex-1 input"
          value={current}
          onChange={onChangeSection}
        >
          {Object.keys(sectionConfig).map((key) => (
            <option key={key} value={key}>
              {sectionConfig[key as SectionKey].label}
            </option>
          ))}
        </select>
      </div>

      {/* Listado en grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {items.map((item: any) => (
          <div
            key={fields.map((f) => item[f]).join("-")}
            className="p-2 bg-gray-100 rounded"
          >
            {fields.map((f) => item[f]).join(" - ")}
          </div>
        ))}
      </div>

      {/* Formulario de alta */}
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {fields.map((field) => (
          <input
            key={field}
            type={field.match(/id|codigo/) ? "number" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="input"
            value={formData[field] ?? ""}
            onChange={onInputChange(field)}
            required
          />
        ))}
        <button type="submit" className="btn-primary col-span-full">
          + Añadir {label}
        </button>
      </form>
    </div>
  );
}
