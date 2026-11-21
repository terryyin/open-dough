// The launch boundary's review and file diff routes admit a published
// session's UUID as its own typed read, and the review adapter refuses a
// project this dashboard does not configure before any Git read. The handlers
// decide the rest (./published-session-review.spec.ts).
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";

const published = { source: "open-dough", published: randomUUID() };
const file = { baseline: "a".repeat(40), tree: "b".repeat(40), path: "a.txt" };

const routed = (endpoint: string, query: Record<string, string>) => {
  const read = launchExactReads.get(endpoint);
  if (read === undefined) throw new Error(`${endpoint} is not routed`);
  return read(new URL(`http://local${endpoint}?${new URLSearchParams(query)}`));
};

test("Given a published session's UUID, when the review and file diff routes admit it, then each is its typed published read", async () => {
  expect(await routed(storyReviewEndpoint, published)).toEqual({
    kind: "story-review",
    read: { subject: published },
  });
  expect(
    await routed(storyReviewFileEndpoint, { ...published, ...file }),
  ).toEqual({
    kind: "story-review-file",
    read: { subject: published, ...file },
  });
});

for (const [endpoint, query] of [
  [storyReviewEndpoint, { ...published, session: "ad-hoc", host: "claude" }],
  [storyReviewEndpoint, { ...published, published: "../PRODUCT-BACKLOG" }],
  [storyReviewEndpoint, { ...published, run: "1" }],
  [storyReviewFileEndpoint, { ...published, ...file, reference: randomUUID() }],
  [storyReviewFileEndpoint, { ...published, ...file, completion: file.tree }],
] as const)
  test(`Given a published session query ${JSON.stringify(Object.keys(query))} naming more than its UUID, when it is routed, then it is refused as malformed`, async () => {
    await expect(
      Promise.resolve().then(() => routed(endpoint, query)),
    ).rejects.toMatchObject({ status: 400 });
  });

test("Given a published session of a project this dashboard does not configure, when its review input is read, then it is refused as unknown", async () => {
  await expect(
    reviewInput(
      { subject: { ...published, source: "no-such-project" } },
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ status: 404, message: "Unknown catalog source." });
});
