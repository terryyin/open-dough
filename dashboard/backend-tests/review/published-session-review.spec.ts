// A standalone session's published close record admits its review on a
// machine with no launch history: the typed review and file handlers take the
// published subject and its configured project source, and the recorded pair
// is read from that project's Git at a later published revision.
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { storyReviewSchema } from "../../src/storyReviewContract.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

type Pair = { readonly base: string; readonly candidate: string };

// Trunk publishes `record` at its path; answers that revision.
const recordPublished = (
  repository: string,
  record: { readonly sessionId: string },
) =>
  commitDeclaredRevision(repository, {
    files: {
      [sessionRecordPathBeside(backlogPath, record.sessionId)]:
        `${JSON.stringify(record)}\n`,
    },
  });

// A checkout whose trunk published a session's edit, its close record, and a
// later unrelated revision.
async function aPublishedSession(range?: Pair) {
  const { checkout } = await aDoneCaptureCase().please();
  const repository = checkout.integration;
  const candidate = await commitDeclaredRevision(repository, {
    files: { "notes.md": "edited\n" },
  });
  const recorded = range ?? { base: checkout.base, candidate };
  const record = makeMe.aSessionRecord.closing(recorded).please();
  await recordPublished(repository, record);
  const revision = await commitDeclaredRevision(repository, {
    files: { "later.md": "later\n" },
  });
  return {
    source: { repository, revision, backlogPath },
    sessionId: record.sessionId,
    ...recorded,
  };
}

type PublishedSession = Awaited<ReturnType<typeof aPublishedSession>>;

// The review of the published session, or of another UUID, at the selected
// range unless the first.
const read = (
  published: PublishedSession,
  {
    session = published.sessionId,
    run,
  }: { session?: string; run?: string } = {},
) =>
  storyReview(
    {
      read: {
        subject: { source: "open-dough", published: session },
        ...(run === undefined ? {} : { run }),
      },
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

  const refused = read(published, { session: randomUUID() });

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status: 404 });
});

test("Given a session named by no UUID, when it is reviewed, then it is refused as malformed", async () => {
  const published = await aPublishedSession();

  await expect(
    read(published, { session: "../PRODUCT-BACKLOG" }),
  ).rejects.toMatchObject({
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

  expect(storyReviewSchema.parse(review)).toMatchObject({
    kind: "landing-unavailable",
    comparison: "published-session",
    explanation: expect.stringContaining(
      "This session's published commits are not in this machine's Git.",
    ) as unknown,
  });
});

// A file read of the published session, on its recorded pair unless named.
const readFile = (
  published: PublishedSession,
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

// A checkout whose trunk published a session's two disjoint pairs, another
// writer's revision between them, and the session's close record.
async function aTwoRangeSession() {
  const { checkout } = await aDoneCaptureCase().please();
  const repository = checkout.integration;
  const added = (file: string) =>
    commitDeclaredRevision(repository, { files: { [file]: `${file}\n` } });
  const first = { base: checkout.base, candidate: await added("notes.md") };
  const between = await added("other.md");
  const second = { base: between, candidate: await added("second.md") };
  const record = makeMe.aSessionRecord
    .closing(first)
    .andClosing(second)
    .please();
  const revision = await recordPublished(repository, record);
  return {
    source: { repository, revision, backlogPath },
    sessionId: record.sessionId,
    ...first,
    second,
  };
}

test("Given a published session of two ranges, when each range is selected, then only that recorded pair's files are shown", async () => {
  const session = await aTwoRangeSession();

  await expect(read(session)).resolves.toMatchObject({
    kind: "published-session",
    ranges: 2,
    selectedRun: "0",
    baseline: session.base,
    tree: session.candidate,
    files: [expect.objectContaining({ path: "notes.md" })],
  });
  const second = await read(session, { run: "1" });
  expect(second).toMatchObject({
    selectedRun: "1",
    baseline: session.second.base,
    tree: session.second.candidate,
  });
  expect(second).toHaveProperty("files", [
    expect.objectContaining({ path: "second.md" }),
  ]);
});

test("Given a published session of two ranges, when a range it did not record is selected, then it is refused", async () => {
  const session = await aTwoRangeSession();

  await expect(read(session, { run: "2" })).rejects.toMatchObject({
    status: 409,
  });
});

test("Given a published session of two ranges, when a file of its second pair is read, then its diff is shown", async () => {
  const session = await aTwoRangeSession();

  const diff = readFile(session, {
    baseline: session.second.base,
    tree: session.second.candidate,
    path: "second.md",
  });

  await expect(diff).resolves.toMatchObject({
    printed: expect.stringContaining("+second.md") as unknown,
  });
});

test("Given a published session of two ranges, when a file across its pairs is read, then it is refused", async () => {
  const session = await aTwoRangeSession();

  const across = readFile(session, {
    tree: session.second.candidate,
    path: "other.md",
  });

  await expect(across).rejects.toMatchObject({ status: 409 });
});
