import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * El menú "Fútbol" pasó a ser "Disciplinas" y las categorías dejaron de
   * colgar de él. Estas redirecciones evitan que un enlace guardado a las
   * rutas viejas termine en un 404.
   */
  async redirects() {
    const equivalencias: Record<string, string> = {
      masculino: "futbol-masculino",
      femenino: "futbol-femenino",
      inferiores: "inferiores",
      escuelita: "escuelita",
    };

    return [
      { source: "/futbol", destination: "/disciplinas", permanent: true },
      ...Object.entries(equivalencias).map(([viejo, nuevo]) => ({
        source: `/futbol/${viejo}`,
        destination: `/disciplinas/${nuevo}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
