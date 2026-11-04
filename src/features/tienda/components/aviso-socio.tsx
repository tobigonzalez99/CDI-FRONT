"use client";

import { useState } from "react";
import { BadgePercent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { useSession } from "@/features/auth/hooks/use-session";
import { useMiDescuento, useProductosTienda } from "@/features/tienda/hooks/use-tienda";

/**
 * Franja del descuento de socio, según quién mira:
 * - invitado: lo invita a ingresar;
 * - socio con descuento: le confirma que ya ve su precio;
 * - socio con la cuota vencida: le dice cómo recuperarlo.
 * A los demás (otra categoría, operadores) no se les muestra nada.
 */
export function AvisoSocio() {
  const [loginAbierto, setLoginAbierto] = useState(false);
  const { user } = useSession();
  const { descuento } = useMiDescuento();
  // La referencia del mayor descuento viene en cualquier producto.
  const { data } = useProductosTienda({ pageSize: 1 });
  const referencia = data?.data[0]?.descuentoSocio ?? null;

  let titulo: string;
  let texto: string;

  if (!user) {
    if (!referencia) return null;
    titulo = `Los socios pagan hasta ${referencia}% menos`;
    texto = "Con la cuota al día. Ingresá con tu DNI y ves tu precio en cada producto.";
  } else if (descuento?.motivo === "APLICA") {
    titulo = "Estás viendo tu precio de socio";
    texto = `Tenés ${descuento.porcentaje}% de descuento en toda la tienda por tener la cuota al día.`;
  } else if (descuento?.motivo === "CUOTA_VENCIDA") {
    titulo = "Poné tu cuota al día y pagá menos";
    texto = "Con la cuota al día tenés descuento de socio en toda la tienda. Podés pagarla desde tu perfil.";
  } else {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-brand-red p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <BadgePercent className="size-10 shrink-0" aria-hidden />
          <div>
            <p className="font-heading text-xl font-bold">{titulo}</p>
            <p className="mt-1 text-sm text-white/85">{texto}</p>
          </div>
        </div>

        {!user && (
          <Button
            variant="outline"
            size="lg"
            className="h-11 shrink-0 border-white bg-transparent px-6 text-white hover:bg-white hover:text-brand-red"
            onClick={() => setLoginAbierto(true)}
          >
            Ingresar como socio
          </Button>
        )}
      </div>

      <LoginDialog open={loginAbierto} onOpenChange={setLoginAbierto} enLaTienda />
    </section>
  );
}
