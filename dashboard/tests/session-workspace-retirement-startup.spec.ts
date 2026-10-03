// Schedule actual directory loss at the native spawn boundary, after the host's check.
// Production attachment/observation/transport logic is not replaced.
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { WebSocket } from "ws";
import { test as base, expect } from "./support/pageTest.ts";
import { terminalWorkspaceUnavailableCode } from "../src/agentTerminal.ts";

const native = createRequire(import.meta.url)(
  "@lydell/node-pty",
) as typeof import("@lydell/node-pty");
const originalSpawn = native.spawn;
let TerminalAttachments: typeof import("../server/terminalAttachments.ts").TerminalAttachments;
let scheduledLoss: string | undefined;
let observedBeforeLoss = false;
const test = base.extend<object, { nativeSpawn: boolean }>({
  nativeSpawn: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      native.spawn = (executable, args, options) => {
        if (scheduledLoss === undefined)
          return originalSpawn(executable, args, options);
        expect(options.cwd).toBe(scheduledLoss);
        observedBeforeLoss = statSync(scheduledLoss).isDirectory();
        rmSync(scheduledLoss, { recursive: true });
        // Starting in the now missing cwd must fail at the real native PTY
        // boundary. No Codex executable or retained session is actually run.
        return originalSpawn(
          process.execPath,
          ["-e", "process.exit(99)"],
          options,
        );
      };
      try {
        ({ TerminalAttachments } =
          await import("../server/terminalAttachments.ts"));
        await use(true);
      } finally {
        native.spawn = originalSpawn;
      }
    },
    { scope: "worker", auto: true },
  ],
});

class Socket extends EventEmitter {
  readonly OPEN = 1;
  readonly readyState = 1;
  readonly controls: unknown[] = [];
  readonly closes: { code: number; reason: string }[] = [];
  send(data: string, options?: { binary?: boolean }): void {
    if (options?.binary) this.controls.push(JSON.parse(data));
  }
  close(code: number, reason: string): void {
    this.closes.push({ code, reason });
  }
}

test("loss between successful host check and real PTY startup is established by re-observation, without reopening done intent", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-spawn-loss-"));
  const workspace = path.join(root, "saved-workspace");
  mkdirSync(workspace);
  scheduledLoss = workspace;
  observedBeforeLoss = false;
  const socket = new Socket();
  const attachments = new TerminalAttachments();
  const session = {
    host: "codex" as const,
    sessionId: "retained-spawn-race",
    name: "Retained spawn race",
    continuation: { workspace, endpoint: "unix:///unused", args: [] },
  };
  try {
    attachments.connect(socket as unknown as WebSocket, {
      sourceId: "unused",
      session,
      folder: { path: root, shown: root },
      markedDone: true,
    });
    await expect
      .poll(() => socket.closes)
      .toEqual([
        {
          code: terminalWorkspaceUnavailableCode,
          reason: "Saved workspace unavailable.",
        },
      ]);
    expect(observedBeforeLoss).toBe(true);
    expect(socket.controls).toContainEqual({
      workspaceUnavailable: { kind: "missing" },
    });
    expect(socket.controls).not.toContainEqual({ readiness: "attached" });
    expect(attachments.type(session, "no replacement input")).toBe(false);
    expect(() => statSync(workspace)).toThrow();
  } finally {
    scheduledLoss = undefined;
    attachments.close();
    rmSync(root, { recursive: true, force: true });
  }
});
