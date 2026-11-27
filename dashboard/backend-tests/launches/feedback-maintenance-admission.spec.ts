import { feedbackWatchListPath } from "../../src/feedbackReview.ts";
import { publishCommittedOrigin } from "../../test-support/committedOrigin.ts";
import { expect, stored, test } from "../../test-support/support/codexStart.ts";
import {
  authorizeFeedbackMaintenance,
  dayFromToday,
} from "../../test-support/support/feedbackMaintenanceDue.ts";
import { watchListDue } from "../../test-support/support/feedbackMaintenanceServer.ts";
import { admittedStory } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { launchWaitMs } from "../../test-support/support/launchWait.ts";

test.use({
  serverMode: "boundary",
  extraEnv: { DOUGH_MAINTENANCE_CHECK_MS: "100" },
});

test("due feedback maintenance starts with its due date and Taken story identity", async ({
  dashboard,
  codexProtocol,
  github,
  origin,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const due = dayFromToday(-1);
  const revision = await origin.publishRevision({
    message: "Schedule feedback maintenance",
    files: { [feedbackWatchListPath]: watchListDue(due) },
  });
  await publishCommittedOrigin(github, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  authorizeFeedbackMaintenance(dashboard.home, { host: "codex" });
  await expect
    .poll(() => native.calls.filter(({ method }) => method === "turn/start"), {
      timeout: launchWaitMs,
    })
    .toHaveLength(1);
  const story = await admittedStory(origin, "Feedback maintenance");
  expect(stored(dashboard.home)[0]?.request).toMatchObject({
    workflow: "ad-hoc",
    maintenance: { due },
    storyIdentity: story.identity,
  });
});
