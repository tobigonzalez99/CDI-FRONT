import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { TipoSocio } from "@/types/socio";
import type {
  ActualizarProductoInput,
  Arrepentimiento,
  CambioEstadoPedido,
  CategoriaTienda,
  ConfiguracionTienda,
  CrearProductoInput,
  EstadoPedido,
  FiltrosArrepentimientos,
  FiltrosPedidosAdmin,
  FiltrosProductosAdmin,
  MovimientoStock,
  MovimientoStockInput,
  OperadorConPassword,
  OperadorTienda,
  PedidoAdmin,
  ProductoAdmin,
  ResolverArrepentimientoInput,
  VentasTienda,
} from "@/types/tienda";

/**
 * Panel de la tienda (ADMIN y TIENDA). Toda respuesta de producto trae el
 * producto entero: con eso se refresca la pantalla.
 */
const BASE = "/tienda/admin";

// ------------------------------------------------------------- Categorías

export async function listarCategoriasAdmin(): Promise<CategoriaTienda[]> {
  const { data } = await api.get<CategoriaTienda[]>(`${BASE}/categorias`);
  return data;
}

export async function crearCategoria(input: {
  nombre: string;
  slug?: string;
  orden?: number;
}): Promise<CategoriaTienda> {
  const { data } = await api.post<CategoriaTienda>(`${BASE}/categorias`, input);
  return data;
}

export async function actualizarCategoria(
  id: string,
  input: Partial<Pick<CategoriaTienda, "nombre" | "slug" | "orden" | "activa">>,
): Promise<CategoriaTienda> {
  const { data } = await api.patch<CategoriaTienda>(`${BASE}/categorias/${id}`, input);
  return data;
}

// --------------------------------------------------------------- Productos

export async function listarProductosAdmin(
  filtros: FiltrosProductosAdmin,
): Promise<PaginatedResponse<ProductoAdmin>> {
  const { data } = await api.get<PaginatedResponse<ProductoAdmin>>(`${BASE}/productos`, {
    params: filtros,
  });
  return data;
}

export async function obtenerProductoAdmin(id: string): Promise<ProductoAdmin> {
  const { data } = await api.get<ProductoAdmin>(`${BASE}/productos/${id}`);
  return data;
}

export async function crearProducto(input: CrearProductoInput): Promise<ProductoAdmin> {
  const { data } = await api.post<ProductoAdmin>(`${BASE}/productos`, input);
  return data;
}

export async function actualizarProducto(
  id: string,
  input: ActualizarProductoInput,
): Promise<ProductoAdmin> {
  const { data } = await api.patch<ProductoAdmin>(`${BASE}/productos/${id}`, input);
  return data;
}

// ---------------------------------------------------------- Talles y stock

export async function agregarTalle(
  productoId: string,
  input: { talle: string; stock?: number },
): Promise<ProductoAdmin> {
  const { data } = await api.post<ProductoAdmin>(`${BASE}/productos/${productoId}/talles`, input);
  return data;
}

export async function actualizarVariante(
  id: string,
  input: { talle?: string; orden?: number; activa?: boolean },
): Promise<ProductoAdmin> {
  const { data } = await api.patch<ProductoAdmin>(`${BASE}/variantes/${id}`, input);
  return data;
}

/** Sin ventas se borra; con ventas queda oculto y vuelve si se carga de nuevo. */
export async function eliminarTalle(id: string): Promise<ProductoAdmin> {
  const { data } = await api.delete<ProductoAdmin>(`${BASE}/variantes/${id}`);
  return data;
}

/** Se suma al stock: positiva entra, negativa sale. */
export async function moverStock(
  varianteId: string,
  input: MovimientoStockInput,
): Promise<ProductoAdmin> {
  const { data } = await api.post<ProductoAdmin>(`${BASE}/variantes/${varianteId}/stock`, input);
  return data;
}

export async function listarMovimientos(
  productoId: string,
  pagina: { page: number; pageSize: number },
): Promise<PaginatedResponse<MovimientoStock>> {
  const { data } = await api.get<PaginatedResponse<MovimientoStock>>(
    `${BASE}/productos/${productoId}/movimientos`,
    { params: pagina },
  );
  return data;
}

// ------------------------------------------------------------------- Fotos

