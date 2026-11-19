// The session review and file reads at their routes through a started server:
// the adapters refuse a wrong method, a foreign origin, a malformed query and
// an unknown source, and answer the handlers' refusals
// (./ad-hoc-review-subject.unit.spec.ts, ./ad-hoc-review-file.unit.spec.ts)
// with their status.
import { expect, test } from "../../test-support/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";

test.use({ serverMode: "boundary" });

const claudeSession = (session: string) => ({
  source: "open-dough",
  host: "claude",
  session,
});
const reviewAt = (
  dashboard: { baseURL: string },
  query: Record<string, string>,
  endpoint: string = storyReviewEndpoint,
) => `${dashboard.baseURL}${endpoint}?${new URLSearchParams(query)}`;
const storySession = claudeSession("story-session");
const adHocSession = claudeSession("ad-hoc-session");
const filePair = {
  baseline: "a".repeat(40),
  tree: "b".repeat(40),
  path: "work.txt",
};
const refusedReads = [
  [
    storyReviewEndpoint,
    { ...storySession, identity: queuedIdentity },
    400,
    "The review names both a story and a session.",
  ],
  [
    storyReviewEndpoint,
    { ...storySession, run: "not-a-run" },
    400,
    "The review run is malformed.",
  ],
  [
    storyReviewEndpoint,
    claudeSession("no-such-session"),
    404,
    "This dashboard launched no such session for this project.",
  ],
  [
    storyReviewEndpoint,
    storySession,
    400,
    "This session belongs to a story launch and is reviewed by its story.",
  ],
  [
    storyReviewFileEndpoint,
    { ...adHocSession, ...filePair, baseline: "not-an-object" },
    400,
    "The file diff names a malformed object or path.",
  ],
  [
    storyReviewFileEndpoint,
    { ...adHocSession, ...filePair },
    409,
    "The file or comparison does not belong to this session's kept commits.",
  ],
  [
    storyReviewFileEndpoint,
    { ...adHocSession, ...filePair, source: "no-such-source" },
    404,
    "Unknown catalog source.",
  ],
] as const;

test("Given a kept story launch's session and an ad hoc session, when a review or file is read wrongly, foreignly or for a refused subject, then the wire answers each refusal's status", async ({
  request,
  dashboard,
}) => {
  await test.step("Given a kept story launch's session and an ad hoc session", () => {
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .executing({ identity: queuedIdentity, title: "Story A" })
        .inClaudeSession({ sessionId: "story-session" })
        .markedDone()
        .please(),
      makeMe.aLaunchRecord
        .adHoc({ title: "Ad hoc" })
        .inClaudeSession({ sessionId: "ad-hoc-session" })
        .markedDone()
        .please(),
    ]);
  });
  await test.step("When malformed or refused reads are sent, then each answers its status and error", async () => {
    for (const [endpoint, query, status, error] of refusedReads) {
      const response = await request.get(reviewAt(dashboard, query, endpoint), {
        headers: { Origin: dashboard.origin },
      });
      expect(response.status(), JSON.stringify(query)).toBe(status);
      expect(await response.json()).toEqual({ error });
    }
  });
  await test.step("When the review is posted, then only GET is accepted", async () => {
    const posted = await request.post(reviewAt(dashboard, storySession), {
      headers: { Origin: dashboard.origin },
    });
    expect(posted.status()).toBe(405);
    expect(await posted.json()).toEqual({
      error: "Only GET is accepted here.",
    });
  });
  await test.step("When a foreign origin reads the review, then it is forbidden", async () => {
    const foreign = await request.get(reviewAt(dashboard, storySession), {
      headers: { Origin: "http://elsewhere.example" },
    });
    expect(foreign.status()).toBe(403);
  });
});
