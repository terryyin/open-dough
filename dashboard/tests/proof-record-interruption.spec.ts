import { expect, test } from "./support/pageTest.ts";
import {
  readProof,
  removeProofDirectories,
  startProofRun,
} from "./support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

test("a deadline preserves finished attempts separately from unfinished work", async () => {
  test.setTimeout(60_000);
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
  expect(record.tests[1]?.attempts[0]?.status).not.toBe("passed");
});

test("graceful interruption records strict failure after one completed assertion", async () => {
  const run = startProofRun({ spec: "ordered.proof.ts" });
  try {
    await expect
      .poll(() => {
        try {
          const record = readProof(run.recordPath);
          return (
            record.tests[0]?.attempts[0]?.status === "passed" &&
            record.tests[1]?.attempts.length === 1
          );
        } catch {
          return false;
        }
      })
      .toBe(true);
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
    await expect
      .poll(() => {
        try {
          return readProof(run.recordPath).selectedCount;
        } catch {
          return 0;
        }
      })
      .toBe(1);
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
