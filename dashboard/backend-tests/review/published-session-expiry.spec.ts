// A published session record is reviewable by its UUID for 30 days counted
// from its close, whatever its commit time; past that, its review and file
// reads answer as for a session the project did not publish, even while the
// record's file is still at the fetched revision.
import { expect, test } from "vitest";
import {
  commitDeclaredRevision,
  integrationDeveloper,
} from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReview.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

const day = 24 * 60 * 60 * 1000;
const closedAt = "2026-10-01T10:00:00.000Z";
const atWindowEnd = new Date(Date.parse(closedAt) + 30 * day);
const pastWindow = new Date(atWindowEnd.getTime() + 1);

// A trunk that published a session closed at `closedAt`, its record committed
// 10 days after that close.
async function aSessionRecordedLaterThanItsClose() {
  const { checkout } = await aDoneCaptureCase().please();
  const repository = checkout.integration;
  const candidate = await commitDeclaredRevision(repository, {
    files: { "notes.md": "edited\n" },
  });
  const record = makeMe.aSessionRecord
    .closing({ base: checkout.base, candidate })
    .closedAt(closedAt)
    .please();
  const recordedLater = new Date(Date.parse(closedAt) + 10 * day).toISOString();
  const revision = await commitDeclaredRevision(repository, {
    files: {
      [sessionRecordPathBeside(backlogPath, record.sessionId)]:
        `${JSON.stringify(record)}\n`,
    },
    committer: { ...integrationDeveloper, date: recordedLater },
  });
  return {
    source: { repository, revision, backlogPath },
    session: record.sessionId,
    baseline: checkout.base,
    tree: candidate,
  };
}

type Published = Awaited<ReturnType<typeof aSessionRecordedLaterThanItsClose>>;

const review = ({ source, session }: Published, now: Date) =>
  storyReview(
    {
      read: { subject: { source: "open-dough", published: session } },
      published: source,
      now,
    },
    new AbortController().signal,
  );

const readFile = ({ source, session, baseline, tree }: Published, now: Date) =>
  reviewedFileDiff(
    {
      read: {
        subject: { source: "open-dough", published: session },
        baseline,
        tree,
        path: "notes.md",
      },
      published: source,
      now,
    },
    new AbortController().signal,
  );

const unpublished = {
  status: 404,
  message: "This project published no such session.",
};

test("Given a session record committed 10 days after its close, when reviewed exactly 30 days after the close, then it is reviewable", async () => {
  const published = await aSessionRecordedLaterThanItsClose();

  await expect(review(published, atWindowEnd)).resolves.toMatchObject({
    kind: "published-session",
    session: { closedAt },
  });
  await expect(readFile(published, atWindowEnd)).resolves.toMatchObject({
    kind: "diff",
  });
});

test("Given a session record committed 10 days after its close, when reviewed just past 30 days after the close, then its review and file read answer as unpublished", async () => {
  const published = await aSessionRecordedLaterThanItsClose();

  await expect(review(published, pastWindow)).rejects.toMatchObject(
    unpublished,
  );
  await expect(readFile(published, pastWindow)).rejects.toMatchObject(
    unpublished,
  );
});
