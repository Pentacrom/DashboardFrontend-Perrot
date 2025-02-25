import React, { useState, ChangeEvent } from "react";

interface ValorItem {
  item: string;
  subitem: string;
  tipo: "venta" | "costo";
  valor: string;
  observacion: string; // Nuevo campo
}

const itemsOptions: { [key: string]: string[] } = {
  Transporte: ["Flete", "Lastre", "MTY", "Rampla Corta"],
  "Porteo y almacenaje": ["Almacenaje 1", "Porteo 2", "Almacenaje 2"],
  "Servicios a la carga": ["Escolta", "Extracobertura", "Cuadrilla", "Grua"],
};

const formatPesos = (value: string): string => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) return "";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(numberValue);
};

const ValorizarServicio: React.FC = () => {
  const [valores, setValores] = useState<ValorItem[]>([]);
  const [currentValor, setCurrentValor] = useState<ValorItem>({
    item: "Transporte",
    subitem: itemsOptions["Transporte"]?.[0] ?? "",
    tipo: "venta",
    valor: "",
    observacion: "", // Inicializamos la observación
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Servicio valorado");
    console.log("Valores:", valores);
  };

  const handleCurrentValorChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "item") {
      setCurrentValor((prev) => ({
        ...prev,
        item: value,
        subitem: itemsOptions[value]?.[0] ?? "",
      }));
    } else {
      setCurrentValor((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddValor = () => {
    if (currentValor.valor.trim() === "") {
      return;
    }
    setValores((prev) => [...prev, currentValor]);
    // Reseteamos solo los campos de valor y observación para seguir agregando
    setCurrentValor((prev) => ({
      ...prev,
      valor: "",
      observacion: "",
    }));
  };

  const handleRemoveValor = (index: number) => {
    setValores((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Valorizar Servicio</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número de Servicio */}
          <div>
            <label
              htmlFor="numeroServicio"
              className="block text-sm font-medium text-gray-700"
            >
              ODV
            </label>
            <input
              id="numeroServicio"
              type="text"
              placeholder="Ej. 001"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 disabled:bg-gray-200 focus:border-blue-500"
              disabled
            />
          </div>
          {/* Cliente */}
          <div>
            <label
              htmlFor="cliente"
              className="block text-sm font-medium text-gray-700"
            >
              Cliente
            </label>
            <input
              id="cliente"
              type="text"
              placeholder="Nombre del cliente"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Sección para agregar la lista de valores */}
          <div className="md:col-span-2 border-t border-b border-gray-200 py-4">
            <h2 className="text-xl font-semibold mb-2">Agregar Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Select de Item */}
              <div>
                <label
                  htmlFor="item"
                  className="block text-sm font-medium text-gray-700"
                >
                  Item
                </label>
                <select
                  id="item"
                  name="item"
                  value={currentValor.item}
                  onChange={handleCurrentValorChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.keys(itemsOptions).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              {/* Select de Subitem */}
              <div>
                <label
                  htmlFor="subitem"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subitem
                </label>
                <select
                  id="subitem"
                  name="subitem"
                  value={currentValor.subitem}
                  onChange={handleCurrentValorChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {itemsOptions[currentValor.item]?.map((subitem) => (
                    <option key={subitem} value={subitem}>
                      {subitem}
                    </option>
                  ))}
                </select>
              </div>
              {/* Radio de Venta o Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <div className="mt-1 flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="venta"
                      checked={currentValor.tipo === "venta"}
                      onChange={handleCurrentValorChange}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Venta</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="costo"
                      checked={currentValor.tipo === "costo"}
                      onChange={handleCurrentValorChange}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Costo</span>
                  </label>
                </div>
              </div>
              {/* Input de Valor */}
              <div>
                <label
                  htmlFor="valor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Valor
                </label>
                <input
                  id="valor"
                  name="valor"
                  type="number"
                  placeholder="Ej. 1000"
                  value={currentValor.valor}
                  onChange={handleCurrentValorChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Input de Observación (por cada valor agregado) */}
              <div className="md:col-span-4">
                <label
                  htmlFor="observacion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Observación
                </label>
                <textarea
                  id="observacion"
                  name="observacion"
                  placeholder="Observación para este valor"
                  value={currentValor.observacion}
                  onChange={handleCurrentValorChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                ></textarea>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddValor}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Agregar Valor
              </button>
            </div>
            {valores.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">Valores Agregados</h3>
                <ul className="mt-2">
                  {valores.map((valorItem, index) => (
                    <li key={index} className="flex flex-col p-2 border-b">
                      <div className="flex items-center justify-between">
                        <span>
                          {valorItem.item} - {valorItem.subitem} -{" "}
                          {valorItem.tipo} - {formatPesos(valorItem.valor)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValor(index)}
                          className="text-white bg-red-600 hover:text-red-800 px-2 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                      {valorItem.observacion && (
                        <p className="text-sm italic mt-1">
                          Observación: {valorItem.observacion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Si antes se usaba el textarea global para observaciones del servicio,
              se elimina o se reutiliza según se requiera */}
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Valorizar Servicio
          </button>
        </div>
      </form>
    </div>
  );
};

export default ValorizarServicio;
