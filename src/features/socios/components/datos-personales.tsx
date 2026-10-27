"use client";

import { useState } from "react";
import { Lock, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditarPerfilDialog } from "@/features/socios/components/editar-perfil-dialog";
import { formatearFecha } from "@/lib/formato";
import type { Socio } from "@/types/socio";

function Dato({
  etiqueta,
  valor,
  soloLectura = false,
}: {
  etiqueta: string;
  valor: string;
  /** Marca los datos que identifican a la persona y solo cambia la administración. */
  soloLectura?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {etiqueta}
        {soloLectura && <Lock className="size-3" aria-label="Solo lectura" />}
      </dt>
      <dd className="text-sm break-words">{valor}</dd>
    </div>
  );
}

/** HU-04: datos del socio. Solo edita teléfono, domicilio, localidad y foto. */
export function DatosPersonales({ socio }: { socio: Socio }) {
  const [editando, setEditando] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Mis datos</CardTitle>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditando(true)}
            >
              <Pencil className="size-3.5" aria-hidden />
              Editar
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato
              etiqueta="Nombre completo"
              valor={`${socio.nombre} ${socio.apellido}`}
              soloLectura
            />
            <Dato etiqueta="DNI" valor={socio.dni} soloLectura />
            <Dato
              etiqueta="Fecha de nacimiento"
              valor={formatearFecha(socio.fechaNacimiento)}
              soloLectura
            />
            <Dato etiqueta="Correo electrónico" valor={socio.email} soloLectura />
            <Dato etiqueta="Teléfono" valor={socio.telefono} />
            <Dato etiqueta="Domicilio" valor={`${socio.domicilio}, ${socio.localidad}`} />
          </dl>

          <p className="flex items-start gap-1.5 border-t pt-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
            Los datos con candado te identifican y los modifica la administración del
            club. Si alguno está mal, escribinos o acercate a la sede.
          </p>
        </CardContent>
      </Card>

      <EditarPerfilDialog socio={socio} open={editando} onOpenChange={setEditando} />
    </>
  );
}
