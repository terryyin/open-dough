// Fixture service availability follows the vendor CLI start when requested.
import type { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { watchFile, unwatchFile } from "node:fs";

export async function listenForCodexDaemon(
  http: Server,
  socket: string,
  serve: boolean | "on-start",
  log: string,
): Promise<() => void> {
  if (serve === "on-start") {
    watchFile(log, { interval: 10 }, (current) => {
      if (current.size === 0) return;
      unwatchFile(log);
      http.listen(socket);
    });
    return () => {
      unwatchFile(log);
    };
  }
  if (serve)
    await new Promise<void>((resolve, reject) => {
      http.once("error", reject);
      http.listen(socket, resolve);
    });
  return () => {};
}

export async function closeCodexDaemon(
  http: Server,
  ws: WebSocketServer,
  sockets: Set<WebSocket>,
  stopListening: () => void,
): Promise<void> {
  for (const client of sockets) client.terminate();
  await new Promise<void>((resolve) => {
    ws.close(() => {
      resolve();
    });
  });
  stopListening();
  if (http.listening)
    await new Promise<void>((resolve) =>
      http.close(() => {
        resolve();
      }),
    );
}
