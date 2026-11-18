// A fresh frontend run, under the frontend runner's own setup: common app
// readiness builds the app before the case's own frontendApp starts, and the
// run requests no server bundle and no installed origin.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import { dashboardAppArtifactKey } from "../../tests/support/dashboardBuild.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { removeProofDirectories } from "../../tests/support/proofRecordRun.ts";

test.afterEach(removeProofDirectories);

test("frontend preparation builds its app and requests no bundle or origin", async () => {
  const run = startPreparationProofRun({
    spec: "frontend.proof.ts",
    setup: "frontendGlobalSetup.ts",
  });
  try {
    await run.passed();

    expect(run.requestedArtifacts()).toEqual([dashboardAppArtifactKey]);
    run.expectPreparedBefore(dashboardAppArtifactKey, "frontendApp");
  } finally {
    await run.stop();
  }
});
