import type { Metadata } from "next";
import { Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

/**
 * Botón de arrepentimiento (Res. 424/2020): pedir la revocación de una compra
 * dentro de los 10 días, sin dar motivo. Pendiente de que Tobías lo confirme;
 * la ley lo exige en toda venta online.
 */
export default function ArrepentimientoPage() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-10 md:py-14">
      <Undo2 className="size-8 text-brand-red" aria-hidden />
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">Botón de arrepentimiento</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tenés 10 días corridos desde que retiraste tu compra para arrepentirte, sin dar motivo.
        Completá el número de pedido y te respondemos por correo con un código de trámite.
      </p>

      <form className="mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pedido">Número de pedido</Label>
          <Input id="pedido" placeholder="Por ejemplo: T-0142" className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="correo">Correo con el que compraste</Label>
          <Input id="correo" type="email" className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dni">DNI</Label>
          <Input id="dni" inputMode="numeric" className="h-11" />
        </div>
        <Button type="button" size="lg" className="mt-2 h-12 text-base">
          Arrepentirme de la compra
        </Button>
      </form>
    </div>
  );
}
