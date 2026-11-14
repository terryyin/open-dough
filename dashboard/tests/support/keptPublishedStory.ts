// Story A published as completed on a start origin's trunk, and kept: the
// history ./completedPublishedStory.ts leaves through the installed CLI in
// ordinary Trunk Mode with no other writer, declared instead as Yui's Take,
// her implementation and her completion with its done record. The product
// reads a completion from Git alone (../../server/completedCiFollowUps.ts),
// so the kept form is those commits. A worker prepares it once, before its
// first case (./pageTest.ts), and the origin of each case that starts from it
// is a copy that already holds it: such a case publishes no story itself.
// Nothing is kept between runs; the done record's completion time is the
// worker's. What only a real completion shows stays with the specs of
// ./completedPublishedStory.ts. The summary comparison story is the same
// kind of history, declared in ./intentSummaryStoryComparisonRepository.ts.
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { intentTrunkRevision } from "./intentStoryWorktree.ts";
import { declaredSummaryComparisonHistory } from "./intentSummaryStoryComparisonRepository.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
import {
  dashboardDeveloper,
  keepStartedOrigin,
  type StartRepository,
} from "./startOriginPreparation.ts";

// The trunk Story A was taken from: Stories A and B queued and Ready, or that
// with Intent's settings and sources published after it
// (./intentStoryWorktree.ts), or the summary comparison's trunk, from which
// it was delivered through a story branch with Intent test changes.
export type KeptStoryTrunk = "queued" | "intent" | "summary comparison";

const claimantName = "Yui";
const claimant = agentIdentity(claimantName);
const author = { name: claimant.agent, email: claimant.email };
const doneRecord = `.planning/done/${doneRecordFileName(storyA.identity)}`;

function completedStoryRepository(trunk: KeptStoryTrunk): StartRepository {
  const queued = queuedReadyRepository();
  return (
    trunk === "intent"
      ? queued.withRevision("intent trunk", intentTrunkRevision)
      : queued
  )
    .withRevision(
      "claim",
      takeRevision({
        story: storyA,
        queued: [storyB],
        agent: claimantName,
        committer: dashboardDeveloper,
        host: "claude",
        publisher: "another-publisher",
      }),
    )
    .withRevision("implementation", {
      message: "story implementation",
      author,
      files: { "story-a.txt": "Story A, delivered on another machine\n" },
    })
    .withRevision("completion", {
      message: "complete the story through CLI",
      author,
      backlog: { direction, queued: [storyB] },
      remove: [`.planning/${claimant.path}`],
      doneRecords: [
        makeMe.aDoneRecord
          .with({
            identity: storyA.identity,
            title: storyA.title,
            completedAt: new Date().toISOString(),
            agent: claimant.agent,
            host: "claude",
          })
          .please(),
      ],
    })
    .please();
}

// Declares the story completed now on `trunk`, starts a Claude origin from
// that description once and keeps it. Answers the description: an origin
// started from it afterwards is a copy of the kept one.
export async function prepareKeptStory(
  trunk: KeptStoryTrunk,
): Promise<StartRepository> {
  const description =
    trunk === "summary comparison"
      ? declaredSummaryComparisonHistory()
      : completedStoryRepository(trunk);
  const started = await startOrigin(description);
  try {
    keepStartedOrigin("claude", description, started.origin);
  } finally {
    started.cleanup();
  }
  return description;
}

// What a test extends itself with (`test.extend(…)`) so that each case's
// origin starts from the worker's kept story, after whatever the test's own
// `originRepository` waits for. Playwright reads a fixture's dependencies
// from its parameter names, so each trunk's opt-in names its worker fixture.
export const startingFromKeptStory = {
  originRepository: async (
    {
      originRepository,
      keptStory,
    }: { originRepository: StartRepository; keptStory: StartRepository },
    use: (description: StartRepository) => Promise<void>,
  ) => {
    await Promise.resolve(originRepository);
    await use(keptStory);
  },
};
export const startingFromKeptIntentStory = {
  originRepository: async (
    {
      originRepository,
      keptIntentStory,
    }: { originRepository: StartRepository; keptIntentStory: StartRepository },
    use: (description: StartRepository) => Promise<void>,
  ) => {
    await Promise.resolve(originRepository);
    await use(keptIntentStory);
  },
};
export const startingFromKeptSummaryComparisonStory = {
  originRepository: async (
    {
      originRepository,
      keptSummaryComparisonStory,
    }: {
      originRepository: StartRepository;
      keptSummaryComparisonStory: StartRepository;
    },
    use: (description: StartRepository) => Promise<void>,
  ) => {
    await Promise.resolve(originRepository);
    await use(keptSummaryComparisonStory);
  },
};

// The completion of the kept story on the queued or Intent trunk that
// `origin` started from: the revision that published Story A's done record
// on that trunk. The summary comparison's endpoints are read by name
// (./intentSummaryStoryComparisonRepository.ts).
export async function keptStoryCompletion(origin: StartOrigin) {
  const completion = (
    await origin.originGit(
      "log",
      "--format=%H",
      "--diff-filter=A",
      "main",
      "--",
      doneRecord,
    )
  ).trim();
  if (!/^[0-9a-f]{40}$/.test(completion))
    throw new Error(
      "This origin holds no kept published story: its test starts from one with startingFromKeptStory or startingFromKeptIntentStory (./keptPublishedStory.ts).",
    );
  return completion;
}
