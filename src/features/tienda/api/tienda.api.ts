import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  CategoriaTienda,
  Cotizacion,
  CrearPedidoInput,
  CrearPedidoResponse,
  ItemCarritoInput,
  Pedido,
  ConfiguracionTiendaPublica,
  FiltrosCatalogo,
  MiDescuento,
  ProductoDetalle,
  ProductoResumen,
} from "@/types/tienda";

/** Endpoints públicos de la tienda: no piden sesión, salvo `mi-descuento`. */

export async function listarCategorias(): Promise<CategoriaTienda[]> {
  const { data } = await api.get<CategoriaTienda[]>("/tienda/categorias");
  return data;
}

/** Los talles con stock, en orden: el filtro ofrece solo lo que se puede comprar. */
export async function listarTalles(): Promise<string[]> {
  const { data } = await api.get<string[]>("/tienda/talles");
  return data;
}

export async function listarProductos(
  filtros: FiltrosCatalogo = {},
): Promise<PaginatedResponse<ProductoResumen>> {
  const { data } = await api.get<PaginatedResponse<ProductoResumen>>("/tienda/productos", {
    params: filtros,
  });
  return data;
}

export async function obtenerProducto(slug: string): Promise<ProductoDetalle> {
  const { data } = await api.get<ProductoDetalle>(
    `/tienda/productos/${encodeURIComponent(slug)}`,
  );
  return data;
}

export async function obtenerConfiguracion(): Promise<ConfiguracionTiendaPublica> {
  const { data } = await api.get<ConfiguracionTiendaPublica>("/tienda/configuracion");
  return data;
}

/** Solo SOCIO: su porcentaje y por qué. */
export async function obtenerMiDescuento(): Promise<MiDescuento> {
  const { data } = await api.get<MiDescuento>("/tienda/mi-descuento");
  return data;
}

// ------------------------------------------------------ Carrito y pedido

/**
 * Precio, descuento y stock de lo que hay en el carrito, según la base. No
 * reserva nada. Con un socio en sesión trae su descuento aplicado.
 */
export async function cotizarCarrito(items: ItemCarritoInput[]): Promise<Cotizacion> {
  const { data } = await api.post<Cotizacion>("/tienda/carrito/cotizacion", { items });
  return data;
}

/**
 * Confirma la compra: la API vuelve a cotizar y descuenta el stock. Si algo
 * cambió desde la cotización responde 409 y no crea nada.
 */
export async function crearPedido(input: CrearPedidoInput): Promise<CrearPedidoResponse> {
  const { data } = await api.post<CrearPedidoResponse>("/tienda/pedidos", input);
  return data;
}

/** El token va en el cuerpo, nunca en la URL. */
export async function seguirPedido(token: string): Promise<Pedido> {
  const { data } = await api.post<Pedido>("/tienda/pedidos/seguimiento", { token });
  return data;
}

/** Solo SOCIO: sus compras, las más nuevas primero. */
export async function listarMisPedidos(pagina: {
  page: number;
  pageSize: number;
}): Promise<PaginatedResponse<Pedido>> {
  const { data } = await api.get<PaginatedResponse<Pedido>>("/tienda/mis-pedidos", {
    params: pagina,
  });
  return data;
}

export async function obtenerMiPedido(codigo: string): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/tienda/mis-pedidos/${encodeURIComponent(codigo)}`);
  return data;
}
