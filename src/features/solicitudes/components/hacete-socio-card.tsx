"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioSolicitud } from "@/features/solicitudes/components/formulario-solicitud";

/**
 * Entrada pública a la solicitud de alta.
 *
 * El formulario arranca plegado detrás del botón: son diez campos más una
 * foto, y desplegarlos de entrada convierte la sección en un trámite antes de
 * que la persona decida asociarse.
 */
export function HacetesocioCard() {
  const [abierto, setAbierto] = useState(false);

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Solicitud de asociación</CardTitle>
        <CardDescription>
          Todos los datos son obligatorios, incluida la foto para el carnet. El
          comentario es opcional.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {abierto ? (
          <FormularioSolicitud />
        ) : (
          <Button
            type="button"
            size="lg"
            className="h-12 w-full text-base"
            onClick={() => setAbierto(true)}
          >
            <UserPlus className="size-4" aria-hidden />
            Hacete socio
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
