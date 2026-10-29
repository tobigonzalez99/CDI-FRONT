/**
 * Lo que devuelve escanear el QR de un carnet (`GET /carnet/:codigo`).
 *
 * Es información pública: la ve cualquiera que apunte la cámara al carnet.
 * Por eso no viajan ni el DNI, ni el correo, ni el domicilio, ni el teléfono,
 * ni los importes, ni las fechas de vigencia — en la puerta de la cancha no
 * hace falta nada de eso.
 */
export interface CarnetPublico {
  numeroSocio: number;
  nombre: string;
  apellido: string;
  /** Nombre de la categoría, ej. "Socio Activo". */
  tipoSocio: string;
  /**
   * La foto no es decorativa: como el código del carnet es fijo, una captura
   * de pantalla ajena sirve siempre. Lo único que distingue al titular es la
   * cara en la pantalla de quien cobra la entrada.
   */
  fotoUrl: string | null;
  /** Lo único que decide si le corresponde el descuento. */
  alDia: boolean;
  /**
   * Por qué. En la puerta los dos motivos para cobrar precio normal no son lo
   * mismo: una cuota vencida se paga ahí, una baja se resuelve con la
   * administración.
   */
  situacion: SituacionCarnet;
}

export const SITUACIONES_CARNET = ["AL_DIA", "CUOTA_VENCIDA", "DADO_DE_BAJA"] as const;
export type SituacionCarnet = (typeof SITUACIONES_CARNET)[number];
