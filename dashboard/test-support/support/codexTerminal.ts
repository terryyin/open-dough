import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import WebSocket from "ws";
import type { FakeCodex } from "./fakeCodex.ts";
import {
  terminalUrl,
  type Terminal,
  type TerminalServer,
} from "../agentTerminalBoundary.ts";
import { processRunning } from "./processGroup.ts";
import { appendedRecords } from "./appendedRecords.ts";

export type CodexAttach = {
  pid: number;
  cwd: string;
  args: string[];
  cols: number;
  rows: number;
};
const root = (native: FakeCodex) =>
  native.env["FAKE_CODEX_TERMINAL_ROOT"] ?? "";
function read(native: FakeCodex, name: string) {
  try {
    return readFileSync(path.join(root(native), name), "utf8");
  } catch {
    return "";
  }
}
export const codexAttaches = (native: FakeCodex): CodexAttach[] =>
  appendedRecords<CodexAttach>(read(native, "attaches.jsonl"));
export const codexEnded = (native: FakeCodex, pid: number) =>
  read(native, `${String(pid)}.ended`);
// How the attached codex ended, read only once it is gone: it records the
// reason before exiting, so a codex that has recorded a hang-up may still run.
export const codexEndOnceGone = (native: FakeCodex, pid: number) =>
  processRunning(pid) ? "running" : codexEnded(native, pid);
export const codexLines = (native: FakeCodex, pid: number): string[] =>
  appendedRecords<string>(read(native, `${String(pid)}.lines`));
export function codexTerminalMode(
  native: FakeCodex,
  mode: "ready" | "review" | "unready" | "fail" | "partial" | "workspace-loss",
) {
  writeFileSync(
    path.join(root(native), "control.json"),
    JSON.stringify({ mode }),
  );
}
export async function openCodexTerminal(
  server: TerminalServer,
  id: string,
): Promise<Terminal> {
  const url = new URL(terminalUrl(server, "open-dough", id));
  url.searchParams.set("host", "codex");
  const socket = new WebSocket(url, { origin: server.origin });
  let output = "";
  socket.on("message", (data: Buffer, binary) => {
    if (!binary) output += data.toString("utf8");
  });
  const closed = new Promise<number>((resolve) => socket.on("close", resolve));
  await new Promise<void>((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  return {
    socket,
    closed,
    output: () => output,
    send: (message) => {
      socket.send(JSON.stringify(message));
    },
  };
}
