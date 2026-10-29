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
