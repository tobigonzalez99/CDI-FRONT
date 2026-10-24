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

/**
 * Política de contraseñas, espejo de la del backend
 * (8–72 caracteres, al menos una letra y un número).
 * El límite superior lo impone bcrypt, que solo considera los primeros 72 bytes.
 */
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar los 72 caracteres")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra")
  .regex(/\d/, "La contraseña debe incluir al menos un número");

/** HU-03: primer ingreso. No se pide la clave actual: acaba de usarla para entrar. */
export const forcedChangePasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((datos) => datos.newPassword === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ForcedChangePasswordFormValues = z.infer<
  typeof forcedChangePasswordSchema
>;

/** HU-05: cambio voluntario desde "Mi Perfil". */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((datos) => datos.newPassword === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((datos) => datos.newPassword !== datos.currentPassword, {
    message: "La contraseña nueva debe ser distinta de la actual",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
