import { z } from "zod";

/**
 * Edición de la ficha de un socio desde el panel.
 *
 * Va en bloques y no en un formulario único: el administrador entra a
 * corregir una cosa puntual, y enfrentarlo a once campos a la vez es la
 * manera más rápida de que toque algo sin querer.
 *
 * Los mensajes están escritos para alguien no técnico: dicen qué hacer, no
 * qué regla se incumplió.
 */

const HOY = () => new Date().toISOString().slice(0, 10);

export const datosPersonalesSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá el nombre").max(60, "El nombre es muy largo"),
  apellido: z
    .string()
    .trim()
    .min(2, "Ingresá el apellido")
    .max(60, "El apellido es muy largo"),
  dni: z
    .string()
    .trim()
    // Antes que el formato: vacío, "solo números" no le dice qué hacer.
    .min(1, "Ingresá el DNI")
    .regex(/^\d+$/, "El DNI debe tener solo números, sin puntos")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener como máximo 8 dígitos"),
  /** El backend espera `YYYY-MM-DD`, que es justo lo que da un input date. */
  fechaNacimiento: z
    .string()
    .min(1, "Elegí la fecha de nacimiento")
    .refine((valor) => !Number.isNaN(Date.parse(valor)), "La fecha no es válida")
    .refine((valor) => valor <= HOY(), "La fecha no puede ser futura"),
});

export type DatosPersonalesFormValues = z.infer<typeof datosPersonalesSchema>;

export const contactoSchema = z.object({
  email: z.string().trim().email("Ingresá un correo electrónico válido"),
  telefono: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono de contacto")
    .max(30, "El teléfono es muy largo"),
  domicilio: z
    .string()
    .trim()
    .min(3, "Ingresá el domicilio")
    .max(120, "El domicilio es muy largo"),
  localidad: z
    .string()
    .trim()
    .min(2, "Ingresá la localidad")
    .max(80, "La localidad es muy larga"),
});

export type ContactoFormValues = z.infer<typeof contactoSchema>;

/**
 * El campo se llama `vigencia.hasta` y no `vigenciaHasta` a propósito: es la
 * misma clave que usa el backend en sus `fieldErrors`, así que un error del
 * servidor cae solo en el campo correcto del formulario.
 *
 * Toma el inicio de la vigencia para poder avisar antes de llegar al backend
 * cuando la fecha de vencimiento queda por detrás.
 */
export function construirMembresiaSchema(vigenciaDesde: string) {
  return z.object({
    tipoSocioId: z.string().min(1, "Elegí una categoría"),
    vigencia: z.object({
      hasta: z
        .string()
        .min(1, "Elegí hasta cuándo está al día")
        .refine((valor) => !Number.isNaN(Date.parse(valor)), "La fecha no es válida")
        .refine(
          (valor) => valor >= vigenciaDesde,
          "El vencimiento no puede ser anterior al inicio de la vigencia",
        ),
    }),
  });
}

export type MembresiaFormValues = z.infer<ReturnType<typeof construirMembresiaSchema>>;

/**
 * Alta manual desde el panel: cargar a un socio que ya venía pagando.
 *
 * Reúne los mismos campos que la edición por bloques, más la categoría y la
 * vigencia completa. La foto no pasa por acá: es un archivo y es opcional,
 * porque al cargar el padrón actual casi nunca se tiene a mano. El socio la
 * sube después desde su perfil.
 */
export const MODOS_ALTA = ["VENIA_PAGANDO", "PAGA_AHORA"] as const;
export type ModoAlta = (typeof MODOS_ALTA)[number];

/** Mínimo y máximo de meses en un cobro: el mismo límite que el cobro manual. */
export const MESES_COBRO = { min: 1, max: 24 } as const;

const esFecha = (valor: string) => !Number.isNaN(Date.parse(valor));

/**
 * Los dos bloques —vigencia y cobro— están siempre en el formulario, pero
 * solo se valida el del caso elegido: el otro queda oculto y no se envía.
 * Por eso son texto suelto y la validación va en `superRefine`.
 */
export const altaManualSchema = datosPersonalesSchema
  .merge(contactoSchema)
  .extend({
    tipoSocioId: z.string().min(1, "Elegí una categoría"),
    /**
     * Sin valor por defecto a propósito: elegir mal el caso le carga al socio
     * una vigencia equivocada sin que nadie lo note. Mejor que lo elijan.
     */
    modo: z
      .string()
      .refine((valor): valor is ModoAlta => (MODOS_ALTA as readonly string[]).includes(valor), {
        message: "Elegí si ya venía pagando o si paga ahora",
      }),
    vigencia: z.object({ desde: z.string(), hasta: z.string() }),
    /** La cuenta no se pide: sale del medio de pago (`cuentaParaMedio`). */
    pago: z.object({
      medioPago: z.string(),
      meses: z.string(),
      comprobante: z.string().trim().max(60, "El comprobante es muy largo"),
    }),
  })
  .superRefine((valores, ctx) => {
    const problema = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    if (valores.modo === "VENIA_PAGANDO") {
      const { desde, hasta } = valores.vigencia;
      if (!desde) problema(["vigencia", "desde"], "Elegí desde cuándo es socio");
      else if (!esFecha(desde)) problema(["vigencia", "desde"], "La fecha no es válida");

      if (!hasta) problema(["vigencia", "hasta"], "Elegí hasta cuándo tiene la cuota paga");
      else if (!esFecha(hasta)) problema(["vigencia", "hasta"], "La fecha no es válida");
      else if (desde && hasta < desde) {
        problema(["vigencia", "hasta"], "El vencimiento no puede ser anterior al inicio");
      }
    }

    if (valores.modo === "PAGA_AHORA") {
      const { medioPago, meses } = valores.pago;
      if (!medioPago) problema(["pago", "medioPago"], "Elegí el medio de pago");

      const cantidad = Number(meses);
      if (!Number.isInteger(cantidad) || cantidad < MESES_COBRO.min || cantidad > MESES_COBRO.max) {
        problema(
          ["pago", "meses"],
          `Elegí entre ${MESES_COBRO.min} y ${MESES_COBRO.max} meses`,
        );
      }
    }
  });

export type AltaManualFormValues = z.input<typeof altaManualSchema>;
