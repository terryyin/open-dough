// The helper node-pty executes on every new terminal. The runner loads it
// from the dashboard install that started this process. A later install
// removes that file while this process keeps running, and the next terminal
// then fails to spawn. The path is published so new work can see that.
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

// Optional published proof path for the runner's wire `spawnHelper` (see
// ./runnerMain.ts). Lets a test publish a retired-checkout helper path
// without relocating this install's real node-pty helper. Empty or unset
// keeps the install path from cursorRunnerSpawnHelper().
export const cursorRunnerSpawnHelperProofVariable =
  "OPEN_DOUGH_CURSOR_SPAWN_HELPER_PROOF";

// The same place node-pty resolves its helper: beside `pty.node` under the
// platform package, reached from that package's entry in `lib/`. Some
// platforms ship no separate helper and fork without one.
export function cursorRunnerSpawnHelper(): string | undefined {
  let entry: string;
  try {
    entry = require.resolve(
      `@lydell/node-pty-${process.platform}-${process.arch}`,
    );
  } catch {
    return undefined;
  }
  const helper = path.resolve(
    path.dirname(entry),
    "..",
    "prebuilds",
    `${process.platform}-${process.arch}`,
    "spawn-helper",
  );
  return existsSync(helper) ? helper : undefined;
}

// Path the runner publishes and answers on the wire: an explicit proof
// path when set and present, otherwise this install's helper.
export function cursorRunnerPublishedSpawnHelper(): string | undefined {
  const proof = process.env[cursorRunnerSpawnHelperProofVariable];
  if (proof !== undefined && proof !== "" && existsSync(proof)) return proof;
  return cursorRunnerSpawnHelper();
}
