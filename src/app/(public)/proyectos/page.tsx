import { PROYECTOS_HREF } from "@/components/shared/navbar/nav-config";
import { SeccionEditable } from "@/features/paginas/components/seccion-editable";
import { metadataDeSeccion } from "@/features/paginas/metadata";
import { PAGINAS } from "@/types/pagina";

const POR_DEFECTO = {
  titulo: "Proyectos",
  resumen: "En qué está trabajando el club.",
};

export const generateMetadata = () =>
  metadataDeSeccion(PAGINAS.proyectos, {
    title: POR_DEFECTO.titulo,
    description: POR_DEFECTO.resumen,
  });

export default function ProyectosPage() {
  return (
    <SeccionEditable
      slug={PAGINAS.proyectos}
      href={PROYECTOS_HREF}
      porDefecto={POR_DEFECTO}
    />
  );
}
