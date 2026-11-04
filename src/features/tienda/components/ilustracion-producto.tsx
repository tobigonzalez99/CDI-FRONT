import { cn } from "@/lib/utils";
import type { Ilustracion } from "@/features/tienda/maqueta/datos";

/**
 * Dibujos de los productos para la maqueta, en lugar de fotos que todavía no
 * existen. Cuando se carguen los productos de verdad, esto se reemplaza por
 * la foto que suba el admin.
 */

const ROJO = "#d41f26";
const NEGRO = "#0e0e10";
const GRIS = "#2a2a2e";

/** Silueta de una camiseta de manga corta, centrada en un lienzo de 200. */
const CAMISETA =
  "M70 34 L50 40 L22 62 L36 92 L52 84 L52 172 L148 172 L148 84 L164 92 L178 62 L150 40 L130 34 Q100 52 70 34 Z";

function Camiseta({ variante }: { variante: "titular" | "alternativa" | "retro" }) {
  const id = `rayas-${variante}`;
  const fondo = variante === "alternativa" ? "#f5f5f4" : ROJO;

  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={CAMISETA} />
        </clipPath>
      </defs>
      <path d={CAMISETA} fill={fondo} stroke={variante === "alternativa" ? "#d4d4d4" : "none"} strokeWidth="3" />
      <g clipPath={`url(#${id})`}>
        {variante === "alternativa" ? (
          <>
            <rect x="0" y="100" width="200" height="10" fill={ROJO} />
            <rect x="0" y="110" width="200" height="6" fill={NEGRO} />
          </>
        ) : (
          [44, 76, 108, 140].map((x) => (
            <rect key={x} x={x} y="0" width="16" height="200" fill={NEGRO} />
          ))
        )}
      </g>
      {variante === "retro" ? (
        <path d="M78 36 Q100 62 122 36 L114 34 Q100 48 86 34 Z" fill="#f5f5f4" />
      ) : (
        <path d="M70 34 Q100 52 130 34" fill="none" stroke={NEGRO} strokeWidth="5" />
      )}
      {/* Escudo chico, del lado del corazón */}
      <path
        d="M118 66 h18 v12 q0 10 -9 14 q-9 -4 -9 -14 Z"
        fill={variante === "alternativa" ? ROJO : "#f5f5f4"}
        stroke={NEGRO}
        strokeWidth="2"
      />
    </>
  );
}

function Buzo({ capucha = true, cierre = false }: { capucha?: boolean; cierre?: boolean }) {
  return (
    <>
      {capucha && <path d="M74 40 Q100 4 126 40 Q100 30 74 40 Z" fill={GRIS} />}
      <path
        d="M72 38 L48 46 L26 120 L42 176 L58 172 L56 100 L56 172 L144 172 L144 100 L142 172 L158 176 L174 120 L152 46 L128 38 Q100 56 72 38 Z"
        fill={NEGRO}
      />
      <rect x="52" y="158" width="96" height="14" fill={GRIS} />
      {cierre ? (
        <rect x="98" y="48" width="4" height="124" fill={ROJO} />
      ) : (
        <path d="M80 112 h40 v8 h-40 Z" fill={GRIS} />
      )}
      <path d="M86 66 h28 v18 q0 14 -14 20 q-14 -6 -14 -20 Z" fill={ROJO} stroke="#f5f5f4" strokeWidth="2.5" />
    </>
  );
}

function Remera() {
  return (
    <>
      <path d={CAMISETA} fill={NEGRO} />
      <path d="M70 34 Q100 52 130 34" fill="none" stroke={GRIS} strokeWidth="5" />
      <path d="M118 66 h14 v9 q0 8 -7 11 q-7 -3 -7 -11 Z" fill={ROJO} />
    </>
  );
}

function Short() {
  return (
    <>
      <path d="M46 46 H154 L166 160 L110 164 L100 104 L90 164 L34 160 Z" fill={NEGRO} />
      <rect x="46" y="46" width="108" height="12" fill={GRIS} />
      <path d="M44 120 L56 120 L52 160 L38 159 Z" fill={ROJO} />
      <path d="M156 120 L144 120 L148 160 L162 159 Z" fill={ROJO} />
    </>
  );
}

function Gorra() {
  return (
    <>
      <path d="M40 120 Q40 56 100 52 Q160 56 160 120 Z" fill={NEGRO} />
      <path d="M100 52 V120" stroke={GRIS} strokeWidth="3" />
      <path d="M30 120 H170 Q176 142 120 140 H40 Q24 138 30 120 Z" fill={GRIS} />
      <circle cx="100" cy="54" r="5" fill={ROJO} />
      <path d="M90 82 h20 v13 q0 10 -10 14 q-10 -4 -10 -14 Z" fill={ROJO} stroke="#f5f5f4" strokeWidth="2" />
    </>
  );
}

