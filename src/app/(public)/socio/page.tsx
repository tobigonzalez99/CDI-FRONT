import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { CategoriasSocio } from "@/features/socios/components/categorias-socio";
import { SeccionAsociarse } from "@/features/solicitudes/components/seccion-asociarse";
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
 * "Hacete socio": las categorías con sus beneficios y su cuota, y debajo cómo
 * asociarse con el formulario —o, si quien mira ya es socio, el
 * agradecimiento con la opción de darse de baja—. Si el club escribe un texto
 * desde el panel, va arriba de todo.
 */
export default function SocioPage() {
  return (
    <SeccionEditable slug={PAGINAS.socio} href="/socio" porDefecto={POR_DEFECTO}>
      <div className="space-y-24">
        <CategoriasSocio />
        <SeccionAsociarse />
      </div>
    </SeccionEditable>
  );
}
