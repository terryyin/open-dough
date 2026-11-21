// A standalone session's published close record admits its review on a
// machine with no launch history: the typed review and file handlers take the
// published subject and its configured project source, and the recorded pair
// is read from that project's Git at a later published revision.
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { posix } from "node:path";
import { sessionRecordRelativePath } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { aCheckout } from "../support/doneCaptureCase.ts";

const recordPath = (sessionId: string) =>
  posix.join(posix.dirname(backlogPath), sessionRecordRelativePath(sessionId));

// A checkout whose trunk published a session's edit, its close record, and a
// later unrelated revision.
async function aPublishedSession(range?: { base: string; candidate: string }) {
  const checkout = await aCheckout();
  const repository = checkout.integration;
  const candidate = await commitDeclaredRevision(repository, {
    files: { "notes.md": "edited\n" },
  });
  const recorded = range ?? { base: checkout.base, candidate };
  const record = makeMe.aSessionRecord.closing(recorded).please();
  const { sessionId } = record;
  await commitDeclaredRevision(repository, {
    files: {
      [recordPath(sessionId)]: `${JSON.stringify(record)}\n`,
    },
  });
  const revision = await commitDeclaredRevision(repository, {
    files: { "later.md": "later\n" },
  });
  return {
    source: { repository, revision, backlogPath },
    sessionId,
    ...recorded,
  };
}

const read = (
  published: Awaited<ReturnType<typeof aPublishedSession>>,
  session: string = published.sessionId,
) =>
  storyReview(
    {
      read: { subject: { source: "open-dough", published: session } },
      published: published.source,
    },
    new AbortController().signal,
  );

test("Given a published session record and a later trunk revision, when its UUID is reviewed, then the recorded pair's file diff is shown", async () => {
  const published = await aPublishedSession();

  const review = await read(published);

  expect(review).toMatchObject({
    kind: "published-session",
    session: { closedAt: expect.any(String) as unknown },
    baseline: published.base,
    tree: published.candidate,
    files: [expect.objectContaining({ path: "notes.md" })],
  });
  expect(review).not.toHaveProperty("commitRuns");
});

test("Given a project that published no such session, when that UUID is reviewed, then it is refused as unknown", async () => {
  const published = await aPublishedSession();

  const refused = read(published, randomUUID());

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status: 404 });
});

test("Given a session named by no UUID, when it is reviewed, then it is refused as malformed", async () => {
  const published = await aPublishedSession();

  await expect(read(published, "../PRODUCT-BACKLOG")).rejects.toMatchObject({
    status: 400,
  });
});

test("Given a record whose commits this machine's Git lacks, when it is reviewed, then the review explains they are unavailable", async () => {
  const absent = "0123456789abcdef0123456789abcdef01234567";
  const published = await aPublishedSession({
    base: absent,
    candidate: absent,
  });

  const review = await read(published);

  expect(review.kind).toBe("landing-unavailable");
  expect("explanation" in review && review.explanation).toMatch(
    "not in this machine's Git",
  );
});

// A file read of the published session, on its recorded pair unless named.
const readFile = (
  published: Awaited<ReturnType<typeof aPublishedSession>>,
  file: { baseline?: string; tree?: string; path: string },
) =>
  reviewedFileDiff(
    {
      read: {
        subject: { source: "open-dough", published: published.sessionId },
        baseline: published.base,
        tree: published.candidate,
        ...file,
      },
      published: published.source,
    },
    new AbortController().signal,
  );

test("Given a published session, when a file of its recorded pair is read, then its diff is shown", async () => {
  const published = await aPublishedSession();

  const diff = readFile(published, { path: "notes.md" });

  await expect(diff).resolves.toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+edited") as unknown,
  });
});

test("Given a published session, when a file off its recorded pair is read, then it is refused", async () => {
  const published = await aPublishedSession();

  await expect(readFile(published, { path: "later.md" })).rejects.toMatchObject(
    { status: 409 },
  );
  await expect(
    readFile(published, {
      baseline: published.candidate,
      tree: published.source.revision,
      path: "later.md",
    }),
  ).rejects.toMatchObject({ status: 409 });
});
