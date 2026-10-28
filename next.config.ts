import type { NextConfig } from "next";

/**
 * Origen desde el que el backend sirve los archivos subidos (las imágenes de
 * las disciplinas, hoy). Next exige declararlo antes de optimizar una imagen
 * remota, y se deriva de `NEXT_PUBLIC_API_URL` en vez de escribirlo a mano
 * para que en producción cambie solo con la variable de entorno.
 */
function origenDeArchivos(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return [];

  try {
    const { protocol, hostname, port } = new URL(api);

    return [
      {
        protocol: protocol === "https:" ? "https" : "http",
        hostname,
        port,
        // Solo lo subido: no habilitamos el resto del backend como origen.
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns: origenDeArchivos() },

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
