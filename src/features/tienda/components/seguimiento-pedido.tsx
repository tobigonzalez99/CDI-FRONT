"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { DetallePedido } from "@/features/tienda/components/detalle-pedido";
import { useSeguimientoPedido } from "@/features/tienda/hooks/use-tienda";
import {
  guardarTokenSeguimiento,
  leerTokenSeguimiento,
  pareceToken,
} from "@/features/tienda/lib/seguimiento";
import { esApiError } from "@/lib/api/errors";

/**
 * Seguimiento de un pedido sin sesión.
 *
 * El enlace del correo trae el token en la URL: se lee una vez, se saca de la
 * barra de direcciones (igual que en /elegir-password, con `no-referrer`) y
 * se manda en el cuerpo. Al volver de la compra llega por sessionStorage.
 */
export function SeguimientoPedido() {
  const [token, setToken] = useState<string | null>(null);
  const [leido, setLeido] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const delEnlace = params.get("token");

    if (delEnlace && pareceToken(delEnlace)) guardarTokenSeguimiento(delEnlace);
    // Solo se saca el token: `nuevo` no tiene nada secreto, y quitarlo acá lo
    // perdería en el segundo montaje que hace React en desarrollo.
    if (params.has("token")) {
      params.delete("token");
      const resto = params.toString();
      window.history.replaceState(null, "", `/tienda/pedido${resto ? `?${resto}` : ""}`);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee la URL y sessionStorage una sola vez, al montar
    setNuevo(params.get("nuevo") === "1");
    setToken(leerTokenSeguimiento());
    setLeido(true);
  }, []);

  const { data: pedido, isPending, isError, error, refetch } = useSeguimientoPedido(token);

  if (!leido || (token && isPending)) return <Cargando etiqueta="Buscando tu pedido…" />;

  const noEncontrado = !token || (isError && esApiError(error) && (error.status === 404 || error.status === 400));

  if (noEncontrado) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <SearchX className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="font-heading text-2xl font-bold">No encontramos el pedido</h1>
        <p className="text-sm text-muted-foreground">
          Abrí el enlace del correo de confirmación de tu compra. Si sos socio, también lo ves
          en «Mis compras» con tu sesión iniciada.
        </p>
        <Link href="/tienda" className={buttonVariants({ size: "lg" })}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  if (isError || !pedido) {
    return (
      <div className="container mx-auto px-4 py-10">
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
      {nuevo && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <CircleCheck className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="font-heading text-lg font-bold">¡Gracias por tu compra!</p>
            <p className="text-sm">
              Te mandamos un correo a {pedido.comprador.email} con este resumen y el enlace para
              volver a verlo.
            </p>
          </div>
        </div>
      )}
      <DetallePedido pedido={pedido} />
    </div>
  );
}
