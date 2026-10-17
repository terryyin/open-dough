// A run ends every process it started, proven by running Playwright itself on
// a temporary config whose specs are the substitutes in
// ../fixtures/run-processes. Each worker ends what descends from it when it
// exits (../support/processGroup.ts): each page journey starts a preview
// server, which starts its Cursor runner, and after the run, passing or
// failing with a teardown past its timeout, no process carrying that run's
// identity remains. A process no worker can reach that way -- one whose
// parent was already gone, left by a test whose teardown is abandoned -- is
// ended and named by the run's own teardown (../support/globalSetup.ts,
// ../support/runProcesses.ts), which fails the run. The identity is a
// variable only the inner run's environment holds, which its workers, their
// servers, and the runners pass on, so processes of other runs and checkouts
// on this machine are never counted or signalled.

import { expect, test } from "../support/pageTest.ts";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runInnerPlaywright } from "../support/innerPlaywright.ts";
import { processAlive } from "../support/processGroup.ts";
import { quietReporter } from "../support/proofRecordRun.ts";
import { repoRoot } from "../support/repositoryRoot.ts";
import {
  endRunProcesses,
  processesOfRun,
  runIdVariable,
  type RunProcess,
} from "../support/runProcesses.ts";

const substitutes = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "fixtures",
  "run-processes",
);
const globalSetup = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "support",
  "globalSetup.ts",
);

function innerConfig(workDir: string, spec: string) {
  // A teardown gets the config's timeout, so a short one keeps the
  // abandoned teardown short.
  return {
    testDir: substitutes,
    testMatch: spec,
    outputDir: path.join(workDir, "test-results"),
    retries: 0,
    workers: 1,
    timeout: 5_000,
    reporter: [["line"]],
  };
}

// Runs the substitute under a run identity of this test's own, with no
// teardown sweep, and reports what the workers' own exits left; any found
// are then ended, so this check leaves none.
async function runSubstitute(spec: string): Promise<{
  readonly status: number | null;
  readonly output: string;
  readonly remaining: RunProcess[];
}> {
  const workDir = mkdtempSync(path.join(tmpdir(), "run-processes-"));
  try {
    const runId = randomUUID();
    const run = await runInnerPlaywright(workDir, innerConfig(workDir, spec), {
      [runIdVariable]: runId,
    });
    return {
      status: run.status,
      output: `${run.stdout}${run.stderr}`,
      remaining: await endRunProcesses(runId, { settleMs: 10_000 }),
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

test("a run's own teardown ends a process its workers could not reach and fails naming it", async () => {
  // The inner run is a whole one under the suite's global setup: it builds
  // the dashboard once, takes its own run identity, and sweeps at its end.
  test.setTimeout(240_000);
  const workDir = mkdtempSync(path.join(tmpdir(), "run-processes-"));
  const record = path.join(workDir, "orphan.json");
  try {
    const run = await runInnerPlaywright(
      workDir,
      {
        ...innerConfig(workDir, "orphan-held-teardown.proof.ts"),
        timeout: 3_000,
        reporter: [[quietReporter]],
        globalSetup,
      },
      { OPEN_DOUGH_ORPHAN_RECORD: record },
    );
    const output = `${run.stdout}${run.stderr}`;
    const orphan = JSON.parse(readFileSync(record, "utf8")) as {
      pid: number;
      runId: string;
    };
    expect(run.status, output).not.toBe(0);
    expect(output).toContain(
      'Test timeout of 3000ms exceeded while running "afterEach" hook.',
    );
    expect(output).toContain("ERROR outside a test:");
    expect(output).toContain(
      "The run left 1 of its processes running after its workers exited, now ended.",
    );
    expect(output).toContain(`pid ${String(orphan.pid)} (up `);
    expect(output).toContain("dough-run-processes-orphan");
    expect(processAlive(orphan.pid)).toBe(false);
    expect(processesOfRun(orphan.runId)).toEqual([]);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});
