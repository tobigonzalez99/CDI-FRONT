import Image from "next/image";

import escudoCdi from "@/assets/escudo-cdi.png";
import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  /** El escudo es decorativo cuando va junto al nombre del club. */
  decorative?: boolean;
  /** El del navbar se ve apenas abre la página: conviene no diferirlo. */
  priority?: boolean;
}

/**
 * Escudo del club.
 *
 * Es el escudo oficial recortado con transparencia, así que apoya igual de
 * bien sobre el negro del navbar que sobre el blanco de un diálogo. El alto
 * lo fija quien lo usa con una clase `h-*` y el ancho acompaña.
 */
export function ClubLogo({
  className,
  decorative = true,
  priority = false,
}: ClubLogoProps) {
  return (
    <Image
      src={escudoCdi}
      alt={decorative ? "" : "Escudo del Club Deportivo Independencia"}
      aria-hidden={decorative || undefined}
      priority={priority}
      className={cn("h-10 w-auto", className)}
    />
  );
}
