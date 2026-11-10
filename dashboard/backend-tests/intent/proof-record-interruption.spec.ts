import { expect, test } from "../../tests/support/pageTest.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofRun,
  waitForProofState,
} from "../../tests/support/proofRecordRun.ts";

import { processRunning } from "../../tests/support/processGroup.ts";

test.afterAll(removeProofDirectories);

test("a deadline preserves finished attempts separately from unfinished work", async () => {
  const run = startProofRun({
    spec: "ordered.proof.ts",
    config: { globalTimeout: 8_000 },
  });
  const result = await run.result;
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("Timed out waiting");
  const record = readProof(run.recordPath);
  expect(record).toMatchObject({
    phase: "completed",
    selectedCount: 2,
    terminal: { runnerStatus: "timedout", strictStatus: "failed" },
  });
  expect(record.tests[0]?.attempts[0]?.status).toBe("passed");
  // Started, then stopped by the deadline before its own case timeout: it
  // never ends on its own, so it has no status or an interrupted one.
  expect(record.tests[1]?.attempts).toHaveLength(1);
  expect([undefined, "interrupted"]).toContain(
    record.tests[1]?.attempts[0]?.status,
  );
});

test("graceful interruption records strict failure after one completed assertion", async () => {
  const run = startProofRun({ spec: "ordered.proof.ts" });
  try {
    await waitForProofState(
      run,
      (record) =>
        record.tests[0]?.attempts[0]?.status === "passed" &&
        record.tests[1]?.attempts.length === 1,
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
