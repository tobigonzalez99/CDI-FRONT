import { z } from "zod";

/**
 * Formularios del panel de la tienda. Los mensajes dicen qué hacer, no qué
 * regla se incumplió.
 */

const precio = z
  .number({ invalid_type_error: "Ingresá el precio" })
  .positive("El precio tiene que ser mayor a cero")
  .max(100_000_000, "El precio es demasiado alto");

const stock = z
  .number({ invalid_type_error: "Ingresá el stock" })
  .int("El stock va sin decimales")
  .min(0, "El stock no puede ser negativo");

export const datosProductoSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá el nombre").max(120, "El nombre es muy largo"),
  categoriaId: z.string().min(1, "Elegí la categoría"),
  precio,
  descripcion: z.string().max(5000, "La descripción es muy larga"),
  destacado: z.boolean(),
  activo: z.boolean(),
});

export type DatosProductoFormValues = z.infer<typeof datosProductoSchema>;

export const nuevoProductoSchema = datosProductoSchema
  .extend({
    conTalles: z.boolean(),
    talles: z.array(
      z.object({
        talle: z.string().trim().min(1, "Ingresá el talle").max(10, "Muy largo").toUpperCase(),
        stock,
      }),
    ),
    stockUnico: stock,
  })
  .superRefine((valores, ctx) => {
    if (!valores.conTalles) return;

    if (valores.talles.length === 0) {
      ctx.addIssue({ code: "custom", path: ["talles"], message: "Agregá al menos un talle" });
      return;
    }

    // "m" y "M" son el mismo talle: la API los rechaza repetidos.
    const vistos = new Set<string>();
    valores.talles.forEach((fila, indice) => {
      const clave = fila.talle.trim().toUpperCase();
      if (vistos.has(clave)) {
        ctx.addIssue({ code: "custom", path: ["talles", indice, "talle"], message: "Repetido" });
      }
      vistos.add(clave);
    });
  });

export type NuevoProductoFormValues = z.infer<typeof nuevoProductoSchema>;

export const movimientoStockSchema = z.object({
  tipo: z.enum(["ENTRA", "SALE"]),
  cantidad: z
    .number({ invalid_type_error: "Ingresá la cantidad" })
    .int("Va sin decimales")
    .positive("Tiene que ser mayor a cero"),
  motivo: z.enum(["INGRESO", "AJUSTE"]),
  observaciones: z.string().trim().max(300, "Es muy largo"),
});

export type MovimientoStockFormValues = z.infer<typeof movimientoStockSchema>;

export const configuracionTiendaSchema = z.object({
  retiroLugar: z.string().trim().max(120, "Es muy largo"),
  retiroDireccion: z.string().trim().max(200, "Es muy largo"),
  retiroHorarios: z.string().trim().max(200, "Es muy largo"),
  umbralUltimasUnidades: z
    .number({ invalid_type_error: "Ingresá un número" })
    .int("Va sin decimales")
    .min(0, "No puede ser negativo")
    .max(100, "Es demasiado alto"),
});

export type ConfiguracionTiendaFormValues = z.infer<typeof configuracionTiendaSchema>;

export const operadorSchema = z.object({
  dni: z
    .string()
    .trim()
    .min(1, "Ingresá el DNI")
    .regex(/^\d+$/, "El DNI debe tener solo números, sin puntos")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener como máximo 8 dígitos"),
  nombre: z.string().trim().min(2, "Ingresá el nombre").max(60, "Es muy largo").toUpperCase(),
  apellido: z.string().trim().min(2, "Ingresá el apellido").max(60, "Es muy largo").toUpperCase(),
});

export type OperadorFormValues = z.infer<typeof operadorSchema>;
