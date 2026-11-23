// A standalone session's published close record admits its review on a
// machine with no launch history: the typed review and file handlers take the
// published subject and its configured project source, and the recorded pair
// is read from that project's Git at a later published revision. Records of
// several ranges are reviewed in ./published-session-ranges.spec.ts.
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  mountProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { storyReviewSchema } from "../../src/storyReviewContract.ts";
import { keep } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import {
  aPublishedSession,
  read,
  readFile,
  recordPublished,
} from "../support/publishedSessionCase.ts";

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

async function publishedOriginatingStory(anotherStory?: string) {
  const home = keep();
  const { checkout } = await aDoneCaptureCase().withOrigin().please();
  const repository = checkout.integration;
  const project = makeMe.aPublishedSource.openDough.please();
  writeFileSync(
    projectConfigurationFile("production"),
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({ ...project, localPath: `~/${path.relative(home, repository)}` })
        .please(),
    ]),
  );
  onTestFinished(mountProjectConfiguration("production"));

  const sessionId = randomUUID();
  const identity = `ad-hoc#${sessionId}`;
  const baseline = checkout.base;
  const tree = await commitDeclaredRevision(repository, {
    files: { "notes.md": "originating edit\n" },
  });
  const other = await commitDeclaredRevision(repository, {
    files: { "later.md": "another edit\n" },
  });
  const record = makeMe.aSessionRecord
    .forSession(sessionId)
    .underStory(anotherStory ?? identity)
    .closing({ base: baseline, candidate: tree })
    .andClosing({ base: tree, candidate: other })
    .please();
  await recordPublished(repository, record);
  await git(repository, "push", "--quiet", "origin", "main");
  return {
    subject: { source: project.id, identity },
    baseline,
    tree,
    other,
    signal: new AbortController().signal,
  };
}

test("a Done story's review and file reads use only its originating record's first pair", async () => {
  const { subject, baseline, tree, other, signal } =
    await publishedOriginatingStory();
  const opening = { subject, completed: true, historical: true };
  const review = await storyReview(await reviewInput(opening, signal), signal);
  expect(review).toMatchObject({ kind: "published-session", baseline, tree });
  expect(review).not.toHaveProperty("ranges");

  const file = { subject, baseline, tree, path: "notes.md" };
  const admitted = await reviewInput(file, signal);
  expect(await reviewedFileText(admitted, signal)).toEqual({
    kind: "text",
    baseline: null,
    tree: "originating edit\n",
  });
  const diff = await reviewedFileDiff(admitted, signal);
  expect(diff.kind === "diff" ? diff.printed : "").toContain(
    "+originating edit",
  );

  for (const outside of [
    { ...file, path: "later.md" },
    { ...file, baseline: tree, tree: other, path: "later.md" },
  ]) {
    const input = await reviewInput(outside, signal);
    await expect(reviewedFileDiff(input, signal)).rejects.toMatchObject({
      status: 409,
    });
  }
});

test("a published close naming another story cannot supply the Done story's comparison", async () => {
  const { subject, baseline, tree, signal } = await publishedOriginatingStory(
    "SEED-42#other-story",
  );
  const opening = { subject, completed: true, historical: true };
  expect(await storyReview(await reviewInput(opening, signal), signal)).toEqual(
    {
      kind: "unavailable",
      explanation: "No published comparison is available for this story.",
    },
  );
  const file = await reviewInput(
    { subject, baseline, tree, path: "notes.md" },
    signal,
  );
  await expect(reviewedFileDiff(file, signal)).rejects.toMatchObject({
    status: 404,
  });
});

test("a session-derived identity still refuses an unknown project", async () => {
  await expect(
    reviewInput(
      {
        subject: {
          source: "unknown-project",
          identity: `ad-hoc#${randomUUID()}`,
        },
        completed: true,
      },
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ status: 404, message: "Unknown catalog source." });
});
