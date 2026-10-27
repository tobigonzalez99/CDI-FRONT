/**
 * Actividad del club: cada ítem del menú "Disciplinas", que reemplaza al
 * viejo menú "Fútbol".
 *
 * Es una **lista plana**: las categorías de fútbol (Masculino, Femenino,
 * Escuelita, Inferiores) conviven al mismo nivel que Patín y la Colonia de
 * Verano, todas colgando de la misma entrada desplegable.
 *
 * El árbol ya no se escribe a mano en `nav-config.ts`: viene de
 * `GET /disciplinas`, así que sumar una actividad no toca el código.
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
}

export type UpdateDisciplinaInput = Partial<CreateDisciplinaInput>;
