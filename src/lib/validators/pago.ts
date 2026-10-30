import { z } from "zod";

import { MEDIOS_PAGO_MANUALES } from "@/types/pago";

const hoy = () => new Date().toISOString().slice(0, 10);

/**
 * Registro de un cobro. El backend rechaza montos <= 0 y fechas futuras;
 * acá se valida lo mismo para avisar antes de enviar.
 */
export const cobroSchema = z.object({
  socioId: z.string().min(1, "Elegí el socio"),
  cuentaId: z.string().min(1, "Elegí la cuenta donde entra el dinero"),
  monto: z.coerce
    .number({ invalid_type_error: "Ingresá un monto" })
    .positive("El monto debe ser mayor a cero"),
  medioPago: z.enum(MEDIOS_PAGO_MANUALES, { errorMap: () => ({ message: "Elegí el medio de pago" }) }),
  fechaPago: z
    .string()
    .optional()
    .refine((valor) => !valor || valor <= hoy(), {
      message: "No se puede registrar un cobro con fecha futura",
    }),
  meses: z.coerce
    .number()
    .int("Los meses deben ser un número entero")
    .min(1, "Mínimo 1 mes")
    .max(24, "Máximo 24 meses"),
  comprobante: z.string().trim().max(60, "El comprobante es muy largo").optional(),
  observaciones: z.string().trim().max(300, "Las observaciones son muy largas").optional(),
});

export type CobroFormValues = z.infer<typeof cobroSchema>;

/** El backend exige un motivo de 5 a 300 caracteres para anular. */
export const anulacionSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, "Contá en pocas palabras por qué se anula (mínimo 5 caracteres)")
    .max(300, "El motivo no puede superar los 300 caracteres"),
});

export type AnulacionFormValues = z.infer<typeof anulacionSchema>;
