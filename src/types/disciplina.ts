/**
 * Actividad del club (Fútbol, Patín, Colonia de Verano) y sus categorías.
 *
 * Reemplaza al menú estático "Fútbol" por "Disciplinas": ahora el árbol viene
 * del backend, así que agregar una actividad no requiere tocar el código del
 * frontend. Es auto-referenciada con un solo nivel: una categoría no tiene
 * subcategorías.
 */
export interface Disciplina {
  id: string;
  nombre: string;
  /** Para la URL: `/disciplinas/{slug}`. Se genera del nombre. */
  slug: string;
  /** Texto corto para el menú y las tarjetas. */
  descripcion: string | null;
  /** Contenido de la página de la disciplina. */
  contenido: string | null;
  imagenUrl: string | null;
  activa: boolean;
  /** Orden en el menú; a igualdad, alfabético. */
  orden: number;
  /** `null` en las principales; apunta al padre en las categorías. */
  parentId: string | null;
  /** Presente en el listado y el detalle; ausente dentro de una categoría. */
  categorias?: Disciplina[];
}

export interface CreateDisciplinaInput {
  nombre: string;
  /** Opcional: si no se envía, se deriva del nombre. */
  slug?: string;
  descripcion?: string | null;
  contenido?: string | null;
  imagenUrl?: string | null;
  activa?: boolean;
  orden?: number;
  /** Con `parentId` se crea una categoría dentro de esa disciplina. */
  parentId?: string | null;
}

export type UpdateDisciplinaInput = Partial<CreateDisciplinaInput>;
