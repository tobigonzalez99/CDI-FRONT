import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RETIRO } from "@/features/tienda/maqueta/datos";

export const metadata: Metadata = { title: "Ajustes" };

const CATEGORIAS_SOCIO = [
  { nombre: "Socio Activo", descuento: 15 },
  { nombre: "Socio Campeón", descuento: 15 },
];

/** Lo que se configura una vez y cambia poco: descuentos de socio y retiro. */
export default function PanelAjustesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Ajustes de la tienda</h1>
        <p className="text-sm text-muted-foreground">Cambian lo que ve el comprador en toda la tienda.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Descuento de socio</CardTitle>
            <CardDescription>
              Vale para quien está de alta y con la cuota al día. Con 0 % esa categoría no tiene
              descuento.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {CATEGORIAS_SOCIO.map((categoria) => (
              <div key={categoria.nombre} className="flex items-center justify-between gap-4">
                <Label htmlFor={categoria.nombre}>{categoria.nombre}</Label>
                <div className="flex items-center gap-2">
                  <Input id={categoria.nombre} defaultValue={categoria.descuento} inputMode="numeric" className="h-10 w-20 text-right" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <Button className="justify-self-end">Guardar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Retiro en el club</CardTitle>
            <CardDescription>Aparece en la ficha, en el carrito, en la compra y en los correos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="r-lugar">Lugar</Label>
              <Input id="r-lugar" defaultValue={RETIRO.lugar} className="h-10" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r-dir">Dirección</Label>
              <Input id="r-dir" defaultValue={RETIRO.direccion} className="h-10" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r-hor">Horarios</Label>
              <Input id="r-hor" defaultValue={RETIRO.horarios} className="h-10" />
            </div>
            <Button className="justify-self-end">Guardar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
