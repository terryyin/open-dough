// The helper node-pty executes on every new terminal. The runner loads it
// from the dashboard install that started this process. A later install
// removes that file while this process keeps running, and the next terminal
// then fails to spawn. The path is published so new work can see that.
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

// The same place node-pty resolves its helper: beside `pty.node` under the
// platform package, reached from that package's entry in `lib/`.
export function cursorRunnerSpawnHelper(): string {
  const entry = require.resolve(
    `@lydell/node-pty-${process.platform}-${process.arch}`,
  );
  const helper = path.resolve(
    path.dirname(entry),
    "..",
    "prebuilds",
    `${process.platform}-${process.arch}`,
    "spawn-helper",
  );
  if (!existsSync(helper)) {
    throw new Error("The Cursor runner could not find its terminal helper.");
  }
  return helper;
}
