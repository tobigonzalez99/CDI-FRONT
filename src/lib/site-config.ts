/**
 * Datos institucionales del club.
 *
 * Fuente única para footer, metadatos y páginas institucionales. Los campos
 * en `null` son datos que todavía no tenemos: los componentes ocultan esas
 * entradas en vez de mostrar texto de relleno, así que completarlos acá
 * alcanza para que aparezcan en el sitio.
 */
export const siteConfig = {
  name: "Club Deportivo Independencia",
  shortName: "CDI",
  apodo: "El Ventarrón",
  fundacion: {
    iso: "1911-05-25",
    texto: "25 de mayo de 1911",
    anio: 1911,
  },

  localidad: "Adolfo Gonzáles Chaves",
  provincia: "Buenos Aires",
  pais: "Argentina",
  codigoPostal: "7513",

  description:
    "Club de fútbol de Adolfo Gonzáles Chaves, fundado en 1911. Fútbol masculino, femenino, inferiores y escuelita.",

  /**
   * El club funciona en dos ubicaciones distintas: la sede social en el
   * pueblo y el predio deportivo. Cada una tiene su propio domicilio.
   */
  sedes: [
    {
      id: "sede",
      nombre: "Sede social",
      direccion: "España 1",
      instalaciones: [
        { nombre: "Museo del club", icono: "museo" },
        { nombre: "Salón de Berta", detalle: "Fogón", icono: "fogon" },
        { nombre: "Cancha de fútbol 5", icono: "futbol" },
        { nombre: "Gimnasio deportivo", icono: "gimnasio" },
        { nombre: "Pileta semiolímpica", detalle: "Descubierta", icono: "pileta" },
      ],
    },
    {
      id: "predio",
      nombre: "Estadio Lisardo Mecía y Ricardo A. Toso",
      /** Esquina, sin numeración. */
      direccion: "Av. Dr. Juan Tintori y Santa Fe",
      descripcion: "Complejo polideportivo de 4 hectáreas",
      instalaciones: [
        { nombre: "Salón de Alicia", icono: "salon" },
        { nombre: "Circuito El Pingüino", detalle: "Automovilismo", icono: "automovilismo" },
      ],
    },
  ],

  contacto: {
    email: "clubdeportivoindependencia1911@gmail.com",
    /**
     * Son celulares: `tel` va en formato internacional (+54 9 …) para que
     * funcione desde cualquier lado, y `display` en formato local, que es
     * como lo lee un vecino.
     */
    telefonos: [
      {
        etiqueta: "Socios",
        display: "2983 35-4564",
        tel: "+5492983354564",
      },
      {
        etiqueta: "Institucional · Walter Di Marco (presidente)",
        display: "2983 40-0200",
        tel: "+5492983400200",
      },
    ],
  },

  redes: {
    instagram: "https://www.instagram.com/clubindependenciachaves/",
    facebook: "https://www.facebook.com/profile.php?id=61557576297362",
    x: "https://x.com/cdi1911",
    tiktok: "https://www.tiktok.com/@cdi1911",
    /**
     * Cuenta personal usada como canal del club. Es intencional: se migrará
     * a una cuenta propia más adelante.
     */
    youtube: "https://www.youtube.com/@leandrogonzalez1577",
  },
} as const;

export type Sede = (typeof siteConfig.sedes)[number];

export const sedeSocial = siteConfig.sedes[0];
export const predio = siteConfig.sedes[1];

/** Arma la consulta de Google Maps para una sede. */
export function mapQueryFor(direccion: string) {
  return `${direccion}, ${siteConfig.localidad}, ${siteConfig.provincia}, ${siteConfig.pais}`;
}

export function mapEmbedUrl(direccion: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(mapQueryFor(direccion))}&output=embed`;
}

export function mapLinkUrl(direccion: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQueryFor(direccion))}`;
}

/** Domicilio completo de la sede social, para mostrar en el footer. */
export const direccionSede = `${sedeSocial.direccion}, ${siteConfig.localidad} (CP ${siteConfig.codigoPostal}), ${siteConfig.provincia}`;
