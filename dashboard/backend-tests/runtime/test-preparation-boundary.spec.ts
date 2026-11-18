// The custom landed-CI boundary server uses the bundle prepared by the backend
// runner and requests no app build.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import { dashboardAppArtifactKey } from "../../test-support/support/dashboardBuild.ts";
import { serverBundleArtifactKey } from "../../test-support/support/serverBundle.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { removeProofDirectories } from "../../test-support/support/proofRecordRun.ts";

test.afterEach(removeProofDirectories);

test("a custom landed-CI boundary start has its bundle prepared and requests no app", async () => {
  const run = startPreparationProofRun({
    spec: "custom-boundary.proof.ts",
    setup: "backendGlobalSetup.ts",
  });
  try {
    await run.passed();

    expect(run.requestedArtifacts()).not.toContain(dashboardAppArtifactKey);
    run.expectPreparedBefore(serverBundleArtifactKey, "startServer");
  } finally {
    await run.stop();
  }
});
