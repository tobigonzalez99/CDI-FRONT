"use client";

import { TIPOS_TALLE, tipoDeTalles, type TipoTalle } from "@/features/tienda/lib/talles";
import { cn } from "@/lib/utils";

/** Letras, números o a medida: propone los talles según lo que use la marca. */
export function SelectorTipoTalle({
  talles,
  onElegir,
}: {
  talles: string[];
  onElegir: (tipo: TipoTalle) => void;
}) {
  const actual = tipoDeTalles(talles);

  return (
    <fieldset>
      <legend className="text-sm font-medium">Tipo de talle</legend>
      <div className="mt-2 inline-flex rounded-lg border p-1" role="radiogroup">
        {TIPOS_TALLE.map((tipo) => (
          <button
            key={tipo.valor}
            type="button"
            role="radio"
            aria-checked={actual === tipo.valor}
            onClick={() => actual !== tipo.valor && onElegir(tipo.valor)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              actual === tipo.valor
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tipo.etiqueta}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Propone los talles sin tocar el stock. Después podés escribir los que use la marca.
      </p>
    </fieldset>
  );
}
