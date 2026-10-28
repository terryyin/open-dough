// A bursty 64 KiB / 2,048-chunk write into one kept client's screen must not
// stall TerminalAttachments.held() past the declared 500 ms budget while a
// quiet sibling stays coherent and both clients remain kept (not stopped).
import type { IPty } from "@lydell/node-pty";
import { expect, test } from "../support/pageTest.ts";
import { KeptClientScreen } from "../../server/keptClientScreen.ts";
import { TerminalAttachments } from "../../server/terminalAttachments.ts";

const burstBytes = 64 * 1024;
const burstChunks = 2048;
const heldBudgetMs = 500;
const marker = "QUEUE-MARKER";

type SyntheticPty = {
  readonly pty: IPty;
  readonly emit: (chunk: string) => void;
};

function syntheticPty(): SyntheticPty {
  let onData: ((chunk: string) => void) | undefined;
  return {
    pty: {
      cols: 80,
      rows: 24,
      onData: (listener: (chunk: string) => void) => {
        onData = listener;
        return { dispose() {} };
      },
      onExit: () => ({ dispose() {} }),
      resize: () => {},
      kill: () => {},
      write: () => {},
    } as unknown as IPty,
    emit: (chunk: string) => {
      onData?.(chunk);
    },
  };
}

function session(name: string, sessionId: string) {
  return {
    host: "cursor" as const,
    sessionId,
    name,
    continuation: {
      workspace: "/tmp",
      args: ["cursor-agent"],
    },
  };
}

function emitBurst(emit: (chunk: string) => void): void {
  const chunk = "A".repeat(burstBytes / burstChunks);
  for (let i = 0; i < burstChunks; i++) emit(chunk);
  emit(`\r\n${marker}\r\n`);
}

test("a 64 KiB / 2,048-chunk burst settles with the marker on the modeled screen", async () => {
  const screen = new KeptClientScreen(80, 24);
  try {
    const started = performance.now();
    emitBurst((chunk) => {
      screen.write(chunk);
    });
    await screen.settled();
    const elapsedMs = performance.now() - started;
    expect(screen.text()).toContain(marker);
    expect(elapsedMs).toBeLessThan(heldBudgetMs);
  } finally {
    screen.dispose();
  }
});

test("one busy kept client's burst leaves held() within 500 ms with a coherent quiet sibling still kept", async () => {
  const attachments = new TerminalAttachments();
  const busy = syntheticPty();
  const quiet = syntheticPty();
  try {
    const keepingBusy = attachments.keep(
      session("Busy screen queue", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
      busy.pty,
    );
    const keepingQuiet = attachments.keep(
      session("Quiet screen queue", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
      quiet.pty,
    );
    busy.emit("busy-ready\r\n");
    quiet.emit("quiet-ready\r\n");
    await Promise.all([keepingBusy, keepingQuiet]);

    emitBurst(busy.emit);

    const started = performance.now();
    const held = await attachments.held();
    const elapsedMs = performance.now() - started;

    expect(elapsedMs).toBeLessThan(heldBudgetMs);
    expect(held).toHaveLength(2);
    const busyHeld = held.find(
      (row) => row.session.name === "Busy screen queue",
    );
    const quietHeld = held.find(
      (row) => row.session.name === "Quiet screen queue",
    );
    expect(busyHeld?.session.sessionId).toBe(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    );
    expect(busyHeld?.screen).toContain(marker);
    expect(quietHeld?.session.sessionId).toBe(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    );
    expect(quietHeld?.screen).toContain("quiet-ready");
    expect(quietHeld?.screen).not.toContain(marker);
  } finally {
    attachments.close();
  }
});
