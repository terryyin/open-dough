import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import WebSocket from "ws";
import type { FakeCodex } from "./fakeCodex.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { terminalUrl, type Terminal } from "../agentTerminalBoundary.ts";

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
  read(native, "attaches.jsonl")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CodexAttach);
export const codexEnded = (native: FakeCodex, pid: number) =>
  read(native, `${String(pid)}.ended`);
export const codexLines = (native: FakeCodex, pid: number): string[] =>
  read(native, `${String(pid)}.lines`)
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as string);
export function codexTerminalMode(
  native: FakeCodex,
  mode: "ready" | "review" | "unready" | "fail" | "partial",
) {
  writeFileSync(
    path.join(root(native), "control.json"),
    JSON.stringify({ mode }),
  );
}
export async function openCodexTerminal(
  server: DashboardServer,
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
