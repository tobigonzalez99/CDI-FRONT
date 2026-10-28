#!/usr/bin/env node
/**
 * Libera el puerto del sitio antes de arrancar el servidor de desarrollo.
 *
 * En Windows, al reiniciar `next dev` a veces queda un proceso huérfano
 * escuchando en el puerto. El síntoma es engañoso por partida doble: Next no
 * avisa que algo anda mal, arranca en el puerto siguiente, y entonces hay dos
 * instancias escribiendo la misma carpeta `.next`. Eso corrompe el build y
 * aparecen errores 500 que no tienen nada que ver con el código que uno acaba
 * de tocar.
 *
 * Solo toca procesos que estén ESCUCHANDO en ese puerto, e informa cuáles son.
 *
 * Adaptado del equivalente de cdi-backend (`scripts/liberar-puerto.mjs`), que
 * resuelve el mismo problema con el watcher de Nest.
 */
import { execFileSync } from "node:child_process";

const PUERTO = process.env.PORT ?? "3000";

function ejecutar(comando, args) {
  try {
    return execFileSync(comando, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    // Sin resultados (nadie escucha) o el comando no existe: en ambos casos
    // no hay nada que liberar.
    return "";
  }
}

/** PIDs que están escuchando en el puerto. */
function buscarPids() {
  if (process.platform === "win32") {
    const salida = ejecutar("netstat", ["-ano", "-p", "TCP"]);
    const pids = new Set();

    for (const linea of salida.split("\n")) {
      // "  TCP    0.0.0.0:3000   0.0.0.0:0   LISTENING   19396"
      if (!linea.includes("LISTENING")) continue;

      const columnas = linea.trim().split(/\s+/);
      if (!(columnas[1] ?? "").endsWith(`:${PUERTO}`)) continue;

      const pid = columnas.at(-1);
      if (pid && pid !== "0") pids.add(pid);
    }

    return [...pids];
  }

  const salida = ejecutar("lsof", ["-ti", `tcp:${PUERTO}`, "-sTCP:LISTEN"]);
  return salida
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

function nombreDelProceso(pid) {
  if (process.platform !== "win32") return "";

  const salida = ejecutar("tasklist", ["/FI", `PID eq ${pid}`, "/NH", "/FO", "CSV"]);
  return salida.split(",")[0]?.replaceAll('"', "").trim() ?? "";
}

function matar(pid) {
  if (process.platform === "win32") {
    // /T incluye a los hijos: es justamente el árbol que quedó colgado.
    ejecutar("taskkill", ["/PID", pid, "/T", "/F"]);
  } else {
    ejecutar("kill", ["-9", pid]);
  }
}

const pids = buscarPids();

if (pids.length === 0) process.exit(0);

for (const pid of pids) {
  const nombre = nombreDelProceso(pid);
  console.log(
    `[puerto ${PUERTO}] Quedó un proceso escuchando${nombre ? ` (${nombre})` : ""}, ` +
      `PID ${pid}: se cierra antes de arrancar.`,
  );
  matar(pid);
}

// Dar un instante al sistema para liberar el socket antes de que Next escuche.
await new Promise((resolve) => setTimeout(resolve, 400));

const restantes = buscarPids();

if (restantes.length > 0) {
  console.error(
    `[puerto ${PUERTO}] No se pudo liberar el puerto (PID ${restantes.join(", ")}). ` +
      "Cerralo a mano antes de seguir: el servidor que arranque no va a poder escuchar.",
  );
  process.exit(1);
}
