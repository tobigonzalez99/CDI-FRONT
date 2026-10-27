import { z } from "zod";

/** Tipos y tamaño que acepta el backend para la foto de perfil. */
export const FOTO_TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const FOTO_MAX_MB = 5;
export const FOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";

/**
 * Valida la foto antes de subirla: el backend la rechazaría igual, pero
 * avisar acá evita una subida inútil y da un mensaje más claro.
 * Devuelve el error, o `null` si está bien.
 */
export function validarFoto(archivo: File): string | null {
  if (!FOTO_TIPOS_ACEPTADOS.includes(archivo.type as (typeof FOTO_TIPOS_ACEPTADOS)[number])) {
    return "La foto debe ser JPG, PNG o WEBP.";
  }
  if (archivo.size > FOTO_MAX_MB * 1024 * 1024) {
    return `La foto no puede superar los ${FOTO_MAX_MB} MB.`;
  }
  return null;
}

/**
 * Lo único que el socio puede editar de su ficha. El resto (nombre, DNI,
 * email, categoría, vigencia) lo cambia la administración.
 */
export const editarMiPerfilSchema = z.object({
  telefono: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono válido")
    .max(30, "El teléfono es demasiado largo"),
  domicilio: z
    .string()
    .trim()
    .min(3, "Ingresá tu domicilio")
    .max(120, "El domicilio es demasiado largo"),
  localidad: z
    .string()
    .trim()
    .min(2, "Ingresá tu localidad")
    .max(80, "La localidad es demasiado larga"),
});

export type EditarMiPerfilFormValues = z.infer<typeof editarMiPerfilSchema>;
