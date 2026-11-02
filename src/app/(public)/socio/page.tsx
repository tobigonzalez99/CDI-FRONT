import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { CategoriasSocio } from "@/features/socios/components/categorias-socio";
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
 * "Hacete socio": primero las categorías con lo que incluye cada una, y
 * debajo la solicitud de alta —o, si quien mira ya es socio, el
 * agradecimiento con la opción de darse de baja—. Va debajo porque primero
 * se lee y después se actúa; el "Asociarme" de cada tarjeta baja hasta acá.
 * Si el club escribe un texto desde el panel, va arriba de todo.
 */
export default function SocioPage() {
  return (
    <SeccionEditable slug={PAGINAS.socio} href="/socio" porDefecto={POR_DEFECTO}>
      <div className="space-y-20">
        <CategoriasSocio />
        {/* `scroll-mt` deja lugar a la barra fija al llegar desde "Asociarme". */}
        <div id="solicitud" className="scroll-mt-28">
          <BloqueSocio />
        </div>
      </div>
    </SeccionEditable>
  );
}
