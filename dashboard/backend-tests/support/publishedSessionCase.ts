// A checkout whose trunk published a standalone session's close record, and
// the typed review and file reads of that session on a machine with no launch
// history, for the published-session review specs
// (../review/published-session-review.spec.ts,
// ../review/published-session-ranges.spec.ts).
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { aDoneCaptureCase } from "./doneCaptureCaseBuilder.ts";

type Pair = { readonly base: string; readonly candidate: string };

// Trunk publishes `record` at its path; answers that revision.
export const recordPublished = (
  repository: string,
  record: { readonly sessionId: string },
) =>
  commitDeclaredRevision(repository, {
    files: {
      [sessionRecordPathBeside(backlogPath, record.sessionId)]:
        `${JSON.stringify(record)}\n`,
    },
  });

// The published source a review of `sessionId` reads at `revision`, with the
// session's first recorded pair.
export const publishedAt = (
  repository: string,
  revision: string,
  sessionId: string,
  first: Pair,
) => ({
  source: { repository, revision, backlogPath },
  sessionId,
  ...first,
});

// A checkout whose trunk published a session's edit, its close record, and a
// later unrelated revision.
export async function aPublishedSession(range?: Pair) {
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
  return publishedAt(repository, revision, record.sessionId, recorded);
}

type PublishedSession = ReturnType<typeof publishedAt>;

// The review of the published session, or of another UUID, at the selected
// range unless the first.
export const read = (
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

// A file read of the published session, on its first recorded pair unless
// named.
export const readFile = (
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
