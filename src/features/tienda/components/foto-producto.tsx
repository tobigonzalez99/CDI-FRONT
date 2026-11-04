import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ImagenProducto } from "@/types/tienda";

/**
 * Foto cuadrada de un producto. Sin foto cargada se muestra un recuadro
 * neutro: el producto puede publicarse antes de tener la suya.
 */
export function FotoProducto({
  imagen,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  imagen: ImagenProducto | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-neutral-100", className)}>
      {imagen ? (
        <Image
          src={imagen.url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          // En desarrollo la API es localhost y el optimizador rechaza las IP
          // privadas (SSRF), como en las disciplinas. En producción se optimiza.
          unoptimized={process.env.NODE_ENV !== "production"}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-neutral-400">
          <ImageOff className="size-8" aria-hidden />
          <span className="sr-only">Sin foto</span>
        </div>
      )}
    </div>
  );
}
