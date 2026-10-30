"use client";

import { useState } from "react";
import { Check, Copy, MailCheck, TriangleAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CreateSocioResponse } from "@/types/socio";

/**
 * La contraseña inicial se devuelve **una sola vez**, al dar de alta.
 *
 * Por eso no se cierra clickeando afuera: un clic al pasar perdería la clave
 * y el socio quedaría sin poder entrar, sin forma de volver a consultarla.
 * Escape sí cierra, porque es una pulsación deliberada y quitarla dejaría el
 * diálogo sin salida por teclado.
 */
export function PasswordInicialDialog({
  resultado,
  onClose,
}: {
  resultado: CreateSocioResponse | null;
  onClose: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.passwordInicial);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles queda la opción de seleccionarla a mano.
      setCopiado(false);
    }
  }

  function cerrar() {
    setCopiado(false);
    onClose();
  }

  return (
    <Dialog
      open={Boolean(resultado)}
      onOpenChange={(abierto) => !abierto && cerrar()}
      disablePointerDismissal
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-heading">Socio dado de alta</DialogTitle>
          <DialogDescription>
            {resultado && (
              <>
                {resultado.socio.nombre} {resultado.socio.apellido} ya figura en el
                padrón con el número {resultado.socio.numeroSocio}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/*
            Con el correo enviado, la clave es solo un respaldo; sin correo, es
            la única forma de que la persona entre. Los dos avisos lo dicen
            así para que el admin sepa si tiene que entregarla sí o sí.
          */}
          {resultado?.correoBienvenidaEnviado ? (
            <p className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
              <MailCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <span>
                Le mandamos un correo a <strong>{resultado.socio.email}</strong> para que
                elija su contraseña. Si no lo recibe, esta es su clave inicial. No se puede
                volver a consultar: copiala ahora.
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              No se pudo enviar el correo de bienvenida. Entregale esta clave inicial:
              no se puede volver a consultar, así que copiala ahora.
            </p>
          )}

          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Contraseña inicial</p>
            <p className="mt-1 font-mono text-xl font-bold break-all select-all">
              {resultado?.passwordInicial}
            </p>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={copiar}>
            {copiado ? (
              <>
                <Check className="size-4" aria-hidden />
                Copiada
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden />
                Copiar contraseña
              </>
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" onClick={cerrar}>
            Ya la copié, cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