function Bufanda() {
  const franjas = [0, 1, 2, 3, 4, 5, 6];
  return (
    <g transform="rotate(-28 100 100)">
      {franjas.map((indice) => (
        <rect
          key={indice}
          x={38 + indice * 18}
          y="78"
          width="18"
          height="44"
          fill={indice % 2 === 0 ? ROJO : NEGRO}
        />
      ))}
      {[0, 1, 2, 3, 4].map((indice) => (
        <g key={indice}>
          <rect x={32} y={82 + indice * 8} width="6" height="3" fill={NEGRO} />
          <rect x={164} y={82 + indice * 8} width="6" height="3" fill={NEGRO} />
        </g>
      ))}
    </g>
  );
}

function Mate() {
  return (
    <>
      <path d="M118 30 L132 26 L112 120 L104 118 Z" fill="#c9c9c9" />
      <path d="M58 70 H142 Q150 70 148 84 Q140 168 100 172 Q60 168 52 84 Q50 70 58 70 Z" fill={NEGRO} />
      <rect x="56" y="64" width="88" height="10" rx="3" fill="#c9c9c9" />
      <path d="M88 100 h24 v16 q0 12 -12 17 q-12 -5 -12 -17 Z" fill={ROJO} stroke="#f5f5f4" strokeWidth="2.5" />
    </>
  );
}

function Vaso() {
  return (
    <>
      <path d="M62 44 H138 L128 172 H72 Z" fill="#c9c9c9" />
      <rect x="58" y="34" width="84" height="14" rx="4" fill={NEGRO} />
      <path d="M64 70 H136 L134 92 H66 Z" fill={ROJO} />
      <path d="M88 104 h24 v15 q0 12 -12 16 q-12 -4 -12 -16 Z" fill={NEGRO} />
    </>
  );
}

function Termo() {
  return (
    <>
      <rect x="72" y="20" width="56" height="22" rx="6" fill={ROJO} />
      <rect x="66" y="40" width="68" height="136" rx="14" fill={NEGRO} />
      <rect x="66" y="150" width="68" height="10" fill={GRIS} />
      <path d="M88 84 h24 v16 q0 12 -12 17 q-12 -5 -12 -17 Z" fill={ROJO} stroke="#f5f5f4" strokeWidth="2.5" />
    </>
  );
}

function Llavero() {
  return (
    <>
      <circle cx="100" cy="48" r="20" fill="none" stroke="#a3a3a3" strokeWidth="6" />
      <rect x="96" y="64" width="8" height="16" fill="#a3a3a3" />
      <path d="M70 80 h60 v40 q0 34 -30 48 q-30 -14 -30 -48 Z" fill={ROJO} stroke={NEGRO} strokeWidth="5" />
      <path d="M84 92 v52 M100 92 v62 M116 92 v52" stroke={NEGRO} strokeWidth="8" />
    </>
  );
}

const DIBUJOS: Record<Ilustracion, () => React.ReactNode> = {
  "camiseta-titular": () => <Camiseta variante="titular" />,
  "camiseta-alternativa": () => <Camiseta variante="alternativa" />,
  "camiseta-retro": () => <Camiseta variante="retro" />,
  buzo: () => <Buzo />,
  campera: () => <Buzo capucha cierre />,
  remera: () => <Remera />,
  short: () => <Short />,
  gorra: () => <Gorra />,
  bufanda: () => <Bufanda />,
  mate: () => <Mate />,
  vaso: () => <Vaso />,
  termo: () => <Termo />,
  llavero: () => <Llavero />,
};

interface IlustracionProductoProps {
  ilustracion: Ilustracion;
  /** Variación del fondo, para que las fotos de una galería no sean idénticas. */
  toma?: number;
  className?: string;
}

const FONDOS = ["bg-neutral-100", "bg-neutral-200/70", "bg-brand-black"];

export function IlustracionProducto({ ilustracion, toma = 0, className }: IlustracionProductoProps) {
  return (
    <div className={cn("flex aspect-square items-center justify-center", FONDOS[toma % FONDOS.length], className)}>
      <svg
        viewBox="0 0 200 200"
        className={cn("h-4/5 w-4/5", toma % 3 === 1 && "scale-110", toma % 3 === 2 && "-rotate-6")}
        aria-hidden
      >
        {DIBUJOS[ilustracion]()}
      </svg>
    </div>
  );
}
