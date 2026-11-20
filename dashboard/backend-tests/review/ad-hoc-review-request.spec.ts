// The launch boundary's review and file diff routes turn a session's query
// into one typed read or refuse its shape. The handlers decide the rest from
// the kept records (./ad-hoc-review-subject.spec.ts,
// ./ad-hoc-review-file.spec.ts).
import { expect, test } from "vitest";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";

const session = { source: "open-dough", host: "claude", session: "ad-hoc" };
const file = { baseline: "a".repeat(40), tree: "b".repeat(40), path: "a.txt" };

const routed = (endpoint: string, query: Record<string, string>) => {
  const read = launchExactReads.get(endpoint);
  if (read === undefined) throw new Error(`${endpoint} is not routed`);
  return read(new URL(`http://local${endpoint}?${new URLSearchParams(query)}`));
};

test("Given a session's query, when the review route admits it, then it is the session's typed review read", async () => {
  expect(await routed(storyReviewEndpoint, session)).toEqual({
    kind: "story-review",
    read: { subject: session },
  });
});

test("Given a session's query and file pair, when the file diff route admits it, then it is the session's typed file read", async () => {
  expect(
    await routed(storyReviewFileEndpoint, { ...session, ...file }),
  ).toEqual({
    kind: "story-review-file",
    read: { subject: session, ...file },
  });
});

for (const [endpoint, query, error] of [
  [
    storyReviewEndpoint,
    { ...session, identity: "SEED-7#story-a" },
    "The review names both a story and a session.",
  ],
  [
    storyReviewEndpoint,
    { ...session, run: "not-a-run" },
    "The review run is malformed.",
  ],
  [
    storyReviewFileEndpoint,
    { ...session, ...file, baseline: "not-an-object" },
    "The file diff names a malformed object or path.",
  ],
] as const)
  test(`Given a malformed query, when ${endpoint} admits it, then it is refused: ${error}`, async () => {
    const refused = (async () => routed(endpoint, query))();

    await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
    await expect(refused).rejects.toMatchObject({
      status: 400,
      message: error,
    });
  });
