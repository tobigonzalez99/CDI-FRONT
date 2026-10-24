import type { SVGProps } from "react";

/**
 * Íconos de redes sociales.
 *
 * lucide-react v1 eliminó los íconos de marcas, así que los definimos acá.
 * Son decorativos: el nombre accesible lo aporta el enlace que los contiene.
 */

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function InstagramIcon({ className, ...props }: IconProps) {
  return (
    <svg {...baseProps} className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg {...baseProps} className={className} {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function WhatsappIcon({ className, ...props }: IconProps) {
  return (
    <svg {...baseProps} className={className} {...props}>
      <path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l.9-1.6-2-1-.9.9a5.6 5.6 0 0 1-1.8-1.8l.9-.9-1-2z" />
    </svg>
  );
}

export function XIcon({ className, ...props }: IconProps) {
  return (
    <svg {...baseProps} className={className} {...props}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

export function YoutubeIcon({ className, ...props }: IconProps) {
  return (
    <svg {...baseProps} className={className} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </svg>
  );
}

export function TiktokIcon({ className, ...props }: IconProps) {
  return (
    <svg {...baseProps} className={className} {...props}>
      <path d="M14 3v11.5a4 4 0 1 1-3.2-3.92" />
      <path d="M14 6.5a5.5 5.5 0 0 0 5.5 4.5" />
    </svg>
  );
}
