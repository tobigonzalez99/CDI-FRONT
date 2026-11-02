"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EVENTO_ABRIR_SOLICITUD,
  type DetalleAbrirSolicitud,
} from "@/features/socios/components/categorias-socio";
import { FormularioSolicitud } from "@/features/solicitudes/components/formulario-solicitud";

/**
 * Entrada pública a la solicitud de alta.
 *
 * El formulario arranca plegado detrás del botón: son diez campos más una
 * foto, y desplegarlos de entrada convierte la sección en un trámite antes de
 * que la persona decida asociarse.
 *
 * El "Asociarme" de cada tarjeta de categoría lo abre con esa categoría ya
 * elegida, para no hacerle elegir dos veces lo mismo.
 */
export function HacetesocioCard() {
  const [abierto, setAbierto] = useState(false);
  const [tipoElegido, setTipoElegido] = useState<{ nombre: string; vez: number } | null>(
    null,
  );

  useEffect(() => {
    function alElegirCategoria(evento: Event) {
      const { nombreTipo } = (evento as CustomEvent<DetalleAbrirSolicitud>).detail;
      setAbierto(true);
      // `vez` hace que elegir de nuevo la misma categoría vuelva a aplicarse.
      setTipoElegido((anterior) => ({ nombre: nombreTipo, vez: (anterior?.vez ?? 0) + 1 }));
    }

    window.addEventListener(EVENTO_ABRIR_SOLICITUD, alElegirCategoria);
    return () => window.removeEventListener(EVENTO_ABRIR_SOLICITUD, alElegirCategoria);
  }, []);

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
          <FormularioSolicitud tipoElegido={tipoElegido} />
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
