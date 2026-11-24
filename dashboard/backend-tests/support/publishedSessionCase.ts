// A checkout whose trunk published a standalone session's close record, and
// the typed review and file reads of that session on a machine with no launch
// history, for the published-session review specs
// (../review/published-session-review.spec.ts,
// ../review/published-session-ranges.spec.ts,
// ../review/published-session-review-request.spec.ts).
import { renameSync } from "node:fs";
import { onTestFinished, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { syncedReviewRepository } from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReview.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import { aDoneCaptureCase } from "./doneCaptureCaseBuilder.ts";
import { fixtureRepository, stubFixtureHome } from "./fixtureHome.ts";

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
      now: new Date(),
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
      now: new Date(),
    },
    new AbortController().signal,
  );

// A configured project, mounted for the test, whose Review repository last
// synced origin/main at a session record, while origin has since advanced past it with an unrelated
// file and a later session's record, and the execution checkout is retired.
export async function aSyncedPublishedSession() {
  const { checkout } = await aDoneCaptureCase().withOrigin().please();
  const integration = checkout.integration;
  const origin = await git(integration, "remote", "get-url", "origin");
  stubFixtureHome(checkout.fixture, origin.stdout.trim());
  const unmount = mountProjectConfiguration("development");
  onTestFinished(() => {
    unmount();
    vi.unstubAllEnvs();
  });
  const candidate = await commitDeclaredRevision(integration, {
    files: { "notes.md": "edited\n" },
  });
  const recorded = { base: checkout.base, candidate };
  const record = makeMe.aSessionRecord.closing(recorded).please();
  const recordedAt = await recordPublished(integration, record);
  await git(integration, "push", "--quiet", "origin", "main");
  appendConfiguredProject(
    makeMe.aConfiguredProject
      .with({
        id: "open-dough",
        label: "Open Dough",
        repository: fixtureRepository,
        backlogPath,
        localPath: `${integration}-retired`,
      })
      .please(),
  );
  const source = knownSource("open-dough");
  const repository = await syncedReviewRepository(
    source,
    new AbortController().signal,
  );
  const unsynced = makeMe.aSessionRecord.closing(recorded).please();
  await recordPublished(integration, unsynced);
  const advanced = await commitDeclaredRevision(integration, {
    files: { "later.md": "later\n" },
  });
  await git(integration, "push", "--quiet", "origin", "main");
  renameSync(integration, `${integration}-retired`);
  return {
    fixture: checkout.fixture,
    repository,
    recordedAt,
    advanced,
    sessionId: record.sessionId,
    unsyncedSessionId: unsynced.sessionId,
    source,
    ...recorded,
  };
}

// A file read of a configured project's published session as the file route
// admits it, on the session's first recorded pair.
export const readAdmittedFile = async (
  session: string,
  pair: Pair,
  path: string,
) => {
  const signal = new AbortController().signal;
  const input = await reviewInput(
    {
      subject: { source: "open-dough", published: session },
      baseline: pair.base,
      tree: pair.candidate,
      path,
    },
    signal,
  );
  return reviewedFileDiff(input, signal);
};
