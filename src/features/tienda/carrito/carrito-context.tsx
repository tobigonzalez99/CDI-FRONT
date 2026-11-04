"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useMiDescuento } from "@/features/tienda/hooks/use-tienda";
import { precioConDescuento } from "@/features/tienda/lib/precio";

/**
 * Carrito de la tienda.
 *
 * Vive en el navegador hasta la tarea 2 (pedido): ahí la API valida el stock
 * y calcula el precio de verdad. Lo que se guarda acá es lo necesario para
 * mostrarlo; el precio que se ve se recalcula con el descuento del socio.
 *
 * Se recuerda en este navegador para no perderlo al recargar. Es una
 * comodidad: si el almacenamiento no está, el carrito funciona igual.
 */

export interface ItemCarrito {
  /** La variante es lo que se compra: un talle, o la única fila sin talle. */
  varianteId: string;
  slug: string;
  nombre: string;
  talle: string | null;
  /** Precio de lista, final con impuestos. */
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
}

interface CarritoValue {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">) => void;
  cambiarCantidad: (varianteId: string, cantidad: number) => void;
  quitar: (varianteId: string) => void;
  vaciar: () => void;
  abierto: boolean;
  setAbierto: (abierto: boolean) => void;
  /** Lo que paga quien está mirando: con su descuento si es socio y le corresponde. */
  precioDe: (precio: number) => number;
  porcentajeSocio: number;
  cantidadTotal: number;
  subtotal: number;
  total: number;
}

const CarritoContext = createContext<CarritoValue | null>(null);

const CLAVE = "cdi-tienda-carrito";

function leerGuardado(): ItemCarrito[] {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    const items: unknown = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(items) ? (items as ItemCarrito[]) : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargado, setCargado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const { descuento } = useMiDescuento();

  // Se lee después de montar: en el servidor no hay almacenamiento, y leerlo
  // al crear el estado haría que el servidor y el navegador dibujen distinto.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage una sola vez, al montar
    setItems(leerGuardado());
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Sin almacenamiento, el carrito dura lo que dura la pestaña.
    }
  }, [items, cargado]);

  const valor = useMemo<CarritoValue>(() => {
    const porcentajeSocio = descuento?.motivo === "APLICA" ? descuento.porcentaje : 0;
    const precioDe = (precio: number) =>
      porcentajeSocio > 0 ? precioConDescuento(precio, porcentajeSocio) : precio;

    return {
      items,
      agregar: (nuevo) => {
        setItems((actuales) => {
          const existe = actuales.some((item) => item.varianteId === nuevo.varianteId);
          return existe
            ? actuales.map((item) =>
                item.varianteId === nuevo.varianteId ? { ...item, cantidad: item.cantidad + 1 } : item,
              )
            : [...actuales, { ...nuevo, cantidad: 1 }];
        });
        setAbierto(true);
      },
      cambiarCantidad: (varianteId, cantidad) =>
        setItems((actuales) =>
          actuales.map((item) => (item.varianteId === varianteId ? { ...item, cantidad } : item)),
        ),
      quitar: (varianteId) =>
        setItems((actuales) => actuales.filter((item) => item.varianteId !== varianteId)),
      vaciar: () => setItems([]),
      abierto,
      setAbierto,
      precioDe,
      porcentajeSocio,
      cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
      subtotal: items.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
      total: items.reduce((suma, item) => suma + precioDe(item.precio) * item.cantidad, 0),
    };
  }, [items, abierto, descuento]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoValue {
  const valor = useContext(CarritoContext);
  if (!valor) throw new Error("useCarrito va dentro de CarritoProvider.");
  return valor;
}
