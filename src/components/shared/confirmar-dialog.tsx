"use client";

import { LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  /**
   * Qué va a pasar, en castellano llano. El panel lo usa alguien que no es
   * técnico: tiene que entender la consecuencia sin interpretar nada.
   */
  descripcion: React.ReactNode;
  /** Texto del botón que ejecuta. Repite la acción, nunca dice solo "Aceptar". */
  textoConfirmar: string;
  textoCancelar?: string;
  /** Rojo pleno para lo que corta el acceso o borra; verde para el alta. */
  variante?: "danger" | "success" | "default";
  ejecutando?: boolean;
  onConfirmar: () => void;
}

/**
 * Cartel de confirmación para las acciones que no se deshacen solas.
 *
 * Está acá y no repetido en cada pantalla porque son cuatro acciones que se
 * parecen entre sí —dos rojas, una verde— y lo que las distingue es el texto.
 */
export function ConfirmarDialog({
  open,
  onOpenChange,
  titulo,
  descripcion,
  textoConfirmar,
  textoCancelar = "Cancelar",
  variante = "danger",
  ejecutando = false,
  onConfirmar,
}: ConfirmarDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={ejecutando}
          >
            {textoCancelar}
          </Button>

          <Button
            type="button"
            variant={variante}
            size="lg"
            onClick={onConfirmar}
            disabled={ejecutando}
          >
            {ejecutando && <LoaderCircle className="animate-spin" aria-hidden />}
            {textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
