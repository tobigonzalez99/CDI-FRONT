"use client";

import { ClipboardList, MailCheck, UserCheck } from "lucide-react";

import { useSession } from "@/features/auth/hooks/use-session";
import { BloqueSocio } from "@/features/solicitudes/components/bloque-socio";

const PASOS = [
  {
    Icono: ClipboardList,
    titulo: "Completá la solicitud",
    detalle: "Elegí la categoría y cargá tus datos y una foto para el carnet.",
  },
  {
    Icono: UserCheck,
    titulo: "El club te da de alta",
    detalle: "La administración revisa tu solicitud y te suma al padrón de socios.",
  },
  {
    Icono: MailCheck,
    titulo: "Entrás al sitio",
    detalle: "Te llega un correo para elegir tu contraseña y ver tu carnet digital.",
  },
];

/**
 * El final de "Hacete socio": cómo asociarse y el formulario.
 *
 * A quien ya entró como socio no le explica cómo asociarse —ya lo es—: le
 * muestra directamente lo suyo, que arma `BloqueSocio`.
 */
export function SeccionAsociarse() {
  const { user, isPending } = useSession();
  const yaTieneCuenta = !isPending && Boolean(user);

  return (
    // `scroll-mt` deja lugar a la barra fija al llegar desde "Asociarme".
    <section id="solicitud" aria-labelledby="asociarse-titulo" className="scroll-mt-28">
      {!yaTieneCuenta && (
        <>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-wider text-brand-red uppercase">
              Asociate
            </p>
            <h2
              id="asociarse-titulo"
              className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
            >
              Cómo hacerte socio
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Socio Activo y Socio Protector se piden desde acá, en pocos minutos. Socio
              Juvenil y Socio Campeón se tramitan en la sede del club.
            </p>
          </div>

          <ol className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {PASOS.map(({ Icono, titulo, detalle }, indice) => (
              <li key={titulo} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-red font-heading text-sm font-bold text-white">
                    {indice + 1}
                  </span>
                  <Icono className="size-5 text-brand-red" aria-hidden />
                </div>
                <h3 className="mt-4 font-heading font-bold">{titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{detalle}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className={yaTieneCuenta ? undefined : "mt-10"}>
        <BloqueSocio />
      </div>
    </section>
  );
}
