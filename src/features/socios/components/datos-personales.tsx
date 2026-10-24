import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearFecha } from "@/lib/formato";
import type { Socio } from "@/types/socio";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm break-words">{valor}</dd>
    </div>
  );
}

/** HU-04: datos personales del socio. Solo lectura: los edita la administración. */
export function DatosPersonales({ socio }: { socio: Socio }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Mis datos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="Nombre completo" valor={`${socio.nombre} ${socio.apellido}`} />
          <Dato etiqueta="DNI" valor={socio.dni} />
          <Dato etiqueta="Fecha de nacimiento" valor={formatearFecha(socio.fechaNacimiento)} />
          <Dato etiqueta="Teléfono" valor={socio.telefono} />
          <Dato etiqueta="Correo electrónico" valor={socio.email} />
          <Dato etiqueta="Domicilio" valor={`${socio.domicilio}, ${socio.localidad}`} />
        </dl>

        <p className="border-t pt-3 text-xs text-muted-foreground">
          ¿Encontrás algún dato desactualizado? Escribinos o acercate a la sede para
          que la administración lo corrija.
        </p>
      </CardContent>
    </Card>
  );
}
