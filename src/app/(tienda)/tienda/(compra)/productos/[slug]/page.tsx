import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaProducto } from "@/features/tienda/components/ficha-producto";
import { TarjetaProducto } from "@/features/tienda/components/tarjeta-producto";
import { PRODUCTOS, productoPorSlug, stockTotal } from "@/features/tienda/maqueta/datos";

export async function generateMetadata({
  params,
}: PageProps<"/tienda/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: productoPorSlug(slug)?.nombre ?? "Producto" };
}

export default async function ProductoPage({ params }: PageProps<"/tienda/productos/[slug]">) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  // Relacionados: los de la misma categoría con stock, y si faltan, otros con stock.
  const conStock = PRODUCTOS.filter((otro) => otro.slug !== slug && stockTotal(otro) > 0);
  const relacionados = [
    ...conStock.filter((otro) => otro.categoria === producto.categoria),
    ...conStock.filter((otro) => otro.categoria !== producto.categoria),
  ].slice(0, 4);

  return (
    <div className="pb-16">
      <FichaProducto producto={producto} />

      <section className="container mx-auto mt-6 px-4">
        <h2 className="font-heading text-2xl font-bold tracking-tight">También te puede gustar</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {relacionados.map((otro) => (
            <TarjetaProducto key={otro.slug} producto={otro} />
          ))}
        </div>
      </section>
    </div>
  );
}
