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

  sede: {
    nombre: "Sede social",
    direccion: "España 1",
  },

  predio: {
    nombre: "Estadio Lisardo Mecía y Ricardo A. Toso",
    descripcion: "Complejo polideportivo de 4 hectáreas",
    /** Predio de automovilismo que forma parte del complejo. */
    circuito: "El Pingüino",
    /** PENDIENTE: domicilio del predio. */
    direccion: null as string | null,
  },

  contacto: {
    email: "clubdeportivoindependencia1911@gmail.com",
    /**
     * `tel` va en formato local, que es como se disca dentro de Argentina.
     * PENDIENTE: para el formato internacional (+54 9 ...) hace falta saber
     * si son líneas fijas o celulares.
     */
    telefonos: [
      {
        etiqueta: "Socios",
        display: "2983 35-4564",
        tel: "2983354564",
      },
      {
        etiqueta: "Institucional · Walter Di Marco (presidente)",
        display: "2983 40-0200",
        tel: "2983400200",
      },
    ],
  },

  redes: {
    instagram: "https://www.instagram.com/clubindependenciachaves/",
    facebook: "https://www.facebook.com/profile.php?id=61557576297362",
    x: "https://x.com/cdi1911",
    tiktok: "https://www.tiktok.com/@cdi1911",
    /** REVISAR: el handle parece una cuenta personal y no la del club. */
    youtube: "https://www.youtube.com/@leandrogonzalez1577",
  },
} as const;

/** Domicilio completo de la sede, para mostrar y para el mapa. */
export const direccionSede = `${siteConfig.sede.direccion}, ${siteConfig.localidad} (CP ${siteConfig.codigoPostal}), ${siteConfig.provincia}`;

export const mapQuery = `${siteConfig.sede.direccion}, ${siteConfig.localidad}, ${siteConfig.provincia}, ${siteConfig.pais}`;
