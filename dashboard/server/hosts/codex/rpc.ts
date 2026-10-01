// A connection to the vendor-owned shared app server. Closing this client
// detaches observation; it never interrupts a native turn or stops the daemon.
import { createConnection } from "node:net";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import WebSocket from "ws";
import { z } from "zod";

const execute = promisify(execFile);
const daemonSchema = z.object({ socketPath: z.string().min(1) });
const refusalSchema = z.object({ message: z.string().trim().min(1).max(500) });
const messageSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  method: z.string().optional(),
  params: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.unknown().optional(),
});
export class NativeRefusal extends Error {}

export async function daemonEndpoint(signal: AbortSignal): Promise<string> {
  const { stdout } = await execute("codex", ["app-server", "daemon", "start"], {
    // The shared daemon outlives story worktrees, including their retirement.
    cwd: homedir(),
    signal,
  });
  const { socketPath } = daemonSchema.parse(JSON.parse(stdout));
  if (!socketPath.startsWith("/"))
    throw new Error("Invalid native socket path.");
  return `unix://${socketPath}`;
}

export class CodexRpc {
  private readonly socket: WebSocket;
  private nextId = 1;
  private readonly pending = new Map<
    number,
    { resolve(value: unknown): void; reject(error: Error): void }
  >();
  private disposed = false;
  private terminal = false;
  private threadId: string | undefined;
  private disconnected = false;
  private settled: (() => void) | undefined;
  private failed: (() => Promise<void>) | undefined;
  private readonly aborted = () => {
    this.close();
  };

  constructor(
    endpoint: string,
    private readonly signal: AbortSignal,
  ) {
    if (!endpoint.startsWith("unix:///"))
      throw new Error("Invalid native endpoint.");
    this.socket = new WebSocket("ws://localhost/", {
      createConnection: () =>
        createConnection({ path: endpoint.slice("unix://".length) }),
    });
    this.socket.on("error", () => {
      this.lost();
    });
    this.socket.on("close", () => {
      this.lost();
    });
    this.socket.on("message", (data) => {
      let value: unknown;
      try {
        value = JSON.parse(
          (Array.isArray(data)
            ? Buffer.concat(data)
            : data instanceof ArrayBuffer
              ? Buffer.from(data)
              : data
          ).toString("utf8"),
        );
      } catch {
        this.lost();
        return;
      }
      const parsed = messageSchema.safeParse(value);
      if (!parsed.success) {
        this.lost();
        return;
      }
      const message = parsed.data;
      if (typeof message.id === "number" && message.method === undefined) {
        const waiting = this.pending.get(message.id);
        if (waiting === undefined) return;
        this.pending.delete(message.id);
        if (message.error !== undefined) {
          const refusal = refusalSchema.safeParse(message.error);
          waiting.reject(
            new NativeRefusal(
              refusal.success
                ? refusal.data.message
                : "Codex refused the native request.",
            ),
          );
        } else waiting.resolve(message.result);
      } else if (
        message.method === "turn/completed" &&
        z
          .object({ threadId: z.literal(this.threadId ?? "") })
          .safeParse(message.params).success
      ) {
        this.terminal = true;
        this.settled?.();
      }
      // Native approval/input requests stay native; the ordinary CLI answers
      // them. This client does not approve, deny or change configured policy.
    });
    signal.addEventListener("abort", this.aborted, { once: true });
  }

  async initialize(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.socket.once("open", resolve);
      this.socket.once("error", reject);
      this.socket.once("close", () => {
        reject(new Error("Codex connection closed."));
      });
      if (this.signal.aborted) this.close();
    });
    await this.request("initialize", {
      clientInfo: {
        name: "open_dough_dashboard",
        title: "Open Dough dashboard",
        version: "1",
      },
      capabilities: { experimentalApi: true },
    });
    this.socket.send(JSON.stringify({ method: "initialized" }));
  }

  watchThread(threadId: string): void {
    this.threadId = threadId;
  }

  request(method: string, params: unknown): Promise<unknown> {
    if (this.disposed || this.signal.aborted)
      return Promise.reject(new Error("Codex connection closed."));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }), (error) => {
        if (error) this.lost();
      });
    });
  }

  // The lifecycle owns observation beyond the HTTP caller's lifetime. A
  // background failure is accounted for before its connection is retired.
  observe(completed: () => void, failed: () => Promise<void>): void {
    this.settled = completed;
    this.failed = failed;
    if (this.terminal) completed();
    else if (this.disconnected) void failed().catch(() => {});
  }

  private lost(): void {
    if (this.disposed) return;
    this.disconnected = true;
    const failed = this.failed;
    this.close();
    void failed?.().catch(() => {
      /* Durable prior evidence still owns recovery. */
    });
  }

  close(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.signal.removeEventListener("abort", this.aborted);
    for (const waiting of this.pending.values())
      waiting.reject(new Error("Codex connection closed."));
    this.pending.clear();
    this.socket.terminate();
  }
}
