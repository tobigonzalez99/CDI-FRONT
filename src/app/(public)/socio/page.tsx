import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";
import { HacetesocioCard } from "@/features/solicitudes/components/hacete-socio-card";

export const metadata: Metadata = { title: "Hacete socio" };

export default function SocioPage() {
  return (
    <SectionPage
      href="/socio"
      title="Hacete socio"
      description="Completá tus datos y la administración del club revisa tu solicitud. Cuando quede aprobada vas a recibir tus datos de acceso."
    >
      <HacetesocioCard />
    </SectionPage>
  );
}
