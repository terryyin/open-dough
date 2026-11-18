// Fresh boundary-only runs, under the backend runner's own setup: server-input
// readiness prepares the server bundle before the case's own dashboard or
// custom boundary server starts, and requests no app build.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import { dashboardAppArtifactKey } from "../../tests/support/dashboardBuild.ts";
import { serverBundleArtifactKey } from "../../tests/support/serverBundle.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { removeProofDirectories } from "../../tests/support/proofRecordRun.ts";

test.afterEach(removeProofDirectories);

// A run of `spec` prepares the bundle before its first case's `fixture`
// starts a server, and requests no app build.
async function expectBundleOnly(spec: string, fixture: string) {
  const run = startPreparationProofRun({
    spec,
    setup: "backendGlobalSetup.ts",
  });
  try {
    await run.passed();

    expect(
      run.trace().filter(({ key }) => key === dashboardAppArtifactKey),
    ).toEqual([]);
    run.expectPreparedBefore(serverBundleArtifactKey, fixture);
  } finally {
    await run.stop();
  }
}

test("boundary-only preparation prepares its bundle and requests no app", async () => {
  await expectBundleOnly("boundary.proof.ts", "dashboard");
});

test("a custom landed-CI boundary start has its bundle prepared and requests no app", async () => {
  await expectBundleOnly("custom-boundary.proof.ts", "startServer");
});
