import { ExternalLink, MapPin } from "lucide-react";

import { mapLinkUrl, siteConfig } from "@/lib/site-config";
import { InstalacionIcon } from "./instalacion-icon";

/**
 * Sección institucional breve de la home.
 *
 * Muestra los datos generales del club y sus dos ubicaciones con las
 * instalaciones de cada una. El detalle de cada espacio irá en sus páginas
 * propias; acá solo va el panorama.
 */
export function ClubSection() {
  const añosDeHistoria = new Date().getFullYear() - siteConfig.fundacion.anio;

  return (
    <section
      aria-labelledby="el-club-titulo"
      className="border-b border-border bg-background py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-wider text-brand-red uppercase">
              El club
            </p>

            <h2
              id="el-club-titulo"
              className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
            >
              {añosDeHistoria} años de historia en {siteConfig.localidad}
            </h2>

            <p className="mt-5 text-pretty text-muted-foreground">
              El Club Deportivo Independencia fue fundado el{" "}
              <time dateTime={siteConfig.fundacion.iso} className="font-medium text-foreground">
                {siteConfig.fundacion.texto}
              </time>
              . Conocido como{" "}
              <span className="font-semibold text-brand-red">{siteConfig.apodo}</span>, hoy
              reúne fútbol masculino, femenino, inferiores y escuelita, y sostiene una sede
              social y un predio deportivo abiertos a toda la comunidad.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <dt className="text-xs text-muted-foreground">Fundación</dt>
                <dd className="mt-1 font-heading text-2xl font-bold">
                  {siteConfig.fundacion.anio}
                </dd>
              </div>
              <div className="rounded-xl border border-border p-4">
                <dt className="text-xs text-muted-foreground">Apodo</dt>
                <dd className="mt-1 font-heading text-2xl font-bold text-brand-red">
                  {siteConfig.apodo}
                </dd>
              </div>
            </dl>
          </div>

          {/* Ubicaciones e instalaciones */}
          <div className="grid gap-5 sm:grid-cols-2">
            {siteConfig.sedes.map((sede) => (
              <article
                key={sede.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-heading text-lg leading-tight font-bold text-balance">
                  {sede.nombre}
                </h3>

                {"descripcion" in sede && (
                  <p className="mt-1 text-sm text-muted-foreground">{sede.descripcion}</p>
                )}

                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden />
                  {sede.direccion}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5">
                  {sede.instalaciones.map((instalacion) => (
                    <li key={instalacion.nombre} className="flex items-start gap-2.5 text-sm">
                      <InstalacionIcon
                        icono={instalacion.icono}
                        className="mt-0.5 size-4 shrink-0 text-brand-red"
                      />
                      <span>
                        {instalacion.nombre}
                        {"detalle" in instalacion && instalacion.detalle && (
                          <span className="text-muted-foreground">
                            {" · "}
                            {instalacion.detalle}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={mapLinkUrl(sede.direccion)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-red underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Cómo llegar
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
