import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { PAGINAS } from "@/types/pagina";

const POR_DEFECTO = {
  titulo: "Historia",
  resumen: "Los orígenes del club, sus hitos y la gente que lo construyó desde 1911.",
};

export const generateMetadata = () =>
  metadataDeSeccion(PAGINAS.historia, {
    title: POR_DEFECTO.titulo,
    description: POR_DEFECTO.resumen,
  });

export default function HistoriaPage() {
  return (
    <SeccionEditable slug={PAGINAS.historia} href="/historia" porDefecto={POR_DEFECTO} />
  );
}
