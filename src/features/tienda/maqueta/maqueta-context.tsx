"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { precioSocio, type ProductoTienda } from "@/features/tienda/maqueta/datos";

/**
 * Estado de la maqueta: el carrito y "cómo se mira" la tienda.
 *
 * En la tienda real el carrito y el precio los calcula la API; acá todo vive
 * en memoria para poder recorrer las pantallas. El selector "Ver como" deja
 * comparar lo que ve un invitado con lo que ve un socio con descuento.
 */

export type Visitante = "invitado" | "socio";

export interface ItemCarrito {
  producto: ProductoTienda;
  talle?: string;
  cantidad: number;
}

interface MaquetaValue {
  visitante: Visitante;
  setVisitante: (visitante: Visitante) => void;
  items: ItemCarrito[];
  agregar: (producto: ProductoTienda, talle?: string) => void;
  cambiarCantidad: (indice: number, cantidad: number) => void;
  quitar: (indice: number) => void;
  vaciar: () => void;
  carritoAbierto: boolean;
  setCarritoAbierto: (abierto: boolean) => void;
  /** Precio que paga quien está mirando. */
  precioDe: (producto: ProductoTienda) => number;
  cantidadTotal: number;
  subtotal: number;
  total: number;
}

const MaquetaContext = createContext<MaquetaValue | null>(null);

const CARRITO_INICIAL = (): ItemCarrito[] => [];

export function MaquetaProvider({ children }: { children: React.ReactNode }) {
  const [visitante, setVisitante] = useState<Visitante>("invitado");
  const [items, setItems] = useState<ItemCarrito[]>(CARRITO_INICIAL);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const valor = useMemo<MaquetaValue>(() => {
    const precioDe = (producto: ProductoTienda) =>
      visitante === "socio" ? precioSocio(producto.precio) : producto.precio;

    const subtotal = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
    const total = items.reduce((suma, item) => suma + precioDe(item.producto) * item.cantidad, 0);

    return {
      visitante,
      setVisitante,
      items,
      agregar: (producto, talle) => {
        setItems((actuales) => {
          const indice = actuales.findIndex(
            (item) => item.producto.slug === producto.slug && item.talle === talle,
          );
          if (indice === -1) return [...actuales, { producto, talle, cantidad: 1 }];
          return actuales.map((item, i) =>
            i === indice ? { ...item, cantidad: item.cantidad + 1 } : item,
          );
        });
        setCarritoAbierto(true);
      },
      cambiarCantidad: (indice, cantidad) =>
        setItems((actuales) =>
          actuales.map((item, i) => (i === indice ? { ...item, cantidad } : item)),
        ),
      quitar: (indice) => setItems((actuales) => actuales.filter((_, i) => i !== indice)),
      vaciar: () => setItems([]),
      carritoAbierto,
      setCarritoAbierto,
      precioDe,
      cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
      subtotal,
      total,
    };
  }, [visitante, items, carritoAbierto]);

  return <MaquetaContext.Provider value={valor}>{children}</MaquetaContext.Provider>;
}

export function useMaqueta(): MaquetaValue {
  const valor = useContext(MaquetaContext);
  if (!valor) throw new Error("useMaqueta va dentro de MaquetaProvider.");
  return valor;
}
