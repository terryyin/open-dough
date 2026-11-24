// The launch boundary's review and file diff routes admit a published
// session's UUID as its own typed read, and the review adapter refuses a
// project this dashboard does not configure before any Git read. The handlers
// decide the rest (./published-session-review.spec.ts). The Review repository
// syncs only when its last synced trunk lacks the ref or the UUID's record,
// with the execution checkout retired.
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { publishedSessionReview } from "../../server/publishedSessionReview.ts";
import { fetchedPublishedSessionSource } from "../../server/publishedSessionSource.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";
import { aSyncedPublishedSession } from "../support/publishedSessionCase.ts";

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

test("a UUID at the last synced trunk resolves without starting a fetch", async () => {
  const { repository, recordedAt, sessionId, source } =
    await aSyncedPublishedSession();
  let fetches = 0;

  const resolved = await fetchedPublishedSessionSource(source, sessionId, {
    admission: newSignal,
    fetch: () => {
      fetches += 1;
      return newSignal();
    },
  });

  expect(resolved.revision).toBe(recordedAt);
  expect(await originMain(repository)).toBe(recordedAt);
  expect(fetches).toBe(0);
});

test("an absent UUID starts one fetch and resolves the advanced origin/main", async () => {
  const { repository, advanced, source } = await aSyncedPublishedSession();
  let fetches = 0;

  const resolved = await fetchedPublishedSessionSource(source, randomUUID(), {
    admission: newSignal,
    fetch: () => {
      fetches += 1;
      return newSignal();
    },
  });

  expect(resolved.revision).toBe(advanced);
  expect(await originMain(repository)).toBe(advanced);
  expect(fetches).toBe(1);
});

test("a hung fetch lets the review answer from the last synced trunk", async () => {
  const { repository, recordedAt, source } = await aSyncedPublishedSession();
  const missing = randomUUID();
  const boundMs = 500;
  await git(
    repository,
    "remote",
    "set-url",
    "origin",
    "ssh://example.invalid/x.git",
  );
  await git(repository, "config", "core.sshCommand", "sh -c 'sleep 2'");

  let fetchSignal: AbortSignal | undefined;
  const review = async () => {
    const resolved = await fetchedPublishedSessionSource(source, missing, {
      admission: () => AbortSignal.timeout(boundMs),
      fetch: () => {
        fetchSignal = AbortSignal.timeout(boundMs);
        return fetchSignal;
      },
    });
    expect(resolved.revision).toBe(recordedAt);
    return publishedSessionReview(
      resolved,
      missing,
      undefined,
      new Date(),
      newSignal(),
    );
  };

  await expect(review()).rejects.toMatchObject({
    status: 404,
    message: "This project published no such session.",
  });
  expect(fetchSignal?.aborted).toBe(true);
});
