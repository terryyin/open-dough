// A fresh run of the development notification fixture, under the E2E runner's
// own setup: serving from source requests no app build and no server bundle.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import { dashboardAppArtifactKey } from "../../tests/support/dashboardBuild.ts";
import { serverBundleArtifactKey } from "../../tests/support/serverBundle.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { removeProofDirectories } from "../../tests/support/proofRecordRun.ts";

test.afterEach(removeProofDirectories);

test("a development notification server starts from source and requests no app or bundle", async () => {
  const run = startPreparationProofRun({
    spec: "dev-notifications.proof.ts",
    setup: "e2eGlobalSetup.ts",
  });
  try {
    await run.passed();

    const requested = run.requestedArtifacts();
    expect(requested).not.toContain(dashboardAppArtifactKey);
    expect(requested).not.toContain(serverBundleArtifactKey);
  } finally {
    await run.stop();
  }
});
