/**
 * Datos institucionales del club.
 *
 * Los campos marcados como PENDIENTE son placeholders: todavía no tenemos el
 * dato real y no conviene inventarlo. Los componentes que los consumen ocultan
 * la entrada cuando el valor es `null`, así que completarlos acá alcanza para
 * que aparezcan en el sitio.
 */
export const siteConfig = {
  name: "Club Deportivo Independencia",
  shortName: "CDI",
  /** Verificado en la biografía del Instagram oficial. */
  localidad: "Adolfo Gonzáles Chaves",
  provincia: "Buenos Aires",
  description:
    "Club de fútbol de Adolfo Gonzáles Chaves. Fútbol masculino, femenino, inferiores y escuelita.",

  contacto: {
    /** PENDIENTE: domicilio exacto de la sede/estadio. */
    direccion: null as string | null,
    /** PENDIENTE: teléfono institucional. */
    telefono: null as string | null,
    /** PENDIENTE: correo de contacto. */
    email: null as string | null,
  },

  redes: {
    /** Perfil oficial verificado. */
    instagram: "https://www.instagram.com/clubindependenciachaves/",
    /** PENDIENTE: URL de la página de Facebook del club. */
    facebook: null as string | null,
  },
} as const;

/**
 * Consulta para el mapa. PENDIENTE: al tener el domicilio exacto, reemplazar
 * por la dirección completa para que el pin caiga sobre la sede y no sobre la
 * localidad.
 */
export const mapQuery = `${siteConfig.localidad}, ${siteConfig.provincia}, Argentina`;
