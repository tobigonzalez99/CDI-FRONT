import { z } from "zod";

/**
 * Formulario público "Hacete socio".
 * Todos los campos son obligatorios salvo el comentario; la foto se valida
 * aparte porque es un archivo y no pasa por react-hook-form.
 */
export const solicitudSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre").max(60, "El nombre es muy largo"),
  apellido: z
    .string()
    .trim()
    .min(2, "Ingresá tu apellido")
    .max(60, "El apellido es muy largo"),
  dni: z
    .string()
    .trim()
    .regex(/^\d+$/, "El DNI debe contener solo números")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener como máximo 8 dígitos"),
  email: z.string().trim().email("Ingresá un correo electrónico válido"),
  telefono: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono de contacto")
    .max(30, "El teléfono es muy largo"),
  domicilio: z
    .string()
    .trim()
    .min(3, "Ingresá tu domicilio")
    .max(120, "El domicilio es muy largo"),
  localidad: z
    .string()
    .trim()
    .min(2, "Ingresá tu localidad")
    .max(80, "La localidad es muy larga"),
  /** El backend espera `YYYY-MM-DD`, que es justo lo que da un input date. */
  fechaNacimiento: z
    .string()
    .min(1, "Ingresá tu fecha de nacimiento")
    .refine((valor) => !Number.isNaN(Date.parse(valor)), "Fecha inválida")
    .refine((valor) => valor <= new Date().toISOString().slice(0, 10), {
      message: "La fecha no puede ser futura",
    }),
  tipoSocioId: z.string().min(1, "Elegí una categoría"),
  comentario: z.string().trim().max(500, "El comentario es muy largo").optional(),
});

export type SolicitudFormValues = z.infer<typeof solicitudSchema>;
