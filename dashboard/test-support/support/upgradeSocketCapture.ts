import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { Plugin } from "vitest/config";
import { type CaptureLog, urlPath } from "./frontendCaptureLog.ts";
import { repoRoot } from "./repositoryRoot.ts";

type SocketEmit = (event: string | symbol, ...args: unknown[]) => boolean;
type SocketCall = (...args: never[]) => unknown;

const closeOpcode = 0x8;
const vitestApiPath = "/__vitest_browser_api__";

// Reads the status code of a WebSocket close frame starting at this chunk.
// Client frames are masked; server frames are not. Other frames yield nothing.
function closeFrameCode(chunk: unknown) {
  if (!Buffer.isBuffer(chunk) || chunk.length < 2) return undefined;
  if ((chunk.readUInt8(0) & 0x0f) !== closeOpcode) return undefined;
  const masked = (chunk.readUInt8(1) & 0x80) !== 0;
  const length = chunk.readUInt8(1) & 0x7f;
  if (length < 2) return { code: undefined };
  const start = masked ? 6 : 2;
  if (chunk.length < start + 2) return { code: undefined };
  const byte = (index: number) =>
    masked
      ? chunk.readUInt8(start + index) ^ chunk.readUInt8(2 + index)
      : chunk.readUInt8(start + index);
  return { code: (byte(0) << 8) | byte(1) };
}

function callerStack() {
  const lines = (new Error().stack ?? "").split("\n").slice(3, 15);
  return lines.map((line) =>
    line
      .trim()
      .replace(/(?:file|https?):\/\/[^/\s)]*/g, "")
      .replace(/\?[^:\s)]*/g, "")
      .replace(repoRoot, ""),
  );
}

function observeSocket(record: CaptureLog, socket: Duplex, details: object) {
  const emit = socket.emit.bind(socket) as SocketEmit;
  Object.assign(socket, {
    emit: (event: string | symbol, ...args: unknown[]) => {
      if (event === "data") {
        const frame = closeFrameCode(args[0]);
        if (frame) record("socket-close-frame-in", { ...details, ...frame });
      } else if (event === "end") record("socket-end", details);
      else if (event === "error") {
        const { code } = (args[0] ?? {}) as { code?: unknown };
        record("socket-error", { ...details, code });
      } else if (event === "close")
        record("socket-close", { ...details, hadError: args[0] });
      return emit(event, ...args);
    },
  });
  const wrap = (name: "destroy" | "end" | "write") => {
    const original = (socket[name] as SocketCall).bind(socket);
    Object.assign(socket, {
      [name]: (...args: never[]) => {
        if (name !== "write") {
          record(`socket-local-${name}`, { ...details, stack: callerStack() });
        } else {
          const frame = closeFrameCode(args[0]);
          if (frame) record("socket-close-frame-out", { ...details, ...frame });
        }
        return original(...args);
      },
    });
  };
  wrap("destroy");
  wrap("end");
  wrap("write");
}

// Records, for every upgraded socket on the dev server (HMR and the Vitest
// browser API), who ends it: a remote FIN, a local destroy or end call with
// its caller, an error code, close frames in either direction and the close.
// Vitest API sockets also record api-connect and api-disconnect by type.
export function upgradeSocketCapture(record: CaptureLog): Plugin {
  const servers = new WeakSet<object>();
  let nextSocket = 0;
  return {
    name: "frontend-upgrade-socket-capture",
    configureServer({ httpServer }) {
      if (!httpServer || servers.has(httpServer)) return;
      servers.add(httpServer);
      httpServer.prependListener(
        "upgrade",
        (request: IncomingMessage, socket: Duplex) => {
          const { url = "" } = request;
          const path = urlPath(url);
          const params = new URL(url, "http://localhost").searchParams;
          const type = params.get("type") ?? undefined;
          const details = { socket: ++nextSocket, path, type };
          record("upgrade-open", details);
          observeSocket(record, socket, details);
          if (path !== vitestApiPath) return;
          record("api-connect", { type });
          socket.prependOnceListener("close", (hadError: boolean) => {
            record("api-disconnect", { type, hadError });
          });
        },
      );
    },
  };
}
