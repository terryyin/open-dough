// The dashboard keeps native turn observation; installed execution commands
// share the same dependency-free daemon connection.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { z } from "zod";
import { developerShellEnvironment } from "../../developerShellEnvironment.ts";
import { CodexConnection } from "../../../../Distribution/src/skills/dough-execute-plan/scripts/codex-rpc.mjs";
export { NativeRefusal } from "../../../../Distribution/src/skills/dough-execute-plan/scripts/codex-rpc.mjs";

const execute = promisify(execFile);
const daemonSchema = z.object({ socketPath: z.string().min(1) });

export async function daemonEndpoint(signal: AbortSignal): Promise<string> {
  const { stdout } = await execute("codex", ["app-server", "daemon", "start"], {
    cwd: homedir(),
    env: developerShellEnvironment(process.env),
    signal,
  });
  const { socketPath } = daemonSchema.parse(JSON.parse(stdout));
  if (!socketPath.startsWith("/"))
    throw new Error("Invalid native socket path.");
  return `unix://${socketPath}`;
}

export class CodexRpc extends CodexConnection {
  private terminal = false;
  private threadId: string | undefined;
  private disconnected = false;
  private settled: (() => void) | undefined;
  private failed: (() => Promise<void>) | undefined;

  constructor(endpoint: string, signal: AbortSignal) {
    super(endpoint, signal);
    this.on("notification", (message: unknown) => {
      const parsed = z
        .object({
          method: z.literal("turn/completed"),
          params: z.object({ threadId: z.literal(this.threadId ?? "") }),
        })
        .safeParse(message);
      if (parsed.success) {
        this.terminal = true;
        this.settled?.();
      }
      // Approval/input requests stay native; this observer does not answer them.
    });
    this.on("disconnect", () => {
      this.disconnected = true;
      void this.failed?.().catch(() => {
        /* Durable prior evidence still owns recovery. */
      });
    });
  }

  override async initialize(): Promise<void> {
    await super.initialize({
      name: "open_dough_dashboard",
      title: "Open Dough dashboard",
      version: "1",
    });
  }

  watchThread(threadId: string): void {
    this.threadId = threadId;
  }

  observe(completed: () => void, failed: () => Promise<void>): void {
    this.settled = completed;
    this.failed = failed;
    if (this.terminal) completed();
    else if (this.disconnected) void failed().catch(() => {});
  }
}
