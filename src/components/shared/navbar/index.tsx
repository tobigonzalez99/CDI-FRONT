import { obtenerDisciplinas } from "@/features/disciplinas/api/disciplinas.api";
import { disciplinasComoNavItems } from "./nav-config";
import { Navbar as NavbarClient } from "./navbar";

/**
 * Navbar con las disciplinas ya resueltas.
 *
 * La consulta se hace acá, en el servidor, para que el menú llegue armado en
 * el HTML: no parpadea, funciona sin JavaScript y no repite el pedido en cada
 * pantalla que monta la barra.
 */
export async function Navbar() {
  const disciplinas = await obtenerDisciplinas();

  return <NavbarClient disciplinas={disciplinasComoNavItems(disciplinas)} />;
}
