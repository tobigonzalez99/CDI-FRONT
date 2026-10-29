"use client";

import QRCode from "react-qr-code";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CarnetSocio } from "@/types/socio";

interface QrGrandeDialogProps {
  socio: CarnetSocio;
  carnetUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * El QR en grande, para que lo escaneen desde la pantalla del teléfono.
 *
 * En el carnet el QR ocupa el lugar que le da el diseño, y en un teléfono eso
 * queda demasiado chico para que otra cámara lo lea. Acá va a pantalla
 * completa, en negro sobre blanco y con su margen, que es como mejor engancha
 * cualquier lector.
 */
export function QrGrandeDialog({
  socio,
  carnetUrl,
  open,
  onOpenChange,
}: QrGrandeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Tu código QR</DialogTitle>
          <DialogDescription>
            Mostrale esta pantalla a quien cobra la entrada. Si está oscuro, subí el
            brillo del teléfono.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto w-full max-w-72 rounded-xl bg-white p-4">
          <QRCode
            value={carnetUrl}
            level="M"
            viewBox="0 0 256 256"
            style={{ width: "100%", height: "auto" }}
            title="Código QR de tu carnet"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Socio N° {socio.numeroSocio} · {socio.nombre} {socio.apellido}
        </p>
      </DialogContent>
    </Dialog>
  );
}
