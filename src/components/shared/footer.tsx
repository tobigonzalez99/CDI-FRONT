import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { ClubLogo } from "@/components/shared/club-logo";
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  WhatsappIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/shared/social-icons";
import { hasChildren, NAV_ENTRIES } from "@/components/shared/navbar/nav-config";
import {
  direccionSede,
  mapEmbedUrl,
  mapLinkUrl,
  predio,
  sedeSocial,
  siteConfig,
  whatsappUrl,
} from "@/lib/site-config";

const socialLinks = [
  { label: "Instagram", href: siteConfig.redes.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: siteConfig.redes.facebook, Icon: FacebookIcon },
  { label: "X", href: siteConfig.redes.x, Icon: XIcon },
  { label: "TikTok", href: siteConfig.redes.tiktok, Icon: TiktokIcon },
  { label: "YouTube", href: siteConfig.redes.youtube, Icon: YoutubeIcon },
].filter((link): link is typeof link & { href: string } => Boolean(link.href));

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

          <p className="mt-3 text-xs text-white/40">
            Fundado el{" "}
            <time dateTime={siteConfig.fundacion.iso}>{siteConfig.fundacion.texto}</time>
            {" · "}
            <span className="text-brand-red-soft">{siteConfig.apodo}</span>
          </p>

          {socialLinks.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
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
                {sedeSocial.direccion}
                <br />
                <span className="text-white/50">
                  {siteConfig.localidad} (CP {siteConfig.codigoPostal})
                  <br />
                  {siteConfig.provincia}, {siteConfig.pais}
                </span>
              </span>
            </li>

            {siteConfig.contacto.telefonos.map((telefono) => (
              <li key={telefono.tel} className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-red-soft" aria-hidden />
                <span>
                  <a
                    href={`tel:${telefono.tel}`}
                    className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {telefono.display}
                  </a>
                  <a
                    href={whatsappUrl(
                      telefono.tel,
                      `Hola, me comunico desde la web del ${siteConfig.name}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Escribir por WhatsApp a ${telefono.etiqueta} (se abre en una pestaña nueva)`}
                    className="ml-2 inline-flex items-center gap-1 align-middle text-xs text-white/50 transition-colors hover:text-[#25D366] focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
                  >
                    <WhatsappIcon className="size-3.5" />
                    WhatsApp
                  </a>
                  <br />
                  <span className="text-xs text-white/40">{telefono.etiqueta}</span>
                </span>
              </li>
            ))}

            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-red-soft" aria-hidden />
              <a
                href={`mailto:${siteConfig.contacto.email}`}
                className="break-all text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {siteConfig.contacto.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Mapa */}
        <div>
          <h2 className="font-heading text-xs font-bold tracking-wider text-white/40 uppercase">
            Cómo llegar
          </h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title={`Mapa de la sede social en ${direccionSede}`}
              src={mapEmbedUrl(sedeSocial.direccion)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-44 w-full border-0 grayscale-[0.3]"
            />
          </div>

          <a
            href={mapLinkUrl(sedeSocial.direccion)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
          >
            {sedeSocial.nombre} en Google Maps
          </a>

          {/* El predio está en otra ubicación, con su propio enlace. */}
          <div className="mt-4 border-t border-white/10 pt-4 text-xs text-white/40">
            <p className="text-white/60">{predio.nombre}</p>
            <p className="mt-0.5">{predio.direccion}</p>
            <a
              href={mapLinkUrl(predio.direccion)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
            >
              Ver el predio en Google Maps
            </a>
          </div>
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
