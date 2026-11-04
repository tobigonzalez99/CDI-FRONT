import { FichaProducto } from "@/features/tienda/components/ficha-producto";

export default async function ProductoPage({ params }: PageProps<"/tienda/productos/[slug]">) {
  const { slug } = await params;
  return <FichaProducto slug={slug} />;
}
