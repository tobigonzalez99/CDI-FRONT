"use client";

import { useId, useState } from "react";
import { Check, LoaderCircle, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSocios } from "@/features/admin/hooks/use-socios";
import { useDebounce } from "@/hooks/use-debounce";
import type { Socio } from "@/types/socio";

interface SelectorSocioProps {
  socio: Socio | null;
  onSeleccionar: (socio: Socio | null) => void;
  error?: string;
}

/**
 * Buscador de socios para el cobro.
 *
 * Es búsqueda y no un desplegable con todo el padrón: la lista crece sin
 * techo y nadie encuentra a alguien recorriendo cientos de nombres.
 */
export function SelectorSocio({ socio, onSeleccionar, error }: SelectorSocioProps) {
  const [texto, setTexto] = useState("");
  const buscarId = useId();
  const busqueda = useDebounce(texto);

  const { data, isFetching } = useSocios({
    page: 1,
    pageSize: 8,
    search: busqueda || undefined,
    estado: "ALTA",
    sortBy: "apellido",
    sortOrder: "asc",
  });

  if (socio) {
    return (
      <div className="grid gap-2">
        <Label>Socio</Label>
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {socio.apellido}, {socio.nombre}
            </p>
            <p className="text-xs text-muted-foreground">
              N° {socio.numeroSocio} · DNI {socio.dni} · {socio.tipoSocio.nombre}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onSeleccionar(null)}
            aria-label="Elegir otro socio"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={buscarId}>Socio</Label>

      <div className="relative">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={buscarId}
          type="search"
          className="pl-9"
          placeholder="Buscá por nombre, apellido o DNI"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${buscarId}-error` : undefined}
        />
        {isFetching && (
          <LoaderCircle
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        )}
      </div>

      {error && (
        <p id={`${buscarId}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {data && (
        <ul className="max-h-60 overflow-y-auto rounded-lg border">
          {data.data.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">
              Ningún socio activo coincide con la búsqueda.
            </li>
          ) : (
            data.data.map((candidato) => (
              <li key={candidato.id} className="border-b last:border-0">
                <button
                  type="button"
                  onClick={() => onSeleccionar(candidato)}
                  className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {candidato.apellido}, {candidato.nombre}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      N° {candidato.numeroSocio} · DNI {candidato.dni}
                    </span>
                  </span>
                  <Check className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
