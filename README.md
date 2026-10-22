# CDI-FRONT

Frontend de la página web oficial del **Club Deportivo Independencia**.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** en modo estricto
- **Tailwind CSS v4** (configuración CSS-first, sin `tailwind.config.ts`)
- **shadcn/ui** + `lucide-react`
- **TanStack Query** (server state) y **Zustand** (estado global liviano)
- **React Hook Form** + **Zod**

## Requisitos

- Node.js 20 o superior
- npm

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

La app queda en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API REST del backend |

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── app/                  # Rutas (App Router)
│   ├── (public)/         # Sitio institucional
│   ├── (auth)/           # Login y cambio de contraseña
│   ├── (socio)/          # Panel del socio
│   └── (admin)/          # Dashboard administrativo
├── components/
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── shared/           # Navbar, Footer, Sidebar
├── features/             # Lógica de negocio por dominio
│   ├── auth/
│   ├── socios/
│   └── admin/
├── lib/                  # Utilidades, cliente HTTP, validadores Zod
├── types/                # Interfaces de TypeScript
└── styles/               # Estilos globales y tokens de theming
```

## Theming

Los colores institucionales se definen como variables CSS en
[`src/styles/globals.css`](src/styles/globals.css). Los componentes consumen
siempre esos tokens (`--primary`, `--secondary`, `--accent`, `--muted`), así que
aplicar la paleta oficial del club no requiere modificar componentes.

## Estado

MVP en desarrollo. Los requerimientos están definidos en el documento de
Historias de Usuario (HU-01 a HU-09).
