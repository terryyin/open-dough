// Taken-story shapes for Intent's provisional CI timing comparison
// (../../../e2e/intent/intent-ci-comparison-taken.spec.ts): Story Branch keeps a live tip
// labelled provisional with Landed not yet; Trunk Mode puts the tip in the
// Provisional row beside Branch N/A. Shared helpers come from
// ./storyCiComparisonFixture.ts.

import type { Page } from "@playwright/test";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import { git } from "./storyReviewWorktree.ts";
import { observedFirstAttempts } from "./storyCiObservedJobs.ts";
import {
  precedeClaimWithPlanning,
  serveActionsFor,
} from "./storyCiComparisonFixture.ts";

// The agent both Taken shapes declare.
const takenAgent = "Yui";

// The taken agent's implementation in its workspace: authored by the agent,
// committed by the developer, as the agent's checkout commits it.
function commitAgentWork(
  workspace: string,
  revision: RevisionFacts,
): Promise<string> {
  const { agent: name, email } = agentIdentity(takenAgent);
  return commitDeclaredRevision(workspace, {
    ...revision,
    author: { name, email },
    committer: dashboardDeveloper,
  });
}

// Taken Story Branch with a completed branch tip build and the same
// pre-story baseline as done journeys. Leaves the story Taken (no wrap-up).
export async function publishTakenComparedStoryBranch(
  page: Page,
  origin: StartOrigin,
): Promise<{
  readonly identity: string;
  readonly title: string;
  readonly baseline: string;
  readonly branchTip: string;
  readonly agent: string;
  readonly branch: string;
  readonly restoreActions: () => void;
  readonly initialRuns: Record<string, readonly CiRunAnswer[]>;
  readonly serveRuns: (
    runsBySha: Record<string, readonly CiRunAnswer[]>,
  ) => void;
  readonly serveJobs: ReturnType<typeof serveActionsFor>["serveJobs"];
}> {
  const baseline = await precedeClaimWithPlanning(origin);
  const { agent, workspace, branch, claim } = await origin.publishTake({
    agent: takenAgent,
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
  });
  const branchTip = await commitAgentWork(workspace, {
    message: "story implementation on the branch",
    files: { "src/story.ts": "taken story work\n" },
  });
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);

  pull(origin.project);
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: claim,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const firstAttempts = observedFirstAttempts(baseline, branchTip, 102);
  const actions = serveActionsFor(committed, firstAttempts.runs, {}, branch);
  actions.serveJobs(firstAttempts.jobs);
  return {
    identity: queuedIdentity,
    title: "Story A",
    baseline,
    branchTip,
    agent,
    branch,
    initialRuns: firstAttempts.runs,
    ...actions,
  };
}

// Taken Trunk Mode with a provisional trunk tip build against the same
// pre-story baseline. Branch stays not applicable; Landed is not yet.
export async function publishTakenComparedTrunk(
  page: Page,
  origin: StartOrigin,
): Promise<{
  readonly identity: string;
  readonly title: string;
  readonly baseline: string;
  readonly trunkTip: string;
  readonly agent: string;
  readonly restoreActions: () => void;
}> {
  const baseline = await precedeClaimWithPlanning(origin);
  const { agent, workspace } = await origin.publishTake({
    agent: takenAgent,
    story: storyA,
    queued: [storyB],
    mode: "trunk",
    slug: "taken-trunk-ci",
  });
  const trunkTip = await commitAgentWork(workspace, {
    message: "story implementation on trunk",
    files: { "src/trunk-story.ts": "taken trunk work\n" },
  });
  push(workspace);

  pull(origin.project);
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: trunkTip,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const firstAttempts = observedFirstAttempts(baseline, trunkTip, 201);
  const actions = serveActionsFor(committed, firstAttempts.runs);
  actions.serveJobs(firstAttempts.jobs);
  return {
    identity: queuedIdentity,
    title: "Story A",
    baseline,
    trunkTip,
    agent,
    ...actions,
  };
}
