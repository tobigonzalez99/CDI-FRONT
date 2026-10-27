import { useId } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ESTADOS_CUOTA, ESTADOS_SOCIO, type EstadoCuota, type EstadoSocio } from "@/types/socio";

const ETIQUETAS_ESTADO: Record<EstadoSocio, string> = {
  ALTA: "Activos",
  BAJA: "Dados de baja",
};

const ETIQUETAS_CUOTA: Record<EstadoCuota, string> = {
  AL_DIA: "Al día",
  PENDIENTE: "Pendiente de pago",
};

const CLASES_SELECT =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export interface ValoresFiltros {
  search: string;
  estado: EstadoSocio | "";
  estadoCuota: EstadoCuota | "";
}

interface FiltrosSociosProps {
  valores: ValoresFiltros;
  onChange: (valores: ValoresFiltros) => void;
}

/**
 * Búsqueda y filtros del padrón.
 *
 * Los desplegables son `<select>` nativos a propósito: son pocas opciones
 * fijas, y el control del sistema ya resuelve teclado, lectores de pantalla
 * y el comportamiento esperado en móvil.
 */
export function FiltrosSocios({ valores, onChange }: FiltrosSociosProps) {
  const buscarId = useId();
  const estadoId = useId();
  const cuotaId = useId();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
      <div className="grid gap-1.5">
        <Label htmlFor={buscarId} className="text-xs">
          Buscar
        </Label>
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={buscarId}
            type="search"
            placeholder="Nombre, apellido o DNI"
            className="pl-9"
            value={valores.search}
            onChange={(evento) => onChange({ ...valores, search: evento.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={estadoId} className="text-xs">
          Estado
        </Label>
        <select
          id={estadoId}
          className={cn(CLASES_SELECT)}
          value={valores.estado}
          onChange={(evento) =>
            onChange({ ...valores, estado: evento.target.value as EstadoSocio | "" })
          }
        >
          <option value="">Todos</option>
          {ESTADOS_SOCIO.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETAS_ESTADO[estado]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={cuotaId} className="text-xs">
          Cuota
        </Label>
        <select
          id={cuotaId}
          className={cn(CLASES_SELECT)}
          value={valores.estadoCuota}
          onChange={(evento) =>
            onChange({
              ...valores,
              estadoCuota: evento.target.value as EstadoCuota | "",
            })
          }
        >
          <option value="">Todas</option>
          {ESTADOS_CUOTA.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETAS_CUOTA[estado]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
