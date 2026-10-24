"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { esApiError } from "@/lib/api/errors";

function crearQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Reintentar un 401 o un 404 solo demora el error: no van a cambiar.
        retry: (intentos, error) =>
          esApiError(error) && error.status >= 500 ? intentos < 2 : false,
      },
      mutations: { retry: false },
    },
  });
}

let clienteDelNavegador: QueryClient | undefined;

function obtenerQueryClient() {
  // En el servidor, un cliente por render para no filtrar datos entre usuarios.
  if (typeof window === "undefined") return crearQueryClient();
  clienteDelNavegador ??= crearQueryClient();
  return clienteDelNavegador;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(obtenerQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
