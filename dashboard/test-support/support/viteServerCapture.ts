import type { Plugin } from "vitest/config";
import type { CaptureLog } from "./frontendCaptureLog.ts";

type HmrSocket = {
  send: (data: string, ...rest: never[]) => void;
  on: (event: "close", listener: (code: number) => void) => void;
};

function messageType(data: unknown) {
  try {
    const { type } = JSON.parse(String(data)) as { type?: unknown };
    return typeof type === "string" ? type : undefined;
  } catch {
    return undefined;
  }
}

// Records each Vite HMR socket's open and close code and the type of each
// message the server sends it, without payload bodies.
export function viteServerCapture(record: CaptureLog): Plugin {
  const servers = new WeakSet<object>();
  let nextSocket = 0;
  return {
    name: "frontend-vite-server-capture",
    configureServer({ ws }) {
      if (servers.has(ws)) return;
      servers.add(ws);
      ws.on("connection", (socket: HmrSocket) => {
        const id = ++nextSocket;
        record("hmr-open", { socket: id });
        const send = socket.send.bind(socket);
        Object.assign(socket, {
          send: (data: string, ...rest: never[]) => {
            const type = messageType(data);
            if (type !== "connected") record("hmr-send", { socket: id, type });
            send(data, ...rest);
          },
        });
        socket.on("close", (code) => {
          record("hmr-close", { socket: id, code });
        });
      });
    },
  };
}
