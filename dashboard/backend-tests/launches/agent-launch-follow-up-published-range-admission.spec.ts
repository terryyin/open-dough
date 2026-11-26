import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept, launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  doneStoryFiles,
  otherStory,
  recoverStory,
} from "../../test-support/support/followUpStories.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { publishes } from "../../test-support/support/publishedRepository.ts";
import { publishStorySession } from "../../test-support/support/storySessionPublication.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test("a published file Follow up requires the exact recorded range, literal path and owning story", async ({
  request: http,
  dashboard,
  origin,
}) => {
  const path = "[literal]*.txt";
  const otherPath = "first-range.txt";
  const { record, first, second, revision } = publishStorySession(
    origin,
    recoverStory.identity,
    otherPath,
    "unrelated.txt",
    path,
  );
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({
      revision,
      files: doneStoryFiles(
        [recoverStory, otherStory],
        "2026-11-08T09:05:00.000Z",
      ),
    }),
  );
  // The follow-up starts from a file the session review open showed.
  const opened = await getReview(http, dashboard, storyReviewEndpoint, {
    source: "open-dough",
    identity: recoverStory.identity,
    published: record.sessionId,
  });
  expect(await opened.json()).toMatchObject({ kind: "published-session" });
  dashboard.claudeScenario("launched");
  const file = {
    published: record.sessionId,
    path,
    baseline: second.base,
    tree: second.candidate,
  };
  for (const invalid of [
    {
      story: recoverStory,
      file: { ...file, baseline: first.base },
      reason:
        "The file or comparison does not belong to this session's published changes.",
    },
    {
      story: recoverStory,
      file: { ...file, path: otherPath },
      reason:
        "The file or comparison does not belong to this session's published changes.",
    },
    {
      story: otherStory,
      file,
      reason: "The published session does not belong to this story.",
    },
  ]) {
    const response = await accept(dashboard, {
      ...request,
      followUp: makeMe.aFollowUp
        .ofStory(invalid.story, revision)
        .anchoredAt(invalid.file)
        .please(),
    });
    expect(response.status, response.body).toBe(409);
    expect(response.body).toContain(invalid.reason);
  }
  expect(dashboard.claudeCalls()).toEqual([]);

  const before = await originMain(origin);
  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      followUp: makeMe.aFollowUp
        .ofStory(recoverStory, revision)
        .anchoredAt(file)
        .please(),
    }),
  );
  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.request).toMatchObject({
    storyIdentity: recoverStory.identity,
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(await originMain(origin)).toBe(before);
});
