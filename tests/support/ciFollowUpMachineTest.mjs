// Technical process boundary for the real machine ledger, isolated from HOME.
import { fork } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
export function repeatMachine(t) {
  const home = mkdtempSync(path.join(tmpdir(), "ci-follow-up-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  return {
    home,
    file: path.join(home, ".open-dough/dashboard/ci-follow-up.json"),
  };
}
export function ledgerProcess(home, input) {
  const child = fork(
    new URL("../fixtures/ci-follow-up-worker.mjs", import.meta.url),
    [],
    {
      env: { ...process.env, HOME: home, NODE_NO_WARNINGS: "1" },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    },
  );
  let stderr = "";
  child.stderr.on("data", (part) => {
    stderr += part;
  });
  const message = once(child, "message").then(([value]) => value);
  const terminal = once(child, "exit").then(([code, signal]) => ({
    code,
    signal,
    stderr,
  }));
  child.send(input);
  return { child, message, terminal };
}
export async function ledgerAction(home, input) {
  const process = ledgerProcess(home, input);
  const message = await process.message;
  const terminal = await process.terminal;
  if (terminal.code !== 0) throw new Error(terminal.stderr);
  return message;
}
