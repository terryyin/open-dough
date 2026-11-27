// Story A's published history on the private origin a Done story Start case
// reads: trunk advances, published session and landing records, and the
// published reviews the synced Review repository answers for them.
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishedSessionReview } from "../../server/publishedSessionReview.ts";
import { lastSyncedPublishedSessionSource } from "../../server/publishedSessionSource.ts";
import { syncedReviewRepository } from "../../server/reviewRepository.ts";
import { requirePublishedCompletion } from "../../server/storyReviewPublishedAdmission.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { fileFactsOf } from "../../test-support/support/followUpCompletedFile.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { type Pair, recordPublished } from "./publishedSessionCase.ts";

// `repository`'s integration checkout publishes to its origin; Story A
// completed at `tree`, its landing comparing from `baseline`.
export function doneStoryPublishedHistory({
  repository,
  source,
  baseline,
  tree,
}: {
  readonly repository: {
    readonly integration: string;
    readonly origin: string;
  };
  readonly source: PublishedSource;
  readonly baseline: string;
  readonly tree: string;
}) {
  const synced = () =>
    syncedReviewRepository(source, new AbortController().signal);
  const pushed = async (record: { readonly sessionId: string }) => {
    await recordPublished(repository.integration, record);
    await git(repository.integration, "push", "origin", "HEAD:refs/heads/main");
    return record.sessionId;
  };
  const publishLanding = () =>
    pushed(
      makeMe.aSessionRecord
        .forExecutionOf(queuedIdentity)
        .closing({ base: baseline, candidate: tree })
        .please(),
    );
  // Trunk, after the completion, commits these files; answers the revision.
  const advance = (files: Record<string, string>) =>
    commitDeclaredRevision(repository.integration, { files });
  // `identity`'s session closing these ordered ranges, published on origin
  // main; answers its session id.
  const publishSession = (identity: string, first: Pair, ...later: Pair[]) =>
    pushed(
      later
        .reduce(
          (record, range) => record.andClosing(range),
          makeMe.aSessionRecord.forStory(identity).closing(first),
        )
        .please(),
    );
  const originMain = async () =>
    (await git(repository.origin, "rev-parse", "refs/heads/main")).stdout;
  // Review of Story A's published `session` at its numbered `run` range, on
  // the synced trunk.
  const publishedSessionReviewOf = async (session: string, run: string) => {
    const signal = new AbortController().signal;
    await synced();
    return publishedSessionReview(
      await lastSyncedPublishedSessionSource(source, signal),
      queuedIdentity,
      session,
      run,
      new Date(),
      signal,
    );
  };
  // Story A's published completion as the synced Review repository reads it.
  const publishedCompletion = async () => {
    await synced();
    return requirePublishedCompletion(source, queuedIdentity, tree);
  };
  // The follow-up anchor of the published completion's file at `filePath`,
  // optionally on one `line`, with the review that showed it.
  const publishedFileAt = async (
    filePath: string,
    line?: { line: number; side: "old" | "new" },
  ) => {
    const review = await publishedCompletion();
    const shown = review.files.find((file) => file.path === filePath);
    if (shown === undefined) throw new Error(`No published file ${filePath}`);
    return { review, file: fileFactsOf(review, shown, line) };
  };
  return {
    publishLanding,
    advance,
    publishSession,
    originMain,
    publishedSessionReviewOf,
    publishedCompletion,
    publishedFileAt,
  };
}
