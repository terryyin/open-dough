// The launch boundary's review and file diff routes admit a published
// session's UUID as its own typed read, and the review adapter refuses a
// project this dashboard does not configure before any Git read. The handlers
// decide the rest (./published-session-review.spec.ts). The Review repository
// syncs only when its last synced trunk lacks the ref or the UUID's record,
// with the execution checkout retired, and a failed sync that leaves the
// record absent is named.
import { randomUUID } from "node:crypto";
import { realpathSync, renameSync } from "node:fs";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { fetchedPublishedSessionSource } from "../../server/publishedSessionSource.ts";
import { ReviewSyncDeadline } from "../../server/reviewRepository.ts";
import { storyReview } from "../../server/storyReview.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import {
  aNeverSyncedPublishedSessionOffline,
  aSyncedPublishedSession,
} from "../support/publishedSessionCase.ts";
import { stubRemoteRequestRecording } from "../support/fixtureHome.ts";
import {
  reviewOriginHangs,
  shortSyncDeadline,
  timedOutSync,
} from "../support/hangingOrigin.ts";

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

test("Given a published session's UUID and a range position, when the review route admits them, then its read selects that range", async () => {
  expect(
    await routed(storyReviewEndpoint, { ...published, run: "1" }),
  ).toMatchObject({ read: { run: "1" } });
});

test("Given a published session's UUID and a range position not spelled canonically, when the review route reads them, then it is refused as malformed", async () => {
  await expect(
    Promise.resolve().then(() =>
      routed(storyReviewEndpoint, { ...published, run: "01" }),
    ),
  ).rejects.toMatchObject({ status: 400 });
});

for (const [endpoint, query] of [
  [storyReviewEndpoint, { ...published, session: "ad-hoc", host: "claude" }],
  [storyReviewEndpoint, { ...published, published: "../PRODUCT-BACKLOG" }],
  [storyReviewEndpoint, { ...published, reference: randomUUID() }],
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

const newSignal = () => new AbortController().signal;

const originMain = async (cwd: string) =>
  (await git(cwd, "rev-parse", "origin/main")).stdout.trim();

type Synced = Awaited<ReturnType<typeof aSyncedPublishedSession>>;

// Resolve a session's source as an open does, counting the Review
// repository's fetches.
async function resolvedCountingFetches(session: (synced: Synced) => string) {
  const synced = await aSyncedPublishedSession();
  const recording = stubRemoteRequestRecording(synced.fixture);
  const resolved = await fetchedPublishedSessionSource(
    synced.source,
    session(synced),
    {
      admission: newSignal,
      request: newSignal(),
      syncDeadline: new ReviewSyncDeadline(),
    },
  );
  const fetches = recording.fetchesIn(realpathSync(synced.repository));
  return { ...synced, resolved, fetches };
}

test("a UUID at the last synced trunk resolves without starting a fetch", async () => {
  const { repository, recordedAt, resolved, fetches } =
    await resolvedCountingFetches(({ sessionId }) => sessionId);

  expect(resolved.revision).toBe(recordedAt);
  expect(await originMain(repository)).toBe(recordedAt);
  expect(fetches).toBe(0);
});

test("an absent UUID starts one fetch and resolves the advanced origin/main", async () => {
  const { repository, advanced, resolved, fetches } =
    await resolvedCountingFetches(() => randomUUID());

  expect(resolved.revision).toBe(advanced);
  expect(await originMain(repository)).toBe(advanced);
  expect(fetches).toBe(1);
});

const failedSync = {
  kind: "landing-unavailable",
  comparison: "published-session",
  explanation: expect.stringMatching(
    /^The review could not sync from origin, .*: \S/,
  ) as unknown,
};

const reviewed = async (
  session: string,
  syncDeadline = new ReviewSyncDeadline(),
) => {
  const signal = newSignal();
  const subject = { source: "open-dough", published: session };
  return storyReviewSchema.parse(
    await storyReview(
      await reviewInput({ subject }, signal, syncDeadline),
      signal,
      syncDeadline,
    ),
  );
};

test("a project never synced, opened while origin is unreachable, names the failed sync", async () => {
  const { sessionId } = await aNeverSyncedPublishedSessionOffline();

  expect(await reviewed(sessionId)).toMatchObject(failedSync);
});

test("a session absent from the last sync, opened while origin refuses, names the failed sync", async () => {
  const { origin, unsyncedSessionId } = await aSyncedPublishedSession();
  renameSync(origin, `${origin}-unreachable`);

  expect(await reviewed(unsyncedSessionId)).toMatchObject(failedSync);
});

test("a session absent after a successful sync is refused as unknown", async () => {
  await aSyncedPublishedSession();

  await expect(reviewed(randomUUID())).rejects.toMatchObject({
    status: 404,
    message: "This project published no such session.",
  });
});

test("a session absent from the last sync, opened while origin hangs, names the timed-out sync", async () => {
  const { repository, unsyncedSessionId } = await aSyncedPublishedSession();
  await reviewOriginHangs(repository);
  const deadlineMs = 500;

  const review = await reviewed(
    unsyncedSessionId,
    shortSyncDeadline(deadlineMs),
  );

  expect(review).toMatchObject(failedSync);
  expect("explanation" in review && review.explanation).toContain(
    timedOutSync(deadlineMs),
  );
});
