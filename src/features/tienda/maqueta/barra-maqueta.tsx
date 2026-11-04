"use client";

import { usePathname } from "next/navigation";

/**
 * Aviso en las pantallas que todavía son maqueta, con datos fijos: la compra
 * y el seguimiento (tarea 2 y 3) y, en el panel, pedidos y ventas (tareas 3
 * y 4). El catálogo ya está conectado y no lo lleva.
 */
const PANTALLAS_DE_MAQUETA: { coincide: (ruta: string) => boolean; texto: string }[] = [
  { coincide: (ruta) => ruta.startsWith("/tienda/checkout"), texto: "La compra todavía no está habilitada: se conecta en la tarea 2." },
  { coincide: (ruta) => ruta.startsWith("/tienda/pedido"), texto: "Seguimiento de pedido de ejemplo: se conecta en la tarea 3." },
  { coincide: (ruta) => ruta.startsWith("/tienda/arrepentimiento"), texto: "Formulario de ejemplo: se conecta con los pedidos." },
  { coincide: (ruta) => ruta.startsWith("/tienda/panel/pedidos"), texto: "Pedidos de ejemplo: se conectan en la tarea 3." },
  { coincide: (ruta) => ruta === "/tienda/panel", texto: "Ventas de ejemplo: el dashboard se conecta en la tarea 4." },
];

export function BarraMaqueta() {
  const ruta = usePathname();
  const pantalla = PANTALLAS_DE_MAQUETA.find((item) => item.coincide(ruta));

  if (!pantalla) return null;

  return (
    <div className="bg-amber-300 text-amber-950">
      <p className="container mx-auto px-4 py-1.5 text-xs font-medium">{pantalla.texto}</p>
    </div>
  );
}
