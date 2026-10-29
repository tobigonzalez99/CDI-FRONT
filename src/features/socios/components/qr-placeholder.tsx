const AZUL = "#373dcd";

/** Lado de la grilla, en módulos. 25 es el tamaño de un QR chico real. */
const LADO = 25;
const OJO = 7;

/** Generador determinista: el mismo socio dibuja siempre el mismo patrón. */
function generador(semilla: string) {
  let estado = 0x9e3779b9;
  for (const caracter of semilla) {
    estado = Math.imul(estado ^ caracter.charCodeAt(0), 0x85ebca6b);
    estado = (estado ^ (estado >>> 13)) >>> 0;
  }

  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Las tres esquinas de referencia de un QR. */
function enOjo(x: number, y: number) {
  const zonas = [
    [0, 0],
    [LADO - OJO, 0],
    [0, LADO - OJO],
  ];

  return zonas.some(([ox, oy]) => x >= ox && x < ox + OJO && y >= oy && y < oy + OJO);
}

/** El margen de un ojo también se reserva, igual que en un QR de verdad. */
function enMargenDeOjo(x: number, y: number) {
  return enOjo(x, y) || enOjo(x - 1, y) || enOjo(x + 1, y) || enOjo(x, y - 1) || enOjo(x, y + 1);
}

interface QrPlaceholderProps {
  /** De qué depende el dibujo; hoy, el número de socio. */
  semilla: string;
  className?: string;
}

/**
 * Dibujo con forma de código QR, **provisional**.
 *
 * Todavía no codifica nada: el código real, único por socio y que al
 * escanearlo dirá si está al día, está pendiente de definirse con el
 * backend. Hasta entonces esto ocupa su lugar en el carnet para que el
 * diseño se vea completo, y por eso va acompañado de un aviso debajo del
 * carnet: un código que parece válido y no lo es confunde más que ayudar.
 */
export function QrPlaceholder({ semilla, className }: QrPlaceholderProps) {
  const azar = generador(semilla);
  const modulos: React.ReactElement[] = [];

  for (let y = 0; y < LADO; y++) {
    for (let x = 0; x < LADO; x++) {
      if (enMargenDeOjo(x, y)) continue;
      if (azar() > 0.52) continue;
      modulos.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" rx="0.2" />);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${LADO} ${LADO}`}
      className={className}
      role="img"
      aria-label="Código QR del carnet, todavía sin función"
    >
      <g fill={AZUL}>
        {modulos}

        {/* Los tres ojos: marco cuadrado con el centro relleno. */}
        {[
          [0, 0],
          [LADO - OJO, 0],
          [0, LADO - OJO],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <path
              d={`M${x} ${y}h${OJO}v${OJO}h-${OJO}z M${x + 1} ${y + 1}v${OJO - 2}h${OJO - 2}v-${OJO - 2}z`}
              fillRule="evenodd"
            />
            <rect x={x + 2} y={y + 2} width={OJO - 4} height={OJO - 4} rx="1" />
          </g>
        ))}
      </g>
    </svg>
  );
}
