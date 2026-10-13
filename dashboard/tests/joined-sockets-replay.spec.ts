import { EventEmitter } from "node:events";
import type { WebSocket } from "ws";
import { expect, test } from "./support/pageTest.ts";
import { JoinedSockets } from "../server/joinedSockets.ts";
import type { ScreenReplay } from "../server/keptClientScreen.ts";
import type { TerminalSession } from "../server/agentTerminals.ts";

class Socket extends EventEmitter {
  readonly OPEN = 1;
  readyState = 1;
  readonly frames: { text: string; binary: boolean }[] = [];
  send(text: string, options?: { binary: boolean }): void {
    this.frames.push({ text, binary: options?.binary === true });
  }
}

const session: TerminalSession = {
  sourceId: "open-dough",
  markedDone: false,
  folder: { path: "/tmp", shown: "/tmp" },
  session: {
    host: "cursor",
    sessionId: "6f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f",
    name: "Joined replay",
    continuation: {
      workspace: "/tmp",
      args: ["--resume", "6f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f"],
    },
  },
};

test("a joining socket receives its replay before queued live output while the admitted socket receives only live output", async () => {
  const sockets = new JoinedSockets({
    hostName: "Cursor",
    admitted: true,
    readiness: undefined,
    startupFailure: undefined,
    isTracked: () => true,
    writeInput: () => {},
    resize: () => {},
    onDropped: () => {},
  });
  const existing = new Socket();
  sockets.attach(existing as unknown as WebSocket, session, false);
  let resolveReplay: (replay: ScreenReplay) => void = () => {};
  const replay = new Promise<ScreenReplay>((resolve) => {
    resolveReplay = resolve;
  });
  const joining = new Socket();
  sockets.attach(joining as unknown as WebSocket, session, true, replay);
  sockets.send("live update");
  await expect
    .poll(() => existing.frames)
    .toEqual([{ text: "live update", binary: false }]);
  expect(joining.frames).toEqual([
    { text: '{"readiness":"attached"}', binary: true },
  ]);
  resolveReplay({ cols: 80, rows: 24, output: "held screen" });
  await expect
    .poll(() => joining.frames)
    .toEqual([
      { text: '{"readiness":"attached"}', binary: true },
      { text: '{"replay":{"cols":80,"rows":24}}', binary: true },
      { text: "held screen", binary: false },
      { text: "live update", binary: false },
    ]);
  expect(existing.frames).toEqual([{ text: "live update", binary: false }]);
});

test("admission from another socket does not let live output overtake a pending join replay", async () => {
  const sockets = new JoinedSockets({
    hostName: "Cursor",
    admitted: false,
    readiness: (screen) => screen === "ready",
    startupFailure: undefined,
    isTracked: () => true,
    writeInput: () => {},
    resize: () => {},
    onDropped: () => {},
  });
  const existing = new Socket();
  sockets.attach(existing as unknown as WebSocket, session, false);
  let resolveReplay: (replay: ScreenReplay) => void = () => {};
  const replay = new Promise<ScreenReplay>((resolve) => {
    resolveReplay = resolve;
  });
  const joining = new Socket();
  sockets.attach(joining as unknown as WebSocket, session, true, replay);
  existing.emit(
    "message",
    Buffer.from(JSON.stringify({ screen: ["ready"], cursorVisible: true })),
    false,
  );
  sockets.send("live update");
  await expect
    .poll(() => existing.frames.at(-1))
    .toEqual({ text: "live update", binary: false });
  expect(joining.frames).toEqual([
    { text: '{"readiness":"observe"}', binary: true },
  ]);
  resolveReplay({ cols: 80, rows: 24, output: "held screen" });
  await expect
    .poll(() => joining.frames)
    .toEqual([
      { text: '{"readiness":"observe"}', binary: true },
      { text: '{"replay":{"cols":80,"rows":24}}', binary: true },
      { text: "held screen", binary: false },
      { text: '{"readiness":"attached"}', binary: true },
      { text: "live update", binary: false },
    ]);
});
