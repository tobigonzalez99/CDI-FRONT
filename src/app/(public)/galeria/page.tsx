import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { PAGINAS } from "@/types/pagina";

const POR_DEFECTO = {
  titulo: "Galería",
  resumen: "Fotos y videos de los partidos, los planteles y la vida del club.",
};

export const generateMetadata = () =>
  metadataDeSeccion(PAGINAS.galeria, {
    title: POR_DEFECTO.titulo,
    description: POR_DEFECTO.resumen,
  });

/**
 * Por ahora la galería es texto editable como el resto. Cuando se defina qué
 * lleva —fotos, álbumes, videos— va a necesitar su propio modelo en el
 * backend, y entonces las imágenes se suman como contenido propio debajo.
 */
export default function GaleriaPage() {
  return (
    <SeccionEditable slug={PAGINAS.galeria} href="/galeria" porDefecto={POR_DEFECTO} />
  );
}
