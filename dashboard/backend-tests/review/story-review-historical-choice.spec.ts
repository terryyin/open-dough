// Historical Intent bypasses a retained readable workspace, including when a
// captured landing is unusable; explicit run selection keeps that run's gap.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import {
  completedPublishedStory,
  keepUnusableCompletedCapture,
} from "../../tests/support/completedPublishedStory.ts";
import {
  completedReviewQuery,
  getReview,
} from "../../tests/support/completedReviewRequests.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";

test.use({ serverMode: "boundary" });

test("historical review recovers published completion instead of a readable workspace when its capture is unusable", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { retainWorkspace: true },
  );
  const local = makeMe.aRepository
    .withRevision("local", {
      backlog: null,
      files: { "local-only.txt": "after completion\n" },
    })
    .please().revisions[0];
  writeRevisionFiles(story.workspace, local);
  keepUnusableCompletedCapture(dashboard, origin, story);
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
  const historical = { ...completedReviewQuery, historical: "true" };
  const review = storyReviewSchema.parse(
    await (
      await getReview(request, dashboard, storyReviewEndpoint, historical)
    ).json(),
  );
  expect(review).toMatchObject({
    kind: "published",
    completion: story.completion,
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
