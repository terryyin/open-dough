// The collector's command line (ci-proof-summary.mjs) as its tests run it,
// in a temporary directory each test removes after itself.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { revision } from "./ci-proof-test-fixtures.mjs";

const script = fileURLToPath(
  new URL("./ci-proof-summary.mjs", import.meta.url),
);

export function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-summary-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

export const cli = (...args) =>
  spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

// One `tests` part's fragment from SOURCE, its report option, and a summary
// of FRAGMENTS declaring EXPECT, each naming the attempt by ATTEMPT options.
export const fragmentTests = (source, attempt, out) =>
  cli(
    "fragment",
    ...source,
    "--entry",
    "tests",
    "--part",
    "1",
    "--of",
    "1",
    ...attempt,
    "--revision",
    revision,
    "--out",
    out,
  );
export const summarizeTests = (fragments, attempt, out, expect = "tests=1") =>
  cli(
    "summarize",
    "--fragments",
    fragments,
    "--expect",
    expect,
    "--repository",
    "O/P",
    ...attempt,
    "--revision",
    revision,
    "--out",
    out,
  );
