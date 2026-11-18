// Only standalone ad hoc sessions can be named as review subjects.
import { expect, test } from "../../test-support/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";

test.use({ serverMode: "boundary" });

for (const { name, query, status, error } of [
  {
    name: "a story session",
    query: { source: "open-dough", host: "claude", session: "story-session" },
    status: 400,
    error:
      "This session belongs to a story launch and is reviewed by its story.",
  },
  {
    name: "an unknown session",
    query: { source: "open-dough", host: "claude", session: "no-such-session" },
    status: 404,
    error: "This dashboard launched no such session for this project.",
  },
  {
    name: "both a story and a session",
    query: {
      source: "open-dough",
      identity: queuedIdentity,
      host: "claude",
      session: "story-session",
    },
    status: 400,
    error: "The review names both a story and a session.",
  },
] as const) {
  test(`ad hoc review refuses ${name}`, async ({ request, dashboard }) => {
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .executing({ identity: queuedIdentity, title: "Story A" })
        .inClaudeSession({ sessionId: "story-session" })
        .markedDone()
        .please(),
    ]);

    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      query,
    );

    expect(response.status()).toBe(status);
    expect(await response.json()).toEqual({ error });
  });
}
