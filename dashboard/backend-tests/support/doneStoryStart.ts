// Story A's completed history on a private origin, with Start's typed
// follow-up inputs and a host collaborator that records each received input.
// Start reads the Review repository the board's refresh has already synced;
// the case also publishes and reads that history (doneStoryPublishedHistory.ts).
import path from "node:path";
import { expect, onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  acceptLaunchRequest,
  continueKeptAttempt,
} from "../../server/agentLaunchAccept.ts";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import {
  followUpStorySessions,
  requirePublishedFollowUpSessionStory,
} from "../../server/followUpStory.ts";
import { keptSession, pendingInputOf } from "../../server/launchRecordStore.ts";
import { syncedReviewRepository } from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { DoneStory } from "../../src/doneRecord.ts";
import type {
  FollowUp,
  FollowUpComparison,
  FollowUpFile,
} from "../../src/followUpRequest.ts";
import { ordinaryJourneyCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { doneStoryRecords } from "../../test-support/support/followUpStories.ts";
import { configuredFixtureProject } from "./fixtureProject.ts";
import { doneStoryPublishedHistory } from "./doneStoryPublishedHistory.ts";
import { receivingHost } from "./receivingHost.ts";

export const storyA: Pick<DoneStory, "identity" | "title" | "completedAt"> =
  makeMe.aDoneRecord
    .completed({
      identity: queuedIdentity,
      title: "Story A",
      completedAt: "2026-11-08T09:05:00.000Z",
    })
    .please();

// Story A as the published catalog reads it: completed by a developer with
// an agent.
export const [cataloguedStoryA = storyA] = doneStoryRecords(
  [storyA],
  storyA.completedAt,
);

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
  const { run, received, refuseNext } = receivingHost(project.id);
  // A matching kept attempt continues through the production checks and run.
  const continueAttempt = async (id: string) => {
    const continued = await continueKeptAttempt(
      owner,
      source,
      id,
      new StartProgress(),
      run,
    );
    await owner.drain();
    return continued;
  };
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
      continueAttempt,
      {
        notesFile: path.join(home, "story-notes.json"),
        publishedDoneStory: () => Promise.resolve(story),
        followUpStorySessions,
        pendingInputOf,
        keptSession,
        requirePublishedFollowUpSessionStory,
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
    home,
    baseline,
    tree,
    received,
    refuseNext,
    launch,
    continueAttempt,
    start,
    startAt,
    refusal,
    retainedLanding,
    keep,
    revision,
    ...doneStoryPublishedHistory({ repository, source, baseline, tree }),
  };
}

export type DoneStoryStart = Awaited<ReturnType<typeof aDoneStoryStart>>;
