// Story A's completed history on a private origin, with Start's typed
// follow-up inputs and a host collaborator that records each received input.
// Start reads the Review repository the board's refresh has already synced.
import path from "node:path";
import { expect, onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { acceptLaunchRequest } from "../../server/agentLaunchAccept.ts";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { pendingInputOf } from "../../server/launchRecordStore.ts";
import { syncedReviewRepository } from "../../server/reviewRepository.ts";
import { publishedSessionReview } from "../../server/publishedSessionReview.ts";
import { lastSyncedPublishedSessionSource } from "../../server/publishedSessionSource.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { requirePublishedCompletion } from "../../server/storyReviewPublishedAdmission.ts";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { DoneStory } from "../../src/doneRecord.ts";
import type {
  FollowUp,
  FollowUpComparison,
  FollowUpFile,
} from "../../src/followUpRequest.ts";
import { ordinaryJourneyCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { fileFactsOf } from "../../test-support/support/followUpCompletedFile.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { configuredFixtureProject } from "./fixtureProject.ts";
import { type Pair, recordPublished } from "./publishedSessionCase.ts";
import { receivingHost } from "./receivingHost.ts";

export const storyA: Pick<DoneStory, "identity" | "title" | "completedAt"> =
  makeMe.aDoneRecord
    .completed({
      identity: queuedIdentity,
      title: "Story A",
      completedAt: "2026-11-08T09:05:00.000Z",
    })
    .please();

// Story A completed at `history`'s "completion" revision, its landings
// comparing from the `base` revision.
export async function aDoneStoryStart(
  history: RepositoryDescription<string> = ordinaryJourneyCompletedHistory(),
  base = "interleaving",
) {
  const { repository, home, project } = await configuredFixtureProject(history);
  const source = knownSource(project.id);
  const revision = (name: string) => {
    const sha = repository.revisions[name];
    if (sha === undefined) throw new Error(`No ${name} revision`);
    return sha;
  };
  const baseline = revision(base);
  const tree = revision("completion");
  const owner = new LaunchAttemptOwner();
  onTestFinished(async () => {
    owner.close();
    await owner.drain();
  });
  const { run, received } = receivingHost(project.id);
  const synced = () =>
    syncedReviewRepository(source, new AbortController().signal);
  const launch = async (
    followUp: FollowUp,
    story: Pick<DoneStory, "identity" | "title" | "completedAt">,
    instruction = "Review this accepted landing",
  ) => {
    await synced();
    const accepted = await acceptLaunchRequest(
      owner,
      source,
      admittedLaunchRequest(
        makeMe.aLaunchRequest
          .adHoc({
            source: project.id,
            instruction,
            followUp,
          })
          .please(),
      ),
      run,
      () => Promise.reject(new Error("No attempt is retained to continue.")),
      {
        notesFile: path.join(home, "story-notes.json"),
        publishedDoneStory: () => Promise.resolve(story),
        followUpStorySessions: () => Promise.resolve([]),
        pendingInputOf,
      },
    );
    await owner.drain();
    return accepted;
  };
  const start = (comparison: FollowUpComparison) =>
    launch(
      makeMe.aFollowUp.ofStory(storyA, tree).onComparison(comparison).please(),
      storyA,
    );
  // A file follow-up of `story`, which the published catalog reads as done,
  // requesting `instruction`.
  const startAt = (file: FollowUpFile, story = storyA, instruction?: string) =>
    launch(
      makeMe.aFollowUp.ofStory(story, tree).anchoredAt(file).please(),
      story,
      instruction,
    );
  const retainedLanding = (
    story: { identity: string; title: string },
    pair = { base: baseline, revision: tree },
  ) => {
    const record = makeMe.aLaunchRecord
      .executing(story)
      .inClaudeSession({ sessionId: story.identity })
      .onStoryBranch({
        workspace: path.join(home, "retired", story.identity),
        branch: "claude/landed-comparison",
      })
      .reportingThrough({ origin: "http://127.0.0.1:4173", command: "claude" })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({
            repository: repository.origin,
            identity: story.identity,
          })
          .comparing(pair),
      )
      .please();
    const reference = record.request.reporting?.reference;
    if (reference === undefined) throw new Error("expected a reported launch");
    return { record, reference };
  };
  const keep = (...runs: ReturnType<typeof retainedLanding>[]) => {
    keepLaunchRecords(
      home,
      runs.map(({ record }) => record),
    );
  };
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
  // Story A's session closing these ordered ranges, published on origin main.
  const publishSession = (first: Pair, ...later: Pair[]) =>
    pushed(
      later
        .reduce(
          (record, range) => record.andClosing(range),
          makeMe.aSessionRecord.forStory(queuedIdentity).closing(first),
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
  // The refusal Start answers, after checking no host or kept attempt started.
  const refusal = async (started: Promise<unknown>) => {
    const answer = await started.then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(received).toEqual([]);
    expect((await keptAttempts()) ?? []).toEqual([]);
    return answer;
  };
  return {
    baseline,
    tree,
    received,
    start,
    startAt,
    refusal,
    retainedLanding,
    keep,
    publishLanding,
    advance,
    publishSession,
    originMain,
    publishedSessionReviewOf,
    publishedCompletion,
    publishedFileAt,
    revision,
  };
}

export type DoneStoryStart = Awaited<ReturnType<typeof aDoneStoryStart>>;
