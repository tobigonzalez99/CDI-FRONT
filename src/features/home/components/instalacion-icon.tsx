import {
  Car,
  Dumbbell,
  Flame,
  Goal,
  Landmark,
  PartyPopper,
  Waves,
  type LucideIcon,
} from "lucide-react";

/**
 * Traduce el `icono` que declara cada instalación en site-config a un
 * componente concreto. Mantener el mapa acá evita que la configuración
 * tenga que importar React.
 */
const ICONOS: Record<string, LucideIcon> = {
  museo: Landmark,
  fogon: Flame,
  futbol: Goal,
  gimnasio: Dumbbell,
  pileta: Waves,
  salon: PartyPopper,
  automovilismo: Car,
};

export function InstalacionIcon({
  icono,
  className,
}: {
  icono: string;
  className?: string;
}) {
  const Icon = ICONOS[icono] ?? Landmark;
  return <Icon className={className} aria-hidden />;
}
