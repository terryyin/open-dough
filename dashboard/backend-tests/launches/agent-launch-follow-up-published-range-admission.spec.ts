// Start admits a file follow-up on a published session only for the exact
// recorded range, literal path and owning story of the session record on the
// synced trunk, before acceptance reaches the host. Whole-comparison
// refusals: agent-launch-follow-up-landed-comparison-admission.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { otherStory } from "../../test-support/support/followUpStories.ts";
import { aDoneStoryStart, storyA } from "../support/doneStoryStart.ts";

const path = "[literal]*.txt";
const otherPath = "first-range.txt";
const foreignStory = makeMe.aDoneRecord.completed(otherStory).please();
const notInSession =
  "The file or comparison does not belong to this session's published changes.";

test("a published file Follow up requires the exact recorded range, literal path and owning story", async () => {
  const start = await aDoneStoryStart();
  const { tree, received, startAt, refusal, advance } = start;
  const first = {
    base: tree,
    candidate: await advance({ [otherPath]: "1\n" }),
  };
  const secondBase = await advance({ "unrelated.txt": "between\n" });
  const second = {
    base: secondBase,
    candidate: await advance({ [path]: "rewritten in range two\n" }),
  };
  const published = await start.publishSession(storyA.identity, first, second);
  // The follow-up starts from a file the session's second range showed.
  const review = await start.publishedSessionReviewOf(published, "1");
  expect(review).toMatchObject({
    kind: "published-session",
    baseline: second.base,
    tree: second.candidate,
  });
  if (!("files" in review)) throw new Error("expected a session review");
  expect(review.files.map((shown) => shown.path)).toContain(path);
  const file = {
    published,
    path,
    baseline: second.base,
    tree: second.candidate,
  };

  for (const { change, story, message } of [
    { change: { baseline: first.base }, story: storyA, message: notInSession },
    { change: { path: otherPath }, story: storyA, message: notInSession },
    {
      change: {},
      story: foreignStory,
      message: "The published session does not belong to this story.",
    },
  ])
    expect(await refusal(startAt({ ...file, ...change }, story))).toMatchObject(
      { status: 409, message },
    );

  const before = await start.originMain();
  expect((await startAt(file)).kind).toBe("accepted");
  expect(received).toHaveLength(1);
  expect(received[0]?.request).toMatchObject({
    storyIdentity: storyA.identity,
  });
  const input = received[0]?.input ?? "";
  expect(input).toContain(`- Path: ${path}`);
  expect(input).toContain(second.base);
  expect(input).toContain(second.candidate);
  expect(await start.originMain()).toBe(before);
});
