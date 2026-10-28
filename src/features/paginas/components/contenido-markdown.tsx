import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Cuerpo de una página editable.
 *
 * Llega en **Markdown, no HTML**, y se renderiza como árbol de React: nunca
 * con `innerHTML`. Lo escribe una persona desde el panel, y volcarlo tal cual
 * abriría la puerta a inyectar scripts.
 *
 * Los estilos van acá y no en el Markdown para que el texto del panel quede
 * limpio: quien lo escribe se ocupa del contenido, no de cómo se ve.
 */
export function ContenidoMarkdown({
  texto,
  className,
}: {
  texto: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-5", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // El h1 de la página ya es el título de la sección: lo que venga
          // del panel arranca un nivel más abajo.
          h1: ({ children }) => (
            <h2 className="mt-10 font-heading text-2xl font-bold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 font-heading text-2xl font-bold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 font-heading text-lg font-bold">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-pretty leading-relaxed text-muted-foreground">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground marker:text-brand-red">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground marker:text-brand-red">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-red pl-4 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border" />,
          // Sale del sitio: pestaña nueva y `rel` que corta el acceso al opener.
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-red underline underline-offset-4 transition-colors hover:text-brand-red-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-4 py-2.5 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-4 py-2.5 text-muted-foreground last:border-0">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          ),
        }}
      >
        {texto}
      </Markdown>
    </div>
  );
}
