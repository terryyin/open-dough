// Run by ../../../backend-tests/runtime/runner-ownership.spec.ts under
// Dashboard Backend Test's setup, which registers no comparison mount.
import { expect, test } from "../../support/pageTest.ts";
import { comparisonMountBuild } from "../../support/comparisonMountArtifact.ts";

test("a request for an artifact the run does not register fails naming it", async () => {
  await expect(comparisonMountBuild()).rejects.toThrow(
    "Could not prepare dashboard artifact intent-comparison-mount: this run's setup does not register it.",
  );
});
