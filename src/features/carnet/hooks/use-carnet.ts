"use client";

import { useQuery } from "@tanstack/react-query";

import { consultarCarnet } from "@/features/carnet/api/carnet.api";

/**
 * Consulta del carnet escaneado.
 *
 * Va del lado del cliente y no del servidor de Next: con render en el
 * servidor todas las consultas saldrían con la IP del servidor y el límite
 * de 60 por minuto lo compartirían todos los que escanean a la vez.
 *
 * Sin reintentos: un código que no existe no va a existir al tercer intento,
 * y cada reintento gasta el límite por IP de quien está en la puerta.
 */
export function useCarnet(codigo: string) {
  return useQuery({
    queryKey: ["carnet", codigo],
    queryFn: () => consultarCarnet(codigo),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
