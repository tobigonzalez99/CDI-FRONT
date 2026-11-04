"use client";

import { usePathname } from "next/navigation";

/**
 * Aviso en las pantallas que todavía son maqueta, con datos fijos: el
 * arrepentimiento y, en el panel, pedidos y ventas (tareas 3 y 4).
 */
const PANTALLAS_DE_MAQUETA: { coincide: (ruta: string) => boolean; texto: string }[] = [
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
