import type { Metadata } from "next";

import { RecuperarPasswordForm } from "@/features/auth/components/recuperar-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPasswordPage() {
  return <RecuperarPasswordForm />;
}
