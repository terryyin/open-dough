// A fresh boundary-only run, under the backend runner's own setup: common
// server-input readiness prepares the server bundle before the case's own
// dashboard starts, and requests no app build.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { removeProofDirectories } from "../../tests/support/proofRecordRun.ts";

test.afterEach(removeProofDirectories);

test("boundary-only preparation prepares its bundle and requests no app", async () => {
  const run = startPreparationProofRun({
    spec: "boundary.proof.ts",
    setup: "backendGlobalSetup.ts",
  });
  try {
    await run.passed();

    expect(run.trace().filter(({ key }) => key === "app")).toEqual([]);
    const bundle = run.completedAt("server-bundle");
    const dashboard = run.fixtureSteps("dashboard")[0]?.start;
    expect(bundle).toBeDefined();
    expect(dashboard).toBeGreaterThanOrEqual(bundle ?? Infinity);
  } finally {
    await run.stop();
  }
});
