import {
  Catalogos,
  GrupoLugar,
  Lugar,
  Item,
  Descuento,
  ValorFactura,
} from "./ServiceDrafts"; // ajusta la ruta si es necesario

export class MockCatalogManager {
  constructor(private catalogos: Catalogos) {}

  /** Agrega un nuevo grupo de lugares */
  addGrupoLugar(grupo: GrupoLugar) {
    this.catalogos.GrupoLugares.push(grupo);
  }

  /** Agrega un nuevo lugar */
  addLugar(lugar: Lugar) {
    this.catalogos.Lugares.push(lugar);
  }

  /** Agrega una nueva acción */
  addAccion(accion: Item) {
    this.catalogos.acciones.push(accion);
  }

  /** Método genérico: añade un ítem a cualquier array dentro de Catalogos */
  addItem<
    K extends keyof Catalogos,
    U extends Catalogos[K] extends (infer R)[] ? R : never
  >(key: K, item: U) {
    // @ts-ignore
    this.catalogos[key].push(item);
  }

  /** Elimina elementos que cumplan la condición */
  removeItem<K extends keyof Catalogos>(
    key: K,
    predicate: (item: Catalogos[K] extends (infer R)[] ? R : never) => boolean
  ) {
    // @ts-ignore
    this.catalogos[key] = this.catalogos[key].filter(
      (i: any) => !predicate(i)
    ) as any;
  }

  /** Actualiza un ítem que cumpla la condición */
  updateItem<K extends keyof Catalogos>(
    key: K,
    predicate: (item: Catalogos[K] extends (infer R)[] ? R : never) => boolean,
    updates: Partial<Catalogos[K] extends (infer R)[] ? R : never>
  ) {
    // @ts-ignore
    this.catalogos[key] = this.catalogos[key].map((i: any) =>
      predicate(i) ? { ...i, ...updates } : i
    );
  }

  /** Obtiene el objeto completo */
  getAll(): Catalogos {
    return this.catalogos;
  }
}
