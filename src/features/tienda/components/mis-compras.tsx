"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, LogIn, PackageSearch, ShoppingBag } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { useSession } from "@/features/auth/hooks/use-session";
import { DetallePedido, EtiquetaEstadoPedido } from "@/features/tienda/components/detalle-pedido";
import { useMiPedido, useMisPedidos } from "@/features/tienda/hooks/use-tienda";
import { esApiError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";

/** Sin sesión de socio no hay compras para mostrar: se le ofrece ingresar. */
function PedirSesion() {
  const [abierto, setAbierto] = useState(false);
  const { user } = useSession();

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="font-heading text-2xl font-bold">Mis compras</h1>
      <p className="text-sm text-muted-foreground">
        {user
          ? "Esta sección es para socios. Si compraste sin cuenta, seguí tu pedido con el enlace del correo."
          : "Ingresá como socio para ver tus compras. Si compraste sin cuenta, seguí tu pedido con el enlace del correo."}
      </p>
      {!user && (
        <Button size="lg" onClick={() => setAbierto(true)}>
          <LogIn aria-hidden />
          Ingresar
        </Button>
      )}
      <LoginDialog open={abierto} onOpenChange={setAbierto} enLaTienda />
    </div>
  );
}

export function MisCompras() {
  const { user, isPending: cargandoSesion } = useSession();
  const [pagina, setPagina] = useState(1);
  const { data, isPending, isError, error, refetch } = useMisPedidos(pagina);

  if (cargandoSesion) return <Cargando etiqueta="Cargando tus compras…" />;
  if (user?.rol !== "SOCIO") return <PedirSesion />;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Mis compras</h1>

      <div className="mt-8">
        {isPending ? (
          <Cargando etiqueta="Cargando tus compras…" />
        ) : isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : data.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
            <PackageSearch className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Todavía no compraste nada en la tienda.</p>
            <Link href="/tienda/productos" className={buttonVariants({ variant: "outline" })}>
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {data.data.map((pedido) => (
                <li key={pedido.codigo}>
                  <Link
                    href={`/tienda/mis-compras/${pedido.codigo}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-lg font-bold">{pedido.codigo}</span>
                        <EtiquetaEstadoPedido estado={pedido.estado} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {format(parseISO(pedido.createdAt), "dd/MM/yyyy")} ·{" "}
                        {(() => {
                          const cantidad = pedido.items.reduce((suma, item) => suma + item.cantidad, 0);
                          return `${cantidad} ${cantidad === 1 ? "producto" : "productos"}`;
                        })()}
                      </p>
                    </div>
                    <span className="font-heading text-xl font-bold tabular-nums">
                      {formatearMonto(pedido.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
                  <ChevronLeft aria-hidden />
                  Más nuevas
                </Button>
                <span className="text-sm text-muted-foreground">
                  {data.page} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina >= data.totalPages}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Más viejas
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function MiCompra({ codigo }: { codigo: string }) {
  const { user, isPending: cargandoSesion } = useSession();
  const { data, isPending, isError, error, refetch } = useMiPedido(codigo);

  if (cargandoSesion) return <Cargando etiqueta="Cargando tu compra…" />;
  if (user?.rol !== "SOCIO") return <PedirSesion />;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Link
        href="/tienda/mis-compras"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Mis compras
      </Link>
      {isPending ? (
        <Cargando etiqueta="Cargando tu compra…" />
      ) : isError ? (
        esApiError(error) && error.status === 404 ? (
          <p className="text-sm text-muted-foreground">No encontramos esa compra entre las tuyas.</p>
        ) : (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        )
      ) : (
        <DetallePedido pedido={data} />
      )}
    </div>
  );
}
