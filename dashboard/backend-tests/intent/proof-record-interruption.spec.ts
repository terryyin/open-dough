// Nested graceful interruption and forced kill; direct timed-out ProofRecord;
// readiness wait lives here on Vitest expect.poll (was proofRecordRun export).
import { afterAll, expect, test } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { stoppedBodyMarker } from "../../test-support/fixtures/quiet-reporter/stoppedBody.ts";
import type { DashboardProofRecord } from "../../test-support/support/proofRecordTypes.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "../../test-support/support/proofRecordRun.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import {
  openProof,
  proofFixtures,
  temporaryProof,
} from "../support/directProofRecord.ts";

afterAll(removeProofDirectories);

// Wait for the producer's actual progress before interrupting it. Bounded by
// the case timeout. Observe progress or producer/error disposition, then throw
// after polling stops so diagnostics never become a retried readiness predicate.
async function waitForProofState(
  run: ReturnType<typeof startProofRun>,
  reached: (record: DashboardProofRecord) => boolean,
): Promise<void> {
  let ended: string | undefined;
  const observation: { failure?: Error } = {};
  const failed = (error: unknown) => {
    observation.failure =
      error instanceof Error
        ? error
        : new Error(`Proof readiness failed: ${String(error)}`);
    return true;
  };
  void run.result.then(
    (result) => {
      ended = JSON.stringify({
        ...result,
        stdout: result.stdout.slice(-4_000),
        stderr: result.stderr.slice(-4_000),
      });
    },
    (error: unknown) => {
      ended = String(error);
    },
  );
  // Vitest poll defaults to 1s; bound to the default case timeout instead.
  await expect
    .poll(
      () => {
        let record: DashboardProofRecord | undefined;
        try {
          record = readProof(run.recordPath);
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          const incomplete =
            error instanceof SyntaxError ||
            (error instanceof Error &&
              /Unexpected end of JSON input|Unexpected token/.test(
                error.message,
              ));
          if (code !== "ENOENT" && !incomplete) return failed(error);
        }
        try {
          if (record !== undefined && reached(record)) return true;
        } catch (error) {
          return failed(error);
        }
        if (ended !== undefined)
          return failed(
            new Error(`Proof runner ended before requested progress: ${ended}`),
          );
        return false;
      },
      { timeout: 5_000 },
    )
    .toBe(true);
  if ("failure" in observation) throw observation.failure;
}

test("a deadline preserves finished attempts separately from unfinished work", () => {
  const { directory, recordPath } = temporaryProof();
  const ordered = path.join(proofFixtures, "ordered.proof.ts");
  const run = makeMe.aReporterRun
    .withOutputDir(path.join(directory, "test-results"))
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(directory)
    .holdingCases([
      { title: "finishes before the stopped test", file: ordered, line: 5 },
      { title: "is still running when stopped", file: ordered, line: 10 },
    ])
    .please();
  const [finished, unfinished] = run.cases;
  if (finished === undefined || unfinished === undefined)
    throw new Error("expected two selected cases");
  const proof = openProof(recordPath, run);
  const passed = makeMe.aReporterResult.withStatus("passed").please();
  proof.begin(finished, passed);
  proof.end(finished, passed);
  const hanging = makeMe.aReporterResult.please();
  proof.begin(unfinished, hanging);
  proof.finish(
    { status: "timedout", duration: 8_000, startTime: new Date() },
    "failed",
  );
  const record = readProof(recordPath);
  expect(record).toMatchObject({
    phase: "completed",
    selectedCount: 2,
    terminal: { runnerStatus: "timedout", strictStatus: "failed" },
  });
  expect(record.tests[0]?.attempts[0]?.status).toBe("passed");
  expect(record.tests[1]?.attempts).toHaveLength(1);
  expect(record.tests[1]?.attempts[0]?.status).toBeUndefined();
});

test("graceful interruption records strict failure after one completed assertion", async () => {
  const run = startProofRun({ spec: "ordered.proof.ts" });
  try {
    await waitForProofState(
      run,
      (record) =>
        record.tests[0]?.attempts[0]?.status === "passed" &&
        record.tests[1]?.attempts.length === 1 &&
        existsSync(stoppedBodyMarker(run.configFile)),
    );
    run.child.kill("SIGINT");
    const result = await run.result;
    expect(result.status).not.toBe(0);
    const record = readProof(run.recordPath);
    expect(record).toMatchObject({
      phase: "completed",
      selectedCount: 2,
      terminal: { runnerStatus: "interrupted", strictStatus: "failed" },
    });
    expect(record.tests[0]?.attempts[0]?.status).toBe("passed");
    expect(record.tests[1]?.attempts[0]?.status).not.toBe("passed");
  } finally {
    await run.stop();
  }
});

test("a forced group kill after selection leaves a readable nonterminal snapshot", async () => {
  const run = startProofRun({ spec: "hanging.proof.ts" });
  try {
    await waitForProofState(run, (record) => record.selectedCount === 1);
    const pid = run.child.pid;
    if (pid === undefined) throw new Error("The proof runner did not start");
    process.kill(-pid, "SIGKILL");
    expect(await run.result).toMatchObject({ status: null, signal: "SIGKILL" });
    const record = readProof(run.recordPath);
    expect(record.phase).toBe("running");
    expect(record.terminal).toBeUndefined();
    expect(record.tests).toHaveLength(1);
  } finally {
    await run.stop();
  }
});

test("readiness reports a completed child when the requested progress cannot arrive", async () => {
  const run = startProofRun({ spec: "passing.proof.ts" });
  try {
    await expect(
      waitForProofState(run, (record) => record.selectedCount === 2),
    ).rejects.toThrow(
      /Proof runner ended before requested progress: .*"status":0/,
    );
    expect(await run.result).toMatchObject({ status: 0, signal: null });
  } finally {
    await run.stop();
  }
});

test("readiness surfaces a proof predicate error and lets the caller retire its producer", async () => {
  const run = startProofRun({ spec: "ordered.proof.ts" });
  const failure = new Error("The proof predicate failed");
  try {
    await expect(
      waitForProofState(run, () => {
        throw failure;
      }),
    ).rejects.toBe(failure);
  } finally {
    await run.stop();
  }
  expect(processRunning(run.child.pid)).toBe(false);
});

test("readiness surfaces a record read error instead of treating it as missing progress", async () => {
  const run = startProofRun({
    spec: "passing.proof.ts",
    recordPath: proofDirectory(),
  });
  try {
    await expect(waitForProofState(run, () => false)).rejects.toMatchObject({
      code: "EISDIR",
    });
  } finally {
    await run.stop();
  }
  expect(processRunning(run.child.pid)).toBe(false);
});
