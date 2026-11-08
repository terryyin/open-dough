// Claude execution traverses real installed start, publication and native
// launch phases. Codex refinement's journey is
// ./agent-launch-preparation-phases.spec.ts; Codex execution's changed-readiness
// handoff and retry progress are ./agent-launch-start-codex.spec.ts. A start kept
// with no running process: ../../backend-tests/launches/agent-launch-start-kept-not-running.spec.ts.
import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { changedReviewRevision } from "../support/startOrigin.ts";
import { expectStartProgress } from "../support/startProgressPage.ts";

// Story A's seed changed after its readiness review.
test.use({
  preparationHost: "claude",
  originRepository: queuedReadyRepository()
    .withRevision("changed review", changedReviewRevision)
    .please(),
});

test("initiating and observing pages show Claude Code throughout execution progress", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  await expectStartProgress(
    { page, dashboard, origin, codexProtocol },
    "execution",
    "claude",
  );
  expect(dashboard.claudeLaunchCalls()[0]?.argv.at(-1)).toContain(
    "- readiness: Changed since readiness review",
  );
});
