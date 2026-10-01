// Drive the attachment controller and real host adapters. Only native PTY and
// WebSocket dependencies are replaced to hold the closed-fd/onExit race still.
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import { expect, test as base } from "@playwright/test";
import type { IPty } from "@lydell/node-pty";
import type { WebSocket } from "ws";
import {
  terminalAttachFailedCode,
  terminalEndedCode,
} from "../src/agentTerminal.ts";
import type { TerminalSession } from "../server/agentTerminals.ts";
const native = createRequire(import.meta.url)(
  "@lydell/node-pty",
) as typeof import("@lydell/node-pty");
const originalSpawn = native.spawn;
const terminals: IPty[] = [];
let TerminalAttachments: typeof import("../server/terminalAttachments.ts").TerminalAttachments;
// A worker fixture gives this native-module replacement its own module cache,
// including when another spec statically imports the real host adapters.
const test = base.extend<object, { nativeSpawn: boolean }>({
  nativeSpawn: [
    // Playwright requires destructuring even for a fixture with no dependencies.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      native.spawn = (...args) => terminals.shift() ?? originalSpawn(...args);
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
  readonly closes: { code: number; reason: string }[] = [];
  send(): void {}
  close(code: number, reason: string): void {
    this.closes.push({ code, reason });
  }
  message(message: unknown): void {
    this.emit("message", Buffer.from(JSON.stringify(message)), false);
  }
}

function nativeTerminal(unavailable: boolean) {
  let exit: (() => void) | undefined;
  let resizes = 0;
  let kills = 0;
  let writes = 0;
  return {
    pty: {
      onData: () => ({ dispose() {} }),
      onExit: (listener: () => void) => {
        exit = listener;
        return { dispose() {} };
      },
      resize: () => {
        resizes++;
        if (unavailable) throw new Error("ioctl(2) failed, EBADF");
      },
      kill: () => {
        kills++;
        if (unavailable) throw new Error("Already gone.");
      },
      write: () => {
        writes++;
      },
    } as unknown as IPty,
    exit: () => exit?.(),
    resizes: () => resizes,
    kills: () => kills,
    writes: () => writes,
  };
}

for (const state of ["ready", "starting"] as const) {
  test(`unavailable PTY resize ends only the ${state} attachment without escaping the socket handler`, async () => {
    const failed = nativeTerminal(true);
    const healthy = nativeTerminal(false);
    terminals.push(failed.pty, healthy.pty);
    const attachments = new TerminalAttachments();
    const socket = new Socket();
    const session: TerminalSession = {
      sourceId: "open-dough",
      markedDone: false,
      folder: { path: "/tmp", shown: "/tmp" },
      session: {
        host: state === "ready" ? "claude" : "codex",
        sessionId: "resize-race",
        shortId: "resize-race",
        name: "Resize race",
        continuation: {
          endpoint: "http://localhost:1",
          workspace: "/tmp",
          args: [],
        },
      },
    };
    try {
      attachments.connect(socket as unknown as WebSocket, session);
      expect(() => {
        socket.message({ resize: { cols: 120, rows: 40 } });
      }).not.toThrow();
      await Promise.resolve();
      expect(socket.closes).toEqual([
        {
          code:
            state === "ready" ? terminalEndedCode : terminalAttachFailedCode,
          reason:
            state === "ready"
              ? "The terminal ended."
              : "Codex could not be attached.",
        },
      ]);
      // Queued messages and the delayed native exit cannot reuse or reclose it.
      socket.message({ resize: { cols: 100, rows: 30 } });
      socket.message({ input: "hello" });
      failed.exit();
      socket.emit("close");
      await Promise.resolve();
      expect(failed.resizes()).toBe(1);
      expect(failed.writes()).toBe(0);
      expect(failed.kills()).toBe(1);
      expect(socket.closes).toHaveLength(1);
      expect(attachments.type(session.session, "hello")).toBe(false);

      const second = new Socket();
      attachments.connect(second as unknown as WebSocket, session);
      second.message({ resize: { cols: 90, rows: 25 } });
      second.message({ input: "still available" });
      expect(healthy.resizes()).toBe(1);
      expect(healthy.writes()).toBe(1);
      expect(second.closes).toEqual([]);
    } finally {
      attachments.close();
      terminals.length = 0;
    }
  });
}