export async function subirImagenes(productoId: string, archivos: File[]): Promise<ProductoAdmin> {
  const formData = new FormData();
  for (const archivo of archivos) formData.append("imagenes", archivo);

  const { data } = await api.post<ProductoAdmin>(
    `${BASE}/productos/${productoId}/imagenes`,
    formData,
  );
  return data;
}

/** `ids`: todas las fotos, en el orden nuevo. La primera es la de la grilla. */
export async function ordenarImagenes(productoId: string, ids: string[]): Promise<ProductoAdmin> {
  const { data } = await api.put<ProductoAdmin>(`${BASE}/productos/${productoId}/imagenes/orden`, {
    ids,
  });
  return data;
}

export async function borrarImagen(id: string): Promise<void> {
  await api.delete(`${BASE}/imagenes/${id}`);
}

// ----------------------------------------------------------------- Pedidos

export async function listarPedidosAdmin(
  filtros: FiltrosPedidosAdmin,
): Promise<PaginatedResponse<PedidoAdmin> & { contadores: Record<EstadoPedido, number> }> {
  const { data } = await api.get<
    PaginatedResponse<PedidoAdmin> & { contadores: Record<EstadoPedido, number> }
  >(`${BASE}/pedidos`, { params: filtros });
  return data;
}

export async function cambiarEstadoPedido(
  codigo: string,
  input: CambioEstadoPedido,
): Promise<PedidoAdmin> {
  const { data } = await api.post<PedidoAdmin>(`${BASE}/pedidos/${codigo}/estado`, input);
  return data;
}

// -------------------------------------------------------- Arrepentimientos

export async function listarArrepentimientos(
  filtros: FiltrosArrepentimientos,
): Promise<PaginatedResponse<Arrepentimiento> & { pendientes: number }> {
  const { data } = await api.get<PaginatedResponse<Arrepentimiento> & { pendientes: number }>(
    `${BASE}/arrepentimientos`,
    { params: filtros },
  );
  return data;
}

export async function resolverArrepentimiento(
  id: string,
  input: ResolverArrepentimientoInput,
): Promise<Arrepentimiento> {
  const { data } = await api.post<Arrepentimiento>(`${BASE}/arrepentimientos/${id}/resolver`, input);
  return data;
}

// ------------------------------------------------------------------ Ventas

export async function obtenerVentas(): Promise<VentasTienda> {
  const { data } = await api.get<VentasTienda>(`${BASE}/ventas`);
  return data;
}

// ----------------------------------------------------------- Configuración

export async function obtenerConfiguracionAdmin(): Promise<ConfiguracionTienda> {
  const { data } = await api.get<ConfiguracionTienda>(`${BASE}/configuracion`);
  return data;
}

export async function actualizarConfiguracion(
  input: Partial<Omit<ConfiguracionTienda, "updatedAt">>,
): Promise<ConfiguracionTienda> {
  const { data } = await api.patch<ConfiguracionTienda>(`${BASE}/configuracion`, input);
  return data;
}

// ------------------------------------------------- Operadores (solo ADMIN)

export async function listarOperadores(): Promise<OperadorTienda[]> {
  const { data } = await api.get<OperadorTienda[]>(`${BASE}/operadores`);
  return data;
}

export async function crearOperador(input: {
  dni: string;
  nombre: string;
  apellido: string;
}): Promise<OperadorConPassword> {
  const { data } = await api.post<OperadorConPassword>(`${BASE}/operadores`, input);
  return data;
}

export async function cambiarEstadoOperador(id: string, activo: boolean): Promise<OperadorTienda> {
  const { data } = await api.patch<OperadorTienda>(`${BASE}/operadores/${id}`, { activo });
  return data;
}

export async function resetearPasswordOperador(id: string): Promise<OperadorConPassword> {
  const { data } = await api.post<OperadorConPassword>(
    `${BASE}/operadores/${id}/resetear-password`,
  );
  return data;
}

// ------------------------------------- Descuento por categoría (solo ADMIN)

export async function actualizarDescuentoTienda(
  tipoSocioId: string,
  descuentoTienda: number,
): Promise<TipoSocio> {
  const { data } = await api.patch<TipoSocio>(`/tipos-socio/${tipoSocioId}`, { descuentoTienda });
  return data;
}
