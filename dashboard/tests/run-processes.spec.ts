// A run ends every process it started, proven by running Playwright itself on
// a temporary config whose specs are the substitutes in
// ./fixtures/run-processes: each page journey starts a preview server, which
// starts its Cursor runner, and after the run, passing or failing with a
// teardown past its timeout, no process carrying that run's marker remains.
// The marker is a variable only the inner run's environment holds, which its
// workers, their servers, and the runners pass on, so processes of other
// runs and checkouts on this machine are never counted or signalled.

import { expect, test } from "./support/pageTest.ts";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runInnerPlaywright } from "./support/innerPlaywright.ts";
import { processRunning } from "./support/processGroup.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

const substitutes = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "fixtures",
  "run-processes",
);
const markerVariable = "OPEN_DOUGH_RUN_PROCESSES_MARKER";

type Marked = { readonly pid: number; readonly command: string };

// Every running process whose environment holds `marker`.
function markedProcesses(marker: string): Marked[] {
  const entry = `${markerVariable}=${marker}`;
  if (process.platform === "linux") {
    return readdirSync("/proc")
      .filter((name) => /^\d+$/.test(name))
      .flatMap((name) => {
        try {
          const environment = readFileSync(`/proc/${name}/environ`, "utf8");
          if (!environment.split("\0").includes(entry)) return [];
          const command = readFileSync(`/proc/${name}/cmdline`, "utf8");
          return [{ pid: Number(name), command: command.replace(/\0/g, " ") }];
        } catch {
          return [];
        }
      })
      .filter(({ pid }) => processRunning(pid));
  }
  // `-E` prints each process's environment after its command.
  const listing = spawnSync("ps", ["-axwwE", "-o", "pid=,command="], {
    encoding: "utf8",
  }).stdout;
  return listing
    .split("\n")
    .filter((line) => line.split(" ").includes(entry))
    .map((line) => Number(line.trim().split(" ")[0]))
    .filter((pid) => processRunning(pid))
    .map((pid) => ({
      pid,
      // Without its environment, which the listing above includes.
      command: spawnSync("ps", ["-ww", "-o", "command=", "-p", String(pid)], {
        encoding: "utf8",
      }).stdout.trim(),
    }));
}

// The marked processes still running once the run's own exits have had a
// few seconds to finish; any found are then ended, so this check leaves none.
async function remainingAfterRun(marker: string): Promise<Marked[]> {
  const deadline = Date.now() + 10_000;
  let remaining = markedProcesses(marker);
  while (remaining.length > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    remaining = markedProcesses(marker);
  }
  for (const { pid } of remaining) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Already gone.
    }
  }
  return remaining;
}

async function runSubstitute(spec: string): Promise<{
  readonly status: number | null;
  readonly output: string;
  readonly remaining: Marked[];
}> {
  const workDir = mkdtempSync(path.join(tmpdir(), "run-processes-"));
  try {
    // A teardown gets the config's timeout, so a short one keeps the
    // abandoned teardown short.
    const config = {
      testDir: substitutes,
      testMatch: spec,
      outputDir: path.join(workDir, "test-results"),
      retries: 0,
      workers: 1,
      timeout: 5_000,
      reporter: [["line"]],
    };
    const marker = randomUUID();
    const run = await runInnerPlaywright(workDir, config, {
      [markerVariable]: marker,
    });
    return {
      status: run.status,
      output: `${run.stdout}${run.stderr}`,
      remaining: await remainingAfterRun(marker),
    };
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

test("a passing run leaves none of its processes running", async () => {
  test.setTimeout(60_000);
  const run = await runSubstitute("passing.proof.ts");

  expect(run.status, run.output).toBe(0);
  expect(run.remaining).toEqual([]);
});

test("a run whose teardown outlasts its timeout leaves none of its processes running", async () => {
  test.setTimeout(90_000);
  const run = await runSubstitute("held-teardown.proof.ts");

  expect(run.status, run.output).not.toBe(0);
  expect(run.output).toContain('Tearing down "page" exceeded');
  expect(run.remaining).toEqual([]);
});

test("a run that times out while a production process runs leaves none of its processes running", async () => {
  test.setTimeout(60_000);
  const run = await runSubstitute("production-timeout.proof.ts");

  expect(run.status, run.output).not.toBe(0);
  expect(run.output).toContain("Test timeout of 5000ms exceeded");
  expect(run.remaining).toEqual([]);
});
