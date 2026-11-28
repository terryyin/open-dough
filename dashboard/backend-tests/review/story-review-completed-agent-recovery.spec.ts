// A Done record without an agent recovers its unique published execution
// claim; missing, shallow or conflicting claim history explains itself.
import { beforeAll, expect, test } from "vitest";
import { prepareRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  completionRevision,
  queuedReadyRepository,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { agentWorktree } from "../../test-support/support/agentAuthoredWorktree.ts";
import {
  missingAgentStoryBranchCompletedHistory,
  missingAgentTrunkCompletedHistory,
  ordinaryTrunkModeCompletedHistory,
  returnedCompletedHistory,
  returnedThenTakeoverCompletedHistory,
} from "../../test-support/support/completedStoryHistory.ts";
import { developer } from "../../test-support/support/completedStoryThroughInterleaving.ts";
import { shallowPublishedHistory } from "../../test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { push } from "../../test-support/support/storyReviewTrunkCommits.ts";

// Each history's template is built before the cases that copy it.
for (const history of [
  () => returnedCompletedHistory(),
  () => missingAgentTrunkCompletedHistory(),
  () => missingAgentStoryBranchCompletedHistory(),
  () => ordinaryTrunkModeCompletedHistory(),
  () => returnedThenTakeoverCompletedHistory(),
  () => unclaimedCompletion(false),
  () => unclaimedCompletion(true),
])
  beforeAll(() => prepareRepository(history()));

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
const yui = agentIdentity("Yui").agent;
const doneRecord = `.planning/done/${doneRecordFileName(queuedIdentity)}`;

async function doneStory(history: RepositoryDescription<string>) {
  const { repository } = await configuredFixtureProject(history);
  const origin = {
    machine: repository.fixture,
    project: repository.integration,
  };
  const { completion } = repository.revisions;
  if (completion === undefined) throw new Error("No completion revision");
  const recordedAgent = () =>
    (
      JSON.parse(
        git(origin.project, "show", `${completion}:${doneRecord}`),
      ) as {
        agent?: string;
      }
    ).agent;
  const open = () =>
    storyReview({ read: { subject, completed: true } }, signal);
  return { origin, completion, recordedAgent, open };
}

const unavailable = (reason: string) => ({
  kind: "unavailable",
  explanation: expect.stringContaining(reason) as unknown,
});

// Profiles published after the completion that name the same story.
async function laterClaimAndPreparation(
  origin: { project: string },
  at: string,
) {
  const future = await agentWorktree(origin, "Airi-chan", "later-claim", at);
  const profile = (name: string) => `.planning/${agentIdentity(name).path}`;
  makeMe
    .theWorkspace(future)
    .writeAt(
      profile("Airi"),
      renderAgentProfile(
        makeMe.anAgentProfile
          .executing({
            name: "Airi",
            identity: queuedIdentity,
            mode: "trunk",
            branch: "exec/later-claim",
          })
          .please(),
      ),
    )
    .writeAt(
      profile("Akiho"),
      renderAgentProfile(
        makeMe.anAgentProfile
          .preparing({ name: "Akiho", identity: queuedIdentity })
          .please(),
      ),
    )
    .commitAll("later claim and preparation must not change the review")
    .please();
  push(future);
}

for (const [shape, history] of [
  ["returned", returnedCompletedHistory],
  [
    "trunk record without its claimant's release",
    missingAgentTrunkCompletedHistory,
  ],
  [
    "story-branch record without its claimant's release",
    missingAgentStoryBranchCompletedHistory,
  ],
] as const)
  test(`a ${shape} agentless completion recovers its unique published claim and admits its fixed files after a later claim and preparation`, async () => {
    const story = await doneStory(history());
    expect(story.recordedAgent()).toBeUndefined();
    const review = await story.open();
    expect(review).toMatchObject({
      kind: "published",
      completion: story.completion,
      agent: yui,
    });
    if (review.kind !== "published") throw new Error("No recovered review");
    expect(review).not.toHaveProperty("selectedRun");

    await laterClaimAndPreparation(story.origin, story.completion);

    expect(await story.open()).toEqual(review);
    const { baseline, tree } = review;
    expect(
      await reviewedFileDiff(
        {
          read: {
            subject,
            completion: story.completion,
            baseline,
            tree,
            path: "[literal]*.txt",
          },
        },
        signal,
      ),
    ).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining(
        "+delivered on another machine",
      ) as unknown,
    });
    expect(story.recordedAgent()).toBeUndefined();
  });

for (const [shape, history, reason] of [
  ["agentless", returnedCompletedHistory, "shallow"],
  ["agent-named", ordinaryTrunkModeCompletedHistory, "complete claim"],
] as const)
  test(`an ${shape} completion over shallow claim history explains the gap without files`, async () => {
    const story = await doneStory(history());
    shallowPublishedHistory(story.origin);

    const review = await story.open();

    expect(review).toEqual(unavailable(reason));
  });

test("an agentless completion refuses conflicting published execution owners", async () => {
  const story = await doneStory(returnedThenTakeoverCompletedHistory());
  expect(story.recordedAgent()).toBeUndefined();

  expect(await story.open()).toEqual(unavailable("multiple execution agents"));
});

const airi = agentIdentity("Airi");
const preparationOnly = {
  message: "published preparation is no execution claim",
  author: { name: airi.agent, email: airi.email },
  files: {
    [`.planning/${airi.path}`]: renderAgentProfile(
      makeMe.anAgentProfile
        .preparing({ name: "Airi", identity: queuedIdentity })
        .please(),
    ),
  },
};
const unclaimedCompletion = (preparation: boolean) => {
  const before = queuedReadyRepository();
  return (
    preparation ? before.withRevision("preparation", preparationOnly) : before
  )
    .withRevision(
      "completion",
      completionRevision({
        story: storyA,
        queued: [storyB],
        developer,
        agentless: true,
      }),
    )
    .please();
};

for (const preparation of [false, true])
  test(`an agentless completion with ${preparation ? "only preparation" : "no claim"} history is not attributed`, async () => {
    const story = await doneStory(unclaimedCompletion(preparation));

    expect(await story.open()).toEqual(
      unavailable("published execution claim"),
    );
  });
