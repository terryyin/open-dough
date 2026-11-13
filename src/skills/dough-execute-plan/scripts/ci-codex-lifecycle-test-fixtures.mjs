import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  createMailbox,
  receiptPrefix,
  recordWorkerIdentity,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import { claimMailbox, codexStreamOwner } from "./ci-observer-owner.mjs";
import { runMailboxWorkerUntilBudget } from "./ci-mailbox-budget-test-fixtures.mjs";
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

// Ends a Codex stream mailbox by budget with a controlled clock: stream-mode
// identity so retained-stream classification applies, never a wall-clock wait.
export async function endCodexStreamByBudget({
  root,
  storage,
  repo,
  branch = "main",
  coordinator,
  sha,
  observeRoot = root,
}) {
  const directory = createMailbox(
    { mode: "execution", repo, branch, maxDurationMs: 5_000 },
    { root, storage },
  );
  const owner = codexStreamOwner({ root, coordinator });
  if (!claimMailbox(directory, owner)) {
    throw new Error(`Codex claim failed for ${directory}`);
  }
  recordWorkerIdentity(directory, { pid: 1, mode: "stream" });
  if (sha) registerPushedRevision(directory, sha);
  await runMailboxWorkerUntilBudget({
    directory,
    root,
    storage,
    observeRoot,
  });
  return directory;
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
