import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { BloqueSocio } from "@/features/solicitudes/components/bloque-socio";
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
 * La única sección editable que ya tiene algo propio: debajo del texto que
 * escriba el club va la solicitud de alta o, si quien mira ya es socio, el
 * agradecimiento con la opción de darse de baja.
 */
export default function SocioPage() {
  return (
    <SeccionEditable slug={PAGINAS.socio} href="/socio" porDefecto={POR_DEFECTO}>
      <BloqueSocio />
    </SeccionEditable>
  );
}
