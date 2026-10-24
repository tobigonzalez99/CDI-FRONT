import type { Metadata } from "next";

import { CambiarPasswordForm } from "@/features/auth/components/cambiar-password-form";
import { RequireAuth } from "@/features/auth/components/require-auth";

export const metadata: Metadata = { title: "Cambiar contraseña" };

export default function CambiarPasswordPage() {
  return (
    <RequireAuth permitirPasswordPendiente>
      <CambiarPasswordForm />
    </RequireAuth>
  );
}
