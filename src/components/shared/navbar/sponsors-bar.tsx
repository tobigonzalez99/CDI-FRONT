import { cn } from "@/lib/utils";

interface Sponsor {
  name: string;
  href?: string;
  /** Ruta del logo en /public/sponsors. Sin logo se muestra el nombre. */
  logoUrl?: string;
}

/**
 * PLACEHOLDER: reemplazar por los sponsors reales del club.
 * Al cargar los logos en /public/sponsors, completar `logoUrl`.
 */
const SPONSORS: Sponsor[] = [
  { name: "Sponsor Principal" },
  { name: "Sponsor Oficial" },
  { name: "Indumentaria" },
  { name: "Auspiciante" },
];

/**
 * Franja superior de sponsors, por encima del navbar.
 * Se oculta en pantallas chicas para no robarle altura al navbar en mobile.
 */
export function SponsorsBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hidden border-b border-white/5 bg-brand-graphite text-white/70 sm:block",
        className,
      )}
    >
      <div className="container mx-auto flex h-9 items-center justify-end gap-x-6 overflow-x-auto px-4">
        <span className="mr-auto shrink-0 text-[11px] font-medium tracking-wide text-white/40 uppercase">
          Nuestros sponsors
        </span>

        {SPONSORS.map((sponsor) => {
          const content = sponsor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- logos de sponsors con alturas variables
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="h-4 w-auto opacity-70 transition-opacity hover:opacity-100"
            />
          ) : (
            <span className="text-[11px] font-medium whitespace-nowrap transition-colors hover:text-white">
              {sponsor.name}
            </span>
          );

          return sponsor.href ? (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
            >
              {content}
            </a>
          ) : (
            <span key={sponsor.name} className="shrink-0">
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}
