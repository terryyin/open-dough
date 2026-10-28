// Raw diagnostic capture on LiveTerminalClient stays within the declared
// budget before keep/exit settles, still explains an early exit with a useful
// tail, and is released after a successful keep so later redraw traffic does
// not accumulate a lifetime string.
import type { IPty } from "@lydell/node-pty";
import { expect, test } from "../support/pageTest.ts";
import {
  diagnosticCaptureBudgetBytes,
  LiveTerminalClient,
} from "../../server/liveTerminalClient.ts";
import { settleKeep } from "../../server/terminalKeep.ts";

type SyntheticPty = {
  readonly pty: IPty;
  readonly emit: (chunk: string) => void;
  readonly exit: () => void;
};

function syntheticPty(): SyntheticPty {
  let onData: ((chunk: string) => void) | undefined;
  let onExit: (() => void) | undefined;
  return {
    pty: {
      cols: 80,
      rows: 24,
      onData: (listener: (chunk: string) => void) => {
        onData = listener;
        return { dispose() {} };
      },
      onExit: (listener: () => void) => {
        onExit = listener;
        return { dispose() {} };
      },
      resize: () => {},
      kill: () => {},
      write: () => {},
    } as unknown as IPty,
    emit: (chunk: string) => {
      onData?.(chunk);
    },
    exit: () => {
      onExit?.();
    },
  };
}

const session = {
  host: "cursor" as const,
  sessionId: "6f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f",
  name: "Diagnostic capture",
  continuation: {
    workspace: "/tmp",
    args: ["cursor-agent"],
  },
};

function watchedClient(pty: IPty, tracked: Map<IPty, LiveTerminalClient>) {
  const client = new LiveTerminalClient({
    pty,
    key: "diagnostic-capture",
    hostName: "Cursor",
    keep: true,
    session,
    admitted: false,
    size: { cols: 80, rows: 24 },
    readiness: undefined,
    startupFailure: undefined,
    isTracked: () => tracked.has(pty),
    untrack: () => tracked.delete(pty),
  });
  tracked.set(pty, client);
  client.watch();
  return client;
}

test("output above the diagnostic budget keeps only a useful tail for processExit", async () => {
  const { pty, emit, exit } = syntheticPty();
  const tracked = new Map<IPty, LiveTerminalClient>();
  const client = watchedClient(pty, tracked);
  const head = "HEAD-DROPPED-PREFIX";
  const tail = "EARLY-EXIT-MARKER";
  emit(`${head}${"A".repeat(diagnosticCaptureBudgetBytes)}${tail}`);
  expect(client.retainedDiagnosticBytes()).toBeLessThanOrEqual(
    diagnosticCaptureBudgetBytes,
  );
  expect(client.retainedDiagnosticBytes()).toBeGreaterThan(0);
  exit();
  const text = await client.processExit;
  expect(Buffer.byteLength(text, "utf8")).toBeLessThanOrEqual(
    diagnosticCaptureBudgetBytes,
  );
  expect(text).toContain(tail);
  expect(text).not.toContain(head);
});

test("a successful keep releases diagnostic capture so later output does not accumulate", async () => {
  const { pty, emit, exit } = syntheticPty();
  const tracked = new Map<IPty, LiveTerminalClient>();
  let client!: LiveTerminalClient;
  const settling = settleKeep({
    existing: undefined,
    pty,
    tracked: (held) => tracked.has(held),
    start: () => {
      client = watchedClient(pty, tracked);
      return client;
    },
  });
  emit("held prompt ready\r\n");
  await expect(settling).resolves.toMatchObject({ kind: "kept" });
  expect(client.retainedDiagnosticBytes()).toBe(0);
  emit("X".repeat(diagnosticCaptureBudgetBytes + 4096));
  expect(client.retainedDiagnosticBytes()).toBe(0);
  exit();
  expect(await client.processExit).toBe("");
});
