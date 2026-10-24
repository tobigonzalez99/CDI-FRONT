import type { Metadata } from "next";

import { MiPerfil } from "@/features/socios/components/mi-perfil";

export const metadata: Metadata = { title: "Mi perfil" };

export default function PerfilPage() {
  return <MiPerfil />;
}
