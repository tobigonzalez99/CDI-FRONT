import { Navbar } from "@/components/shared/navbar";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { RequireAuth } from "@/features/auth/components/require-auth";

/**
 * HU-07: dashboard exclusivo de administradores. Mantiene la navbar para que
 * el admin pueda seguir navegando el sitio público y cerrar sesión.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <RequireAuth roles={["ADMIN"]}>
          <div className="space-y-6">
            <AdminNav />
            {children}
          </div>
        </RequireAuth>
      </main>
    </>
  );
}
