import { expect, test } from "./support/pageTest.ts";
import path from "node:path";
import {
  proofFixtures,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "./support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

for (const scenario of [
  {
    name: "assertion failure",
    spec: "failing.proof.ts",
    status: "failed",
    runner: "failed",
    diagnostic: "FAIL:",
  },
  {
    name: "passing assertion output",
    spec: "printing.proof.ts",
    status: "passed",
    runner: "passed",
    diagnostic: "PRINTED:",
  },
  {
    name: "setup output",
    spec: "passing.proof.ts",
    status: "passed",
    runner: "passed",
    diagnostic: "outside any test",
    config: { globalSetup: path.join(proofFixtures, "printingSetup.ts") },
  },
]) {
  test(`${scenario.name} retains assertion results separately from the strict failed verdict`, async () => {
    const run = startProofRun({
      spec: scenario.spec,
      config: scenario.config ?? {},
    });
    const result = await run.result;
    expect(result.status).toBe(1);
    expect(result.stdout).toContain(scenario.diagnostic);
    expect(result.stdout.trimEnd().split("\n").at(-1)).toBe(
      `Kept: ${run.outputDir}`,
    );
    const record = readProof(run.recordPath);
    expect(record).toMatchObject({
      phase: "completed",
      selectedCount: 1,
      terminal: { runnerStatus: scenario.runner, strictStatus: "failed" },
    });
    expect(record.tests[0]?.attempts).toMatchObject([
      { status: scenario.status },
    ]);
  });
}
