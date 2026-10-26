import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Socio" };

export default function SocioPage() {
  return (
    <SectionPage
      href="/socio"
      title="Socio"
      description="Qué significa ser socio del club, los beneficios y cómo asociarte."
    />
  );
}
