// Historical Intent bypasses a retained readable workspace, including when a
// captured landing is unusable; explicit run selection keeps that run's gap.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { keepUnusableCompletedCapture } from "../../test-support/support/completedStoryVisibleActions.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { agentWorktree } from "../../test-support/support/agentAuthoredWorktree.ts";
import {
  completedReviewQuery,
  getReview,
} from "../../test-support/support/completedReviewRequests.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";

test.use({
  serverMode: "boundary",
  originRepository: ordinaryTrunkModeCompletedHistory(),
});

test("historical review recovers published completion instead of a readable workspace when its capture is unusable", async ({
  request,
  dashboard,
  origin,
}) => {
  const completion = origin.revision("completion");
  const baseline = origin.revision("interleaving");
  const workspace = await agentWorktree(
    origin,
    agentIdentity("Yui").agent,
    "retained",
    completion,
  );
  const local = makeMe.aRepository
    .withRevision("local", {
      backlog: null,
      files: { "local-only.txt": "after completion\n" },
    })
    .please().revisions[0];
  writeRevisionFiles(workspace, local);
  keepUnusableCompletedCapture(dashboard, origin, {
    workspace,
    completion,
    baseline,
  });
  const ordinary = storyReviewSchema.parse(
    await (
      await getReview(
        request,
        dashboard,
        storyReviewEndpoint,
        completedReviewQuery,
      )
    ).json(),
  );
  expect(ordinary.kind).toBe("snapshot");
  expect(ordinary.selectedRun).toBeUndefined();
  const historical = { ...completedReviewQuery, historical: "true" };
  const review = storyReviewSchema.parse(
    await (
      await getReview(request, dashboard, storyReviewEndpoint, historical)
    ).json(),
  );
  expect(review).toMatchObject({
    kind: "published",
    completion,
  });
  expect(review.selectedRun).toBeUndefined();
  expect(review.runs).toHaveLength(1);
  const explicit = await getReview(request, dashboard, storyReviewEndpoint, {
    ...historical,
    run: review.runs?.[0]?.key ?? "",
  });
  expect(await explicit.json()).toMatchObject({
    kind: "landing-unavailable",
    explanation: "The captured landing repository is missing or unreadable.",
  });
});
