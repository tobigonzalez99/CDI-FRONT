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

/** "  xl " → "XL": igual que la API, así "m" y "M" son el mismo talle. */
const nombreTalle = z
  .string()
  .trim()
  .max(20, "Muy largo")
  .transform((talle) => talle.replace(/\s+/g, " ").toUpperCase());

function marcarTallesRepetidos(filas: { talle: string }[], ctx: z.RefinementCtx, campo: string) {
  const vistos = new Set<string>();
  filas.forEach((fila, indice) => {
    if (vistos.has(fila.talle)) {
      ctx.addIssue({ code: "custom", path: [campo, indice, "talle"], message: "Repetido" });
    }
    vistos.add(fila.talle);
  });
}

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
        talle: nombreTalle.refine(Boolean, "Ingresá el talle"),
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

    marcarTallesRepetidos(valores.talles, ctx, "talles");
  });

export type NuevoProductoFormValues = z.infer<typeof nuevoProductoSchema>;

/** Edición de los talles de un producto. Sin talles hay una sola fila, sin nombre. */
export const tallesStockSchema = z
  .object({
    conTalles: z.boolean(),
    filas: z.array(
      z.object({
        varianteId: z.string().optional(),
        talle: nombreTalle,
        stock,
        activa: z.boolean(),
      }),
    ),
    motivo: z.enum(["INGRESO", "AJUSTE"]),
    observaciones: z.string().trim().max(300, "Es muy largo"),
  })
  .superRefine((valores, ctx) => {
    if (!valores.conTalles) return;

    if (valores.filas.length === 0) {
      ctx.addIssue({ code: "custom", path: ["filas"], message: "Dejá al menos un talle" });
      return;
    }

    valores.filas.forEach((fila, indice) => {
      if (!fila.talle) {
        ctx.addIssue({ code: "custom", path: ["filas", indice, "talle"], message: "Ingresá el talle" });
      }
    });
    marcarTallesRepetidos(valores.filas, ctx, "filas");
  });

export type TallesStockFormValues = z.infer<typeof tallesStockSchema>;

export const preventaSchema = z.object({
  hasta: z
    .string()
    .min(1, "Elegí la fecha y la hora de cierre")
    .refine((valor) => new Date(valor).getTime() > Date.now(), "Tiene que ser una fecha futura"),
  entrega: z.string().trim().max(150, "Hasta 150 caracteres"),
});

export type PreventaFormValues = z.infer<typeof preventaSchema>;

export const cancelarPedidoSchema = z.object({
  motivo: z.string().trim().min(3, "Contale al comprador por qué se cancela").max(300, "Hasta 300 caracteres"),
});

export type CancelarPedidoFormValues = z.infer<typeof cancelarPedidoSchema>;

export const configuracionTiendaSchema = z.object({
  retiroLugar: z.string().trim().max(120, "Es muy largo"),
  retiroDireccion: z.string().trim().max(200, "Es muy largo"),
  retiroHorarios: z.string().trim().max(200, "Es muy largo"),
  umbralUltimasUnidades: z
    .number({ invalid_type_error: "Ingresá un número" })
    .int("Va sin decimales")
    .min(0, "No puede ser negativo")
    .max(100, "Es demasiado alto"),
  horasReserva: z
    .number({ invalid_type_error: "Ingresá las horas" })
    .int("Va sin decimales")
    .min(1, "Al menos 1 hora")
    .max(720, "Hasta 720 horas (30 días)"),
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

// ------------------------------------------------------------------ Compra

const dni = z
  .string()
  .trim()
  .min(1, "Ingresá el DNI")
  .regex(/^\d+$/, "El DNI debe tener solo números, sin puntos")
  .min(7, "El DNI debe tener al menos 7 dígitos")
  .max(8, "El DNI debe tener como máximo 8 dígitos");

/**
 * Datos de la compra. El comprador lo completa solo el invitado: el socio
 * compra con los de su ficha. Quien retira, solo si es otra persona.
 */
export const checkoutSchema = z
  .object({
    esInvitado: z.boolean(),
    comprador: z.object({
      nombre: z.string().trim().max(60, "Es muy largo").toUpperCase(),
      apellido: z.string().trim().max(60, "Es muy largo").toUpperCase(),
      dni: z.string().trim(),
      email: z.string().trim(),
      telefono: z.string().trim().max(30, "Es muy largo"),
    }),
    retiraOtro: z.boolean(),
    retira: z.object({
      nombre: z.string().trim().max(120, "Es muy largo"),
      dni: z.string().trim(),
    }),
    notas: z.string().trim().max(300, "Hasta 300 caracteres"),
    acepta: z.boolean(),
  })
  .superRefine((valores, ctx) => {
    const exigir = (ok: boolean, path: (string | number)[], message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", path, message });
    };

    if (valores.esInvitado) {
      const { comprador } = valores;
      exigir(comprador.nombre.length >= 2, ["comprador", "nombre"], "Ingresá tu nombre");
      exigir(comprador.apellido.length >= 2, ["comprador", "apellido"], "Ingresá tu apellido");
      const dniOk = dni.safeParse(comprador.dni);
      exigir(dniOk.success, ["comprador", "dni"], dniOk.error?.issues[0]?.message ?? "");
      exigir(
        z.string().email().safeParse(comprador.email).success,
        ["comprador", "email"],
        "Ingresá un correo válido: ahí te llega el pedido",
      );
      exigir(comprador.telefono.length >= 6, ["comprador", "telefono"], "Ingresá un teléfono de contacto");
    }

    if (valores.retiraOtro) {
      exigir(valores.retira.nombre.length >= 3, ["retira", "nombre"], "Ingresá nombre y apellido");
      const dniOk = dni.safeParse(valores.retira.dni);
      exigir(dniOk.success, ["retira", "dni"], dniOk.error?.issues[0]?.message ?? "");
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const arrepentimientoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "Ingresá el número de pedido")
    .max(20, "Revisá el número de pedido")
    .toUpperCase(),
  email: z.string().trim().min(1, "Ingresá el correo").email("Ingresá un correo válido"),
  dni,
});

export type ArrepentimientoFormValues = z.infer<typeof arrepentimientoSchema>;

export const resolverArrepentimientoSchema = z
  .object({
    resultado: z.enum(["ACEPTADO", "RECHAZADO"]),
    nota: z.string().trim().max(300, "Hasta 300 caracteres"),
    reponerStock: z.boolean(),
  })
  .superRefine((valores, ctx) => {
    if (valores.resultado === "RECHAZADO" && valores.nota.length < 3) {
      ctx.addIssue({ code: "custom", path: ["nota"], message: "Contale al comprador por qué se rechaza" });
    }
  });

export type ResolverArrepentimientoFormValues = z.infer<typeof resolverArrepentimientoSchema>;
