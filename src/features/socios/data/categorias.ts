/**
 * Las categorías de socio tal como las describe el club, para la sección
 * "Hacete socio".
 *
 * El texto vive acá porque es contenido con forma —beneficios en lista, a
 * quién está dirigida cada una—, no un párrafo libre. Los precios NO: salen
 * de la API (`montoCuota` de cada tipo de socio), así un cambio de cuota en
 * el panel se ve en el sitio sin tocar código.
 */

export type IdCategoria = "activo" | "protector" | "juvenil" | "campeon";

export interface CategoriaSocio {
  id: IdCategoria;
  nombre: string;
  /** Una línea: a quién está dirigida. */
  paraQuien: string;
  descripcion: string;
  beneficios: string[];
  /** Algo que conviene aclarar para que no haya malentendidos. */
  aclaracion?: string;
  /**
   * Solo las categorías con cuota muestran precio y se piden desde el
   * formulario. Juvenil y Campeón no tienen cuota: su tarjeta es solo
   * información.
   *
   * `nombreEnSistema` es cómo se llama el tipo de socio en el sistema, para
   * buscar su cuota. Si no existe —o lo renombran—, la tarjeta dice que el
   * valor se consulta en la sede en lugar de mostrar un precio equivocado.
   */
  cuota?: { nombreEnSistema: string };
  destacada?: boolean;
}

export const CATEGORIAS_SOCIO: CategoriaSocio[] = [
  {
    id: "activo",
    nombre: "Socio Activo",
    paraQuien: "Para quien quiere todos los beneficios del club.",
    descripcion:
      "Es el socio pleno de la institución: paga la cuota completa y accede a todos los beneficios.",
    beneficios: [
      "Pagás la mitad en todas las actividades que organiza el club.",
      "Descuento en el alquiler de los salones del club.",
      "Carnet digital con QR: lo mostrás en la entrada y se ve al instante que estás al día.",
    ],
    cuota: { nombreEnSistema: "Socio Activo" },
    destacada: true,
  },
  {
    id: "protector",
    nombre: "Socio Protector",
    paraQuien: "Para quien quiere darle una mano al club.",
    descripcion:
      "Colabora con una cuota menor para ayudar a sostener la institución y acompañar su crecimiento.",
    beneficios: [
      "Tu aporte sostiene las actividades y las instalaciones del club.",
      "Sos parte de los avances del club.",
    ],
    aclaracion: "No incluye descuentos ni beneficios concretos: es una forma de colaborar.",
    cuota: { nombreEnSistema: "Socio Protector" },
  },
  {
    id: "juvenil",
    nombre: "Socio Juvenil",
    paraQuien: "Para deportistas menores de 18 años.",
    descripcion:
      "Son los chicos y chicas de las distintas disciplinas que entrenan en las instalaciones del club y lo representan en cada competencia.",
    beneficios: ["Entrada gratis a todas las actividades que organiza el club."],
  },
  {
    id: "campeon",
    nombre: "Socio Campeón",
    paraQuien: "Para quienes salieron campeones con el club.",
    descripcion:
      "Una categoría de pertenencia para los jugadores que salieron campeones de la Liga Tresarroyense con el club.",
    beneficios: [
      "Entrada gratis a todas las actividades que organiza el club.",
      "Descuento en el alquiler de los salones del club.",
      "El reconocimiento del club a quienes le dieron un campeonato.",
    ],
  },
];

/** Para comparar nombres sin que una tilde o una mayúscula los separe. */
export function normalizarNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}
