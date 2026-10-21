// A starter creates the runner directory, then spawns the runner detached.
// The runner spends its module load before it watches that directory. A test
// that owns the home can remove it in that window (the server is already
// gone, and the exit fallback has been withdrawn). The runner must exit
// instead of creating the directory again and staying up for the rest of the
// run, where worker exit only SIGTERMs a runner it still knows and the run's
// settle then finds this one still alive.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import {
  ensureCursorRunner,
  stopCursorRunner,
} from "../../server/hosts/cursor/runnerClient.ts";
import { cursorRunnerDirectory } from "../../server/hosts/cursor/runnerPaths.ts";
import { cursorRunnerChildEnvironment } from "../../server/hosts/cursor/runnerProcess.ts";
import { runnersFor } from "../support/cursorRunnerJourney.ts";
import { repoRoot } from "../support/repositoryRoot.ts";

const runnerMain = path.join(
  repoRoot,
  "dashboard/server/hosts/cursor/runnerMain.ts",
);

test("a runner exits when its starter directory was removed before it started", async () => {
  test.setTimeout(30_000);
  const root = mkdtempSync(path.join(tmpdir(), "dough-runner-discarded-"));
  const home = path.join(root, "home");
  mkdirSync(home);
  const directory = cursorRunnerDirectory(home);
  const child = spawn(
    process.execPath,
    ["--experimental-transform-types", "--no-warnings", runnerMain],
    {
      stdio: "ignore",
      env: cursorRunnerChildEnvironment(process.env, home),
    },
  );
  const exited = new Promise<number | null>((resolve) => {
    child.once("exit", resolve);
  });
  try {
    await expect.poll(() => child.exitCode, { timeout: 15_000 }).toBe(0);
    expect(existsSync(directory)).toBe(false);
  } finally {
    if (child.exitCode === null) child.kill("SIGKILL");
    await exited;
    rmSync(root, { recursive: true, force: true });
  }
});

test("a runner started for one home does not remain under another after that home is removed", async () => {
  test.setTimeout(30_000);
  const root = mkdtempSync(path.join(tmpdir(), "dough-runner-home-"));
  const requested = path.join(root, "home");
  const other = path.join(root, "other");
  mkdirSync(requested);
  mkdirSync(other);
  const previous = process.env["HOME"];
  process.env["HOME"] = other;
  try {
    expect(await ensureCursorRunner(requested)).toBe(true);
    rmSync(requested, { recursive: true, force: true });
    await expect.poll(() => runnersFor(other), { timeout: 3_000 }).toBe(0);
    await expect.poll(() => runnersFor(requested), { timeout: 3_000 }).toBe(0);
  } finally {
    if (previous === undefined) delete process.env["HOME"];
    else process.env["HOME"] = previous;
    await stopCursorRunner(requested);
    await stopCursorRunner(other);
    rmSync(root, { recursive: true, force: true });
  }
});
