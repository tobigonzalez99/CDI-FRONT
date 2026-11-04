import Link from "next/link";
import { Store, Undo2 } from "lucide-react";

import { ClubLogo } from "@/components/shared/club-logo";
import { RETIRO, VENDEDOR } from "@/features/tienda/maqueta/datos";

/**
 * Pie de la tienda, con lo que la ley pide a la vista en una venta online:
 * botón de arrepentimiento (Res. 424/2020), enlace a Defensa del Consumidor
 * (Res. 38/2020), los datos de quien vende y los términos.
 */
export function TiendaFooter() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <ClubLogo className="h-12" />
            <span className="font-heading leading-tight">
              <span className="block text-xs tracking-[0.2em] text-white/60 uppercase">
                Tienda oficial
              </span>
              <span className="block font-bold">Club Deportivo Independencia</span>
            </span>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-white/70">
            <Store className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Retiro en {RETIRO.lugar.toLowerCase()}: {RETIRO.direccion}.
              <br />
              {RETIRO.horarios}.
            </span>
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Ayuda</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/tienda/pedido/T-0142" className="hover:text-white">
                Seguir mi pedido
              </Link>
            </li>
            <li>
              <Link href="/tienda/productos" className="hover:text-white">
                Guía de talles
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Términos y condiciones
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Política de privacidad
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/tienda/arrepentimiento"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
          >
            <Undo2 className="size-4" aria-hidden />
            Botón de arrepentimiento
          </Link>
          <p className="text-xs text-white/50">
            <a
              href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              Defensa de las y los consumidores. Para reclamos ingrese aquí
            </a>
          </p>
          <p className="text-xs text-white/50">
            {VENDEDOR.razonSocial} · CUIT {VENDEDOR.cuit}
            <br />
            {VENDEDOR.domicilio}
          </p>
        </div>
      </div>

      <p className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        Todos los precios son finales, con impuestos incluidos.
      </p>
    </footer>
  );
}
