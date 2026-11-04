import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  CategoriaTienda,
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
