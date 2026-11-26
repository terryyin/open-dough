// Start admits a Done story's whole selected comparison only when it is the
// exact pair of that story's retained or published landing, or of its
// published completion, before acceptance reaches the host.
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { acceptLaunchRequest } from "../../server/agentLaunchAccept.ts";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { pendingInputOf } from "../../server/launchRecordStore.ts";
import { syncedReviewRepository } from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { requirePublishedCompletion } from "../../server/storyReviewPublishedAdmission.ts";
import type { DoneStory } from "../../src/doneRecord.ts";
import type { FollowUpComparison } from "../../src/followUpRequest.ts";
import { ordinaryJourneyCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { otherStory } from "../../test-support/support/followUpStories.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { recordPublished } from "../support/publishedSessionCase.ts";
import { receivingHost } from "../support/receivingHost.ts";

const storyA: Pick<DoneStory, "identity" | "title" | "completedAt"> =
  makeMe.aDoneRecord
    .completed({
      identity: queuedIdentity,
      title: "Story A",
      completedAt: "2026-11-08T09:05:00.000Z",
    })
    .please();
const notOnRun = "The file or comparison does not belong to this captured run.";

// Story A's completed history on a private origin, with Start's typed
// follow-up inputs and a host collaborator that records each received input.
async function aDoneStoryStart() {
  const { repository, home, project } = await configuredFixtureProject(
    ordinaryJourneyCompletedHistory(),
  );
  const source = knownSource(project.id);
  const revision = (name: string) => {
    const sha = repository.revisions[name];
    if (sha === undefined) throw new Error(`No ${name} revision`);
    return sha;
  };
  const baseline = revision("interleaving");
  const tree = revision("completion");
  const owner = new LaunchAttemptOwner();
  onTestFinished(async () => {
    owner.close();
    await owner.drain();
  });
  const { run, received } = receivingHost(project.id);
  const start = async (comparison: FollowUpComparison) => {
    const followUp = makeMe.aFollowUp
      .ofStory(storyA, tree)
      .onComparison(comparison)
      .please();
    // The board's refresh has synced the published history Start reads.
    await syncedReviewRepository(source, new AbortController().signal);
    const accepted = await acceptLaunchRequest(
      owner,
      source,
      admittedLaunchRequest(
        makeMe.aLaunchRequest
          .adHoc({
            source: project.id,
            instruction: "Review this accepted landing",
            followUp,
          })
          .please(),
      ),
      run,
      () => Promise.reject(new Error("No attempt is retained to continue.")),
      {
        notesFile: path.join(home, "story-notes.json"),
        publishedDoneStory: () => Promise.resolve(storyA),
        followUpStorySessions: () => Promise.resolve([]),
        pendingInputOf,
      },
    );
    await owner.drain();
    return accepted;
  };
  const retainedLanding = (story: { identity: string; title: string }) => {
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
          .comparing({ base: baseline, revision: tree }),
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
  const publishLanding = async () => {
    const record = makeMe.aSessionRecord
      .forExecutionOf(queuedIdentity)
      .closing({ base: baseline, candidate: tree })
      .please();
    await recordPublished(repository.integration, record);
    await git(repository.integration, "push", "origin", "HEAD:refs/heads/main");
    return record.sessionId;
  };
  const refusal = async (comparison: FollowUpComparison) => {
    const answer = await start(comparison).then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(received).toEqual([]);
    expect((await keptAttempts()) ?? []).toEqual([]);
    return answer;
  };
  return {
    source,
    baseline,
    tree,
    received,
    start,
    refusal,
    retainedLanding,
    keep,
    publishLanding,
    revision,
  };
}

type DoneStoryStart = Awaited<ReturnType<typeof aDoneStoryStart>>;

for (const { landing, landed } of [
  {
    landing: "retained",
    landed: ({ retainedLanding, keep }: DoneStoryStart) => {
      const run = retainedLanding(storyA);
      keep(run);
      return Promise.resolve(run.reference);
    },
  },
  {
    landing: "published",
    landed: ({ publishLanding }: DoneStoryStart) => publishLanding(),
  },
]) {
  test(`a whole follow-up admits the exact pair of a ${landing} landing`, async () => {
    const doneStory = await aDoneStoryStart();
    const { baseline, tree, received, start } = doneStory;
    const reference = await landed(doneStory);

    const accepted = await start({ reference, baseline, tree });

    expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
    expect(received).toHaveLength(1);
    expect(received[0]?.input).toContain(
      `- Comparison: Landed run ${baseline} → ${tree}`,
    );
  });
}

test("a mismatched baseline or tree and another story's reference are refused before acceptance", async () => {
  const {
    baseline,
    tree,
    received,
    start,
    refusal,
    retainedLanding,
    keep,
    revision,
  } = await aDoneStoryStart();
  const own = retainedLanding(storyA);
  const foreign = retainedLanding(otherStory);
  keep(own, foreign);
  const valid = { reference: own.reference, baseline, tree };

  for (const { comparison, status, message } of [
    {
      comparison: { ...valid, baseline: revision("implementation") },
      status: 409,
      message: notOnRun,
    },
    {
      comparison: { ...valid, tree: baseline },
      status: 409,
      message: notOnRun,
    },
    {
      comparison: { ...valid, reference: foreign.reference },
      status: 404,
      message: "This story has no landed run with that reference.",
    },
  ])
    expect(await refusal(comparison)).toMatchObject({ status, message });

  expect((await start(valid)).kind).toBe("accepted");
  expect(received).toHaveLength(1);
});

test("a published whole-story comparison refuses a different tree before acceptance", async () => {
  const { source, revision, received, start, refusal } =
    await aDoneStoryStart();
  const completion = revision("completion");
  await syncedReviewRepository(source, new AbortController().signal);
  const review = await requirePublishedCompletion(
    source,
    queuedIdentity,
    completion,
  );
  const valid = { completion, baseline: review.baseline, tree: review.tree };

  expect(await refusal({ ...valid, tree: completion })).toMatchObject({
    status: 409,
    message: "The comparison does not belong to this published completion.",
  });

  expect((await start(valid)).kind).toBe("accepted");
  expect(received).toHaveLength(1);
});
