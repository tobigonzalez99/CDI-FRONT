"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMaqueta, type Visitante } from "@/features/tienda/maqueta/maqueta-context";
import { cn } from "@/lib/utils";

const VISTAS: { valor: Visitante; etiqueta: string }[] = [
  { valor: "invitado", etiqueta: "Invitado" },
  { valor: "socio", etiqueta: "Socio" },
];

/**
 * Tira de arriba que dice que esto es una maqueta y deja cambiar cómo se
 * mira. No va en la tienda real.
 */
export function BarraMaqueta() {
  const { visitante, setVisitante } = useMaqueta();
  const enPanel = usePathname().startsWith("/tienda/panel");

  return (
    <div className="bg-amber-300 text-amber-950">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-1.5 text-xs">
        <p className="font-medium">Maqueta de la tienda · datos de ejemplo, sin conectar</p>

        <div className="flex items-center gap-3">
          {!enPanel && (
            <div className="flex items-center gap-1" role="group" aria-label="Ver la tienda como">
              <span>Ver como:</span>
              {VISTAS.map(({ valor, etiqueta }) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={visitante === valor}
                  onClick={() => setVisitante(valor)}
                  className={cn(
                    "rounded-full px-2 py-0.5 font-semibold",
                    visitante === valor ? "bg-amber-950 text-amber-50" : "hover:bg-amber-400",
                  )}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          )}
          <Link href={enPanel ? "/tienda" : "/tienda/panel"} className="font-semibold underline underline-offset-2">
            {enPanel ? "Ver la tienda" : "Ver el panel"}
          </Link>
        </div>
      </div>
    </div>
  );
}
