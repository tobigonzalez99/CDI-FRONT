import { Navbar } from "@/components/shared/navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </>
  );
}
