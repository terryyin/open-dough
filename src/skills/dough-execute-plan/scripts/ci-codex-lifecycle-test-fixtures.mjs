import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { receiptPrefix } from "./ci-mailbox.mjs";
import { deferChildExit } from "./fixture-teardown-test-fixtures.mjs";

export const launcher = fileURLToPath(
  new URL("./ci-mailbox.mjs", import.meta.url),
);
export const completingFixture = fileURLToPath(
  new URL("./ci-observer-stream-fixture.mjs", import.meta.url),
);
export const key = "ci-watch-execution:owner/repo:main:coordinator";
export const runCommand = promisify(execFile);

async function waitForLine(stream) {
  const lines = createInterface({ input: stream });
  try {
    const [line] = await once(lines, "line");
    return line;
  } finally {
    lines.close();
  }
}

export function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("exit", (code, signal) =>
      code === 0
        ? resolve()
        : reject(new Error(`observer exited ${code ?? signal}`)),
    );
    child.once("error", reject);
  });
}

// Replays Codex's stream lifecycle. Each stream child `setup` spawns is ended
// with `exitSignal` through `teardown` (a `fixtureTeardown`) before its
// fixture is removed, even when its receipt never arrives or does not parse.
export function createCodexReplay(
  teardown,
  env,
  {
    command = [
      launcher,
      "stream",
      "--execution",
      "owner/repo",
      "main",
      "60000",
    ],
    exitSignal = "SIGTERM",
  } = {},
) {
  const saved = new Map();
  let launches = 0;

  return {
    async setup() {
      const retained = saved.get(key);
      if (["watching", "finished"].includes(retained?.status)) return retained;
      launches += 1;
      const child = spawn(process.execPath, command, { env });
      deferChildExit(teardown, child, exitSignal);
      const receipt = await waitForLine(child.stdout);
      const { directory, pid } = JSON.parse(
        receipt.slice(receiptPrefix.length),
      );
      const state = {
        status: "watching",
        sessionId: child.pid,
        directory,
        pid,
        process: child,
      };
      saved.set(key, state);
      child.once("exit", () => {
        if (saved.get(key)?.status !== "watching") return;
        saved.set(key, {
          status: "finished",
          sessionId: undefined,
          directory,
          process: child,
        });
      });
      return state;
    },
    launches: () => launches,
    state: () => saved.get(key),
    forgetHandles: () => saved.clear(),
    async stop() {
      const state = saved.get(key);
      saved.set(key, { ...state, status: "stopped" });
      state.process.kill("SIGINT");
      await waitForExit(state.process);
      return saved.get(key);
    },
  };
}
