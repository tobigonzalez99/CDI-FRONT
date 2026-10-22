import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  /** El escudo es decorativo cuando va junto al nombre del club. */
  decorative?: boolean;
}

/**
 * Escudo del club.
 *
 * PLACEHOLDER: reproduce la forma del escudo real (franjas rojo/negro con
 * monograma blanco y estrellas) hasta que tengamos el SVG oficial. Al
 * reemplazarlo, mantener la misma interfaz para no tocar los consumidores.
 */
export function ClubLogo({ className, decorative = true }: ClubLogoProps) {
  return (
    <svg
      viewBox="0 0 64 72"
      className={cn("h-10 w-auto", className)}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "Escudo del Club Deportivo Independencia"}
    >
      <defs>
        <clipPath id="cdi-shield">
          <path d="M32 1 L62 10 V38 C62 55 47 66 32 71 C17 66 2 55 2 38 V10 Z" />
        </clipPath>
      </defs>

      <g clipPath="url(#cdi-shield)">
        <rect x="0" y="0" width="64" height="72" fill="var(--brand-black)" />
        <rect x="8" y="0" width="8" height="72" fill="var(--brand-red)" />
        <rect x="24" y="0" width="8" height="72" fill="var(--brand-red)" />
        <rect x="40" y="0" width="8" height="72" fill="var(--brand-red)" />
        <rect x="56" y="0" width="8" height="72" fill="var(--brand-red)" />
        <rect x="0" y="22" width="64" height="26" fill="#ffffff" />
      </g>

      <path
        d="M32 1 L62 10 V38 C62 55 47 66 32 71 C17 66 2 55 2 38 V10 Z"
        fill="none"
        stroke="var(--brand-black)"
        strokeWidth="3"
      />

      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fontFamily="var(--font-heading, system-ui), sans-serif"
        fill="var(--brand-black)"
        letterSpacing="0.5"
      >
        CDI
      </text>
    </svg>
  );
}
