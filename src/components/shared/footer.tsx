import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { ClubLogo } from "@/components/shared/club-logo";
import { FacebookIcon, InstagramIcon } from "@/components/shared/social-icons";
import { hasChildren, NAV_ENTRIES } from "@/components/shared/navbar/nav-config";
import { mapQuery, siteConfig } from "@/lib/site-config";

const socialLinks = [
  { label: "Instagram", href: siteConfig.redes.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: siteConfig.redes.facebook, Icon: FacebookIcon },
].filter((link): link is typeof link & { href: string } => Boolean(link.href));

const contactItems = [
  { Icon: MapPin, label: "Dirección", value: siteConfig.contacto.direccion },
  { Icon: Phone, label: "Teléfono", value: siteConfig.contacto.telefono, href: `tel:` },
  { Icon: Mail, label: "Correo", value: siteConfig.contacto.email, href: `mailto:` },
];

/** Enlaces del menú aplanados: las subsecciones de Fútbol se listan sueltas. */
const footerLinks = NAV_ENTRIES.flatMap((entry) =>
  hasChildren(entry) ? entry.children : [entry],
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* Identidad + redes */}
        <div>
          <div className="flex items-center gap-3">
            <ClubLogo className="h-12" />
            <span className="font-heading text-sm leading-tight font-bold">
              Club Deportivo
              <br />
              Independencia
            </span>
          </div>

          <p className="mt-4 text-sm text-white/60">{siteConfig.description}</p>

          {socialLinks.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} del club (se abre en una pestaña nueva)`}
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-brand-red hover:bg-brand-red hover:text-white focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Secciones */}
        <nav aria-labelledby="footer-secciones">
          <h2
            id="footer-secciones"
            className="font-heading text-xs font-bold tracking-wider text-white/40 uppercase"
          >
            Secciones
          </h2>
          <ul className="mt-4 space-y-2.5">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contacto */}
        <div>
          <h2 className="font-heading text-xs font-bold tracking-wider text-white/40 uppercase">
            Contacto
          </h2>

          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5 text-white/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red-soft" aria-hidden />
              <span>
                {siteConfig.localidad}
                <br />
                <span className="text-white/50">{siteConfig.provincia}, Argentina</span>
              </span>
            </li>

            {contactItems.map(({ Icon, label, value, href }) =>
              value ? (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-brand-red-soft" aria-hidden />
                  {href ? (
                    <a
                      href={`${href}${value}`}
                      className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="text-white/70">{value}</span>
                  )}
                </li>
              ) : null,
            )}
          </ul>
        </div>

        {/* Mapa */}
        <div>
          <h2 className="font-heading text-xs font-bold tracking-wider text-white/40 uppercase">
            Cómo llegar
          </h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title={`Mapa de ${siteConfig.localidad}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-44 w-full border-0 grayscale-[0.3]"
            />
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
          >
            Abrir en Google Maps
          </a>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p>{siteConfig.localidad}, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
