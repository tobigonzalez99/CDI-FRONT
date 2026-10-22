import { z } from "zod";

/**
 * HU-02: el socio ingresa con DNI y contraseña.
 * El DNI se valida como string de 7 u 8 dígitos (no como número) para no
 * perder ceros a la izquierda ni habilitar notación científica.
 */
export const loginSchema = z.object({
  dni: z
    .string()
    .trim()
    .min(1, "Ingresá tu número de DNI")
    .regex(/^\d+$/, "El DNI debe contener solo números")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener como máximo 8 dígitos"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
