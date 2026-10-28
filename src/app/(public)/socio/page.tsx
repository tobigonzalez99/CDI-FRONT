import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { HacetesocioCard } from "@/features/solicitudes/components/hacete-socio-card";
import { PAGINAS } from "@/types/pagina";

const POR_DEFECTO = {
  titulo: "Hacete socio",
  resumen: "Sumate al club: beneficios, categorías y cómo asociarte.",
};

export const generateMetadata = () =>
  metadataDeSeccion(PAGINAS.socio, {
    title: POR_DEFECTO.titulo,
    description: POR_DEFECTO.resumen,
  });

/**
 * La única sección editable que ya tiene algo propio: el formulario de
 * solicitud va debajo del texto que escriba el club sobre beneficios y
 * categorías, y sigue en pie aunque todavía no haya texto.
 */
export default function SocioPage() {
  return (
    <SeccionEditable slug={PAGINAS.socio} href="/socio" porDefecto={POR_DEFECTO}>
      <HacetesocioCard />
    </SeccionEditable>
  );
}
