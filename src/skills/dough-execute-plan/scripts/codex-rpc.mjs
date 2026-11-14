import { EventEmitter } from "node:events";
import { UnixWebSocket } from "./codex-unix-websocket.mjs";

export class NativeRefusal extends Error {
  /** @param {string} message @param {number | undefined} [code] */
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// Closing a client detaches observation; it never interrupts the native turn.
export class CodexConnection extends EventEmitter {
  /** @param {string} endpoint @param {AbortSignal} signal */
  constructor(endpoint, signal) {
    super();
    this.signal = signal;
    this.socket = new UnixWebSocket(endpoint);
    this.nextId = 1;
    /** @type {Map<number, {resolve(value: unknown): void, reject(error: Error): void}>} */
    this.pending = new Map();
    this.disposed = false;
    this.opened = false;
    this.socket.once("open", () => {
      this.opened = true;
      this.emit("open");
    });
    this.socket.on("fault", () => this.lost());
    this.socket.on("close", () => this.lost());
    this.socket.on("message", (text) => this.receive(text));
    this.aborted = () => this.close();
    signal.addEventListener("abort", this.aborted, { once: true });
    if (signal.aborted) this.close();
  }

  receive(text) {
    try {
      const message = JSON.parse(text);
      if (!message || typeof message !== "object" || Array.isArray(message)) {
        throw new Error("Invalid native message.");
      }
      if (
        (message.id !== undefined &&
          typeof message.id !== "number" &&
          typeof message.id !== "string") ||
        (message.method !== undefined && typeof message.method !== "string")
      ) {
        throw new Error("Invalid native message identity.");
      }
      if (typeof message.id === "number" && message.method === undefined) {
        const waiting = this.pending.get(message.id);
        if (!waiting) return;
        this.pending.delete(message.id);
        if (message.error !== undefined) {
          const error = message.error;
          const detail =
            typeof error?.message === "string" ? error.message.trim() : "";
          const valid =
            detail.length > 0 &&
            detail.length <= 500 &&
            (error?.code === undefined ||
              (typeof error.code === "number" && Number.isFinite(error.code)));
          waiting.reject(
            new NativeRefusal(
              valid ? detail : "Codex refused the native request.",
              valid ? error.code : undefined,
            ),
          );
        } else waiting.resolve(message.result);
      } else this.emit("notification", message);
    } catch {
      this.lost();
    }
  }

  /** @param {{name:string, title?:string, version:string}} [clientInfo] */
  async initialize(clientInfo = { name: "open_dough", version: "1" }) {
    if (!this.opened) {
      await new Promise((resolve, reject) => {
        this.once("open", resolve);
        this.once("close", () => reject(new Error("Codex connection closed.")));
        if (this.disposed) reject(new Error("Codex connection closed."));
      });
    }
    await this.request("initialize", {
      clientInfo,
      capabilities: { experimentalApi: true },
    });
    this.socket.send(JSON.stringify({ method: "initialized" }));
  }

  /** @param {string} method @param {unknown} params @returns {Promise<unknown>} */
  request(method, params) {
    if (this.disposed || this.signal.aborted) {
      return Promise.reject(new Error("Codex connection closed."));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try {
        this.socket.send(JSON.stringify({ id, method, params }));
      } catch {
        this.lost();
      }
    });
  }

  lost() {
    if (this.disposed) return;
    this.close();
    this.emit("disconnect");
  }

  close() {
    if (this.disposed) return;
    this.disposed = true;
    this.signal.removeEventListener("abort", this.aborted);
    for (const waiting of this.pending.values()) {
      waiting.reject(new Error("Codex connection closed."));
    }
    this.pending.clear();
    this.socket.close();
    this.emit("close");
  }
}
