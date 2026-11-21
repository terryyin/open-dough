// The launch boundary's review and file diff routes admit a published
// session's UUID as its own typed read, and the review adapter refuses a
// project this dashboard does not configure before any Git read. The handlers
// decide the rest (./published-session-review.spec.ts). Fetch runs only when
// the last fetched trunk lacks the ref or the UUID's record.
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { publishedSessionReview } from "../../server/publishedSessionReview.ts";
import { fetchedPublishedSessionSource } from "../../server/publishedSessionSource.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";
import { aCheckout } from "../support/doneCaptureCase.ts";

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

const originMain = async (cwd: string) =>
  (await git(cwd, "rev-parse", "origin/main")).stdout.trim();

// A checkout whose last-fetched origin/main holds a session record while the
// bare origin has already advanced past that revision.
async function aFetchedPublishedSession() {
  const checkout = await aCheckout({ withOrigin: true });
  const repository = checkout.integration;
  const candidate = await commitDeclaredRevision(repository, {
    files: { "notes.md": "edited\n" },
  });
  const record = makeMe.aSessionRecord
    .closing({ base: checkout.base, candidate })
    .please();
  const recordedAt = await commitDeclaredRevision(repository, {
    files: {
      [sessionRecordPathBeside(backlogPath, record.sessionId)]:
        `${JSON.stringify(record)}\n`,
    },
  });
  await git(repository, "push", "--quiet", "origin", "main");
  expect(await originMain(repository)).toBe(recordedAt);
  await commitDeclaredRevision(repository, {
    files: { "later.md": "later\n" },
  });
  await git(repository, "push", "--quiet", "origin", "main");
  const advanced = await originMain(repository);
  expect(advanced).not.toBe(recordedAt);
  await git(repository, "update-ref", "refs/remotes/origin/main", recordedAt);
  expect(await originMain(repository)).toBe(recordedAt);
  return {
    repository,
    recordedAt,
    advanced,
    sessionId: record.sessionId,
    source: makeMe.aPublishedSource
      .with({
        id: "open-dough",
        label: "Open Dough",
        repository: "terryyin/open-dough",
        backlogPath,
      })
      .please(),
  };
}

const newSignal = () => new AbortController().signal;

test("a UUID at the last fetched trunk resolves without starting a fetch", async () => {
  const { repository, recordedAt, sessionId, source } =
    await aFetchedPublishedSession();
  let fetches = 0;

  const resolved = await fetchedPublishedSessionSource(
    repository,
    source,
    sessionId,
    {
      admission: newSignal,
      fetch: () => {
        fetches += 1;
        return newSignal();
      },
    },
  );

  expect(resolved.revision).toBe(recordedAt);
  expect(await originMain(repository)).toBe(recordedAt);
  expect(fetches).toBe(0);
});

test("an absent UUID starts one fetch and resolves the advanced origin/main", async () => {
  const { repository, advanced, source } = await aFetchedPublishedSession();
  let fetches = 0;

  const resolved = await fetchedPublishedSessionSource(
    repository,
    source,
    randomUUID(),
    {
      admission: newSignal,
      fetch: () => {
        fetches += 1;
        return newSignal();
      },
    },
  );

  expect(resolved.revision).toBe(advanced);
  expect(await originMain(repository)).toBe(advanced);
  expect(fetches).toBe(1);
});

test("a hung fetch lets the review answer from the last fetched trunk", async () => {
  const { repository, recordedAt, source } = await aFetchedPublishedSession();
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
    const resolved = await fetchedPublishedSessionSource(
      repository,
      source,
      missing,
      {
        admission: () => AbortSignal.timeout(boundMs),
        fetch: () => {
          fetchSignal = AbortSignal.timeout(boundMs);
          return fetchSignal;
        },
      },
    );
    expect(resolved.revision).toBe(recordedAt);
    return publishedSessionReview(resolved, missing, newSignal());
  };

  await expect(review()).rejects.toMatchObject({
    status: 404,
    message: "This project published no such session.",
  });
  expect(fetchSignal?.aborted).toBe(true);
});
