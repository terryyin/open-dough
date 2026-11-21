// The launch boundary's review and file diff routes admit a published
// session's UUID as its own typed read, and the review adapter refuses a
// project this dashboard does not configure before any Git read. The handlers
// decide the rest (./published-session-review.spec.ts). Fetch runs only when
// the last fetched trunk lacks the ref or the UUID's record.
import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { posix } from "node:path";
import { sessionRecordRelativePath } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import {
  fetchedPublishedSessionSource,
  type PublishedSessionSourceBounds,
} from "../../server/publishedSessionSource.ts";
import * as projectFolders from "../../server/projectFolders.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
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

const recordPath = (sessionId: string) =>
  posix.join(posix.dirname(backlogPath), sessionRecordRelativePath(sessionId));

const catalogSource = (ref = "main"): PublishedSource => ({
  id: "open-dough",
  label: "Open Dough",
  repository: "terryyin/open-dough",
  ref,
  backlogPath,
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
      [recordPath(record.sessionId)]: `${JSON.stringify(record)}\n`,
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
    source: catalogSource(),
  };
}

const withProjectFolder = async <T>(
  repository: string,
  run: () => Promise<T>,
): Promise<T> => {
  const spy = vi
    .spyOn(projectFolders, "projectFolder")
    .mockReturnValue({ path: repository, shown: repository });
  try {
    return await run();
  } finally {
    spy.mockRestore();
  }
};

const defaultBounds = (): PublishedSessionSourceBounds => ({
  admission: AbortSignal.timeout(30_000),
  fetch: AbortSignal.timeout(30_000),
});

test("Given a record present at the last fetched origin/main, when review and file diff and text resolve the source, then origin/main stays at that SHA after origin advanced", async () => {
  const { repository, recordedAt, sessionId, source } =
    await aFetchedPublishedSession();

  await withProjectFolder(repository, async () => {
    const bounds = defaultBounds();
    // Review open, file diff, and file text each resolve the published source.
    for (let admission = 0; admission < 3; admission += 1) {
      const resolved = await fetchedPublishedSessionSource(
        source,
        sessionId,
        bounds,
      );
      expect(resolved.revision).toBe(recordedAt);
    }
    expect(await originMain(repository)).toBe(recordedAt);
  });
});

test("Given an absent UUID at the last fetched trunk, when the published source is resolved, then one fetch advances origin/main before the answer", async () => {
  const { repository, recordedAt, advanced, source } =
    await aFetchedPublishedSession();
  expect(await originMain(repository)).toBe(recordedAt);

  await withProjectFolder(repository, async () => {
    const resolved = await fetchedPublishedSessionSource(
      source,
      randomUUID(),
      defaultBounds(),
    );
    expect(resolved.revision).toBe(advanced);
    expect(await originMain(repository)).toBe(advanced);
  });
});

test("Given an origin whose fetch hangs, when the published source is resolved with a short fetch bound, then it answers from the last fetched trunk once that bound ends", async () => {
  // Absent UUID forces a fetch; separate admission bound keeps last fetched.
  const { repository, recordedAt, sessionId, source } =
    await aFetchedPublishedSession();
  const fetchBoundMs = 500;
  await git(
    repository,
    "remote",
    "set-url",
    "origin",
    "ssh://example.invalid/x.git",
  );
  await git(
    repository,
    "config",
    "core.sshCommand",
    `sh -c 'sleep ${String(fetchBoundMs / 1000 + 2)}'`,
  );

  await withProjectFolder(repository, async () => {
    const started = Date.now();
    // Present UUID would skip fetch; ask for a missing one so the hung fetch
    // path runs, then fall back to the last fetched trunk that still holds
    // the real session record for a follow-up resolve.
    const missing = randomUUID();
    const afterHang = await fetchedPublishedSessionSource(source, missing, {
      admission: AbortSignal.timeout(30_000),
      fetch: AbortSignal.timeout(fetchBoundMs),
    });
    const elapsed = Date.now() - started;
    expect(afterHang.revision).toBe(recordedAt);
    expect(elapsed).toBeGreaterThanOrEqual(fetchBoundMs - 50);
    expect(elapsed).toBeLessThan(fetchBoundMs + 2000);
    const present = await fetchedPublishedSessionSource(source, sessionId, {
      admission: AbortSignal.timeout(30_000),
      fetch: AbortSignal.timeout(fetchBoundMs),
    });
    expect(present.revision).toBe(recordedAt);
  });
});
