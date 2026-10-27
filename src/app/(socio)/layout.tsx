import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { RequireAuth } from "@/features/auth/components/require-auth";

/**
 * Área privada del socio (HU-04, HU-05).
 * Conserva la navbar pública: desde ahí se navega el sitio y se cierra sesión.
 */
export default function SocioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <RequireAuth roles={["SOCIO"]}>{children}</RequireAuth>
      </main>
      <Footer />
    </>
  );
}
