"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarCategoria,
  actualizarConfiguracion,
  actualizarDescuentoTienda,
  actualizarProducto,
  actualizarVariante,
  agregarTalle,
  eliminarTalle,
  borrarImagen,
  cambiarEstadoOperador,
  cambiarEstadoPedido,
  crearCategoria,
  crearOperador,
  crearProducto,
  listarCategoriasAdmin,
  listarMovimientos,
  listarOperadores,
  listarPedidosAdmin,
  listarProductosAdmin,
  moverStock,
  obtenerConfiguracionAdmin,
  obtenerProductoAdmin,
  obtenerVentas,
  ordenarImagenes,
  resetearPasswordOperador,
  subirImagenes,
} from "@/features/tienda/api/tienda-admin.api";
import { TIENDA_QUERY_KEY } from "@/features/tienda/hooks/use-tienda";
import type { EstadoPedido, FiltrosPedidosAdmin, FiltrosProductosAdmin, ProductoAdmin } from "@/types/tienda";

const PANEL_KEY = [...TIENDA_QUERY_KEY, "panel"] as const;
const PRODUCTOS_KEY = [...PANEL_KEY, "productos"] as const;

export function useVentasTienda() {
  return useQuery({ queryKey: [...PANEL_KEY, "ventas"], queryFn: obtenerVentas });
}

export function usePedidosAdmin(filtros: FiltrosPedidosAdmin) {
  return useQuery({
    queryKey: [...PANEL_KEY, "pedidos", filtros],
    queryFn: () => listarPedidosAdmin(filtros),
    placeholderData: keepPreviousData,
  });
}

/**
 * Refresca también si falla: otro operador pudo cambiar el pedido antes, y
 * cancelar devuelve stock, por eso se invalida todo el panel.
 */
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codigo, ...input }: { codigo: string; estado: EstadoPedido; motivo?: string }) =>
      cambiarEstadoPedido(codigo, input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: PANEL_KEY }),
  });
}

export function useCategoriasAdmin() {
  return useQuery({ queryKey: [...PANEL_KEY, "categorias"], queryFn: listarCategoriasAdmin });
}

export function useProductosAdmin(filtros: FiltrosProductosAdmin) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, "lista", filtros],
    queryFn: () => listarProductosAdmin(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useProductoAdmin(id: string | null) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, "uno", id],
    queryFn: () => obtenerProductoAdmin(id!),
    enabled: Boolean(id),
  });
}

export function useMovimientosStock(productoId: string, page: number) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, "movimientos", productoId, page],
    queryFn: () => listarMovimientos(productoId, { page, pageSize: 10 }),
    placeholderData: keepPreviousData,
  });
}

export function useConfiguracionAdmin() {
  return useQuery({ queryKey: [...PANEL_KEY, "configuracion"], queryFn: obtenerConfiguracionAdmin });
}

export function useOperadores() {
  return useQuery({ queryKey: [...PANEL_KEY, "operadores"], queryFn: listarOperadores });
}

/**
 * Cada cambio de un producto devuelve el producto entero: se guarda tal cual
 * y se invalida el resto (listas, movimientos y la tienda pública).
 */
function useAlGuardarProducto() {
  const queryClient = useQueryClient();

  return (producto: ProductoAdmin) => {
    queryClient.setQueryData([...PRODUCTOS_KEY, "uno", producto.id], producto);
    void queryClient.invalidateQueries({
      queryKey: TIENDA_QUERY_KEY,
      predicate: (query) => query.queryKey[3] !== "uno",
    });
  };
}

export function useCrearProducto() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({ mutationFn: crearProducto, onSuccess: alGuardar });
}

export function useActualizarProducto() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof actualizarProducto>[1] }) =>
      actualizarProducto(id, input),
    onSuccess: alGuardar,
  });
}

export function useAgregarTalle() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({
    mutationFn: ({ productoId, ...input }: { productoId: string; talle: string; stock?: number }) =>
      agregarTalle(productoId, input),
    onSuccess: alGuardar,
  });
}

export function useActualizarVariante() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; talle?: string; orden?: number; activa?: boolean }) =>
      actualizarVariante(id, input),
    onSuccess: alGuardar,
  });
}

export function useEliminarTalle() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({ mutationFn: eliminarTalle, onSuccess: alGuardar });
}

export function useMoverStock() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({
    mutationFn: ({ varianteId, ...input }: { varianteId: string } & Parameters<typeof moverStock>[1]) =>
      moverStock(varianteId, input),
    onSuccess: alGuardar,
  });
}

export function useSubirImagenes() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({
    mutationFn: ({ productoId, archivos }: { productoId: string; archivos: File[] }) =>
      subirImagenes(productoId, archivos),
    onSuccess: alGuardar,
  });
}

export function useOrdenarImagenes() {
  const alGuardar = useAlGuardarProducto();
  return useMutation({
    mutationFn: ({ productoId, ids }: { productoId: string; ids: string[] }) =>
      ordenarImagenes(productoId, ids),
    onSuccess: alGuardar,
  });
}

/** Borrar no devuelve el producto: se vuelve a pedir. */
export function useBorrarImagen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: borrarImagen,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY }),
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY }),
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof actualizarCategoria>[1]) =>
      actualizarCategoria(id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY }),
  });
}

export function useActualizarConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarConfiguracion,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY }),
  });
}

export function useCrearOperador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearOperador,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...PANEL_KEY, "operadores"] }),
  });
}

export function useCambiarEstadoOperador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => cambiarEstadoOperador(id, activo),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...PANEL_KEY, "operadores"] }),
  });
}

export function useResetearPasswordOperador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetearPasswordOperador,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...PANEL_KEY, "operadores"] }),
  });
}

/** El descuento cambia el precio de socio en toda la tienda. */
export function useActualizarDescuentoTienda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, descuentoTienda }: { id: string; descuentoTienda: number }) =>
      actualizarDescuentoTienda(id, descuentoTienda),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tipos-socio"] });
      void queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY });
    },
  });
}
