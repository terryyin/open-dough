// Schedule actual directory loss at the native spawn boundary, after the host's check.
// Production attachment/observation/transport logic is not replaced.
import { EventEmitter } from "node:events";
import { mkdtempSync, mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test, vi } from "vitest";
import type { WebSocket } from "ws";
import { terminalWorkspaceUnavailableCode } from "../../src/agentTerminal.ts";
import { TerminalAttachments } from "../../server/terminalAttachments.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

let scheduledLoss: string | undefined;
let observedBeforeLoss = false;
vi.mock(import("@lydell/node-pty"), async (original) => {
  const native = await original();
  return {
    ...native,
    spawn: (executable, args, options) => {
      if (scheduledLoss === undefined)
        return native.spawn(executable, args, options);
      expect(options.cwd).toBe(scheduledLoss);
      observedBeforeLoss = statSync(scheduledLoss).isDirectory();
      rmSync(scheduledLoss, { recursive: true });
      // Starting in the now missing cwd must fail at the real native PTY
      // boundary. No Codex executable or retained session is actually run.
      return native.spawn(
        process.execPath,
        ["-e", "process.exit(99)"],
        options,
      );
    },
  };
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
  const session = makeMe.aHostSession
    .codex({
      sessionId: "retained-spawn-race",
      continuation: { workspace, endpoint: "unix:///unused", args: [] },
    })
    .named("Retained spawn race")
    .please();
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
    // No attachment holds the refused socket: ending them closes nothing more.
    attachments.endAttachments(session);
    expect(socket.closes).toHaveLength(1);
    expect(() => statSync(workspace)).toThrow();
  } finally {
    scheduledLoss = undefined;
    attachments.close();
    rmSync(root, { recursive: true, force: true });
  }
});
