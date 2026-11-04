"use client";

import { BadgePercent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMaqueta } from "@/features/tienda/maqueta/maqueta-context";
import { DESCUENTO_SOCIO } from "@/features/tienda/maqueta/datos";

/**
 * Franja del descuento de socio. Al invitado lo invita a ingresar; al socio
 * le confirma que ya está viendo su precio.
 */
export function AvisoSocio() {
  const { visitante, setVisitante } = useMaqueta();
  const porcentaje = Math.round(DESCUENTO_SOCIO * 100);

  return (
    <section className="container mx-auto px-4">
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-brand-red p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <BadgePercent className="size-10 shrink-0" aria-hidden />
          {visitante === "socio" ? (
            <div>
              <p className="font-heading text-xl font-bold">Estás viendo tu precio de socio</p>
              <p className="mt-1 text-sm text-white/85">
                Tenés {porcentaje}% de descuento en toda la tienda por tener la cuota al día.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-heading text-xl font-bold">
                Los socios pagan {porcentaje}% menos
              </p>
              <p className="mt-1 text-sm text-white/85">
                Socio Activo y Socio Campeón, con la cuota al día. Ingresá con tu DNI y
                ves tu precio en cada producto.
              </p>
            </div>
          )}
        </div>

        {visitante === "invitado" && (
          <Button
            variant="outline"
            size="lg"
            className="h-11 shrink-0 border-white bg-transparent px-6 text-white hover:bg-white hover:text-brand-red"
            onClick={() => setVisitante("socio")}
          >
            Ingresar como socio
          </Button>
        )}
      </div>
    </section>
  );
}
