import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-brand-red focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>

      <Navbar />

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <Footer />
    </>
  );
}
