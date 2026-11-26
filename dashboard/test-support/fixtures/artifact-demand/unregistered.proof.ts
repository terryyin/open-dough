// Run by ../../../backend-tests/runtime/runner-ownership.spec.ts under
// Dashboard Backend Test's setup, which registers no such artifact.
import { expect, test } from "../../support/pageTest.ts";
import { requestRunArtifact } from "../../support/runArtifacts.ts";

test("a request for an artifact the run does not register fails naming it", async () => {
  await expect(
    requestRunArtifact("unregistered-proof-artifact"),
  ).rejects.toThrow(
    "Could not prepare dashboard artifact unregistered-proof-artifact: this run's setup does not register it.",
  );
});
