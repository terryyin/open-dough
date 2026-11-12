// Real published Story Branch facts and controlled provider answers for
// comparison-memory recovery. No comparison answer or resolver is supplied.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import { publishes } from "./publishedRepository.ts";
import { rawRequest } from "./rawHttp.ts";
import {
  passedFrom,
  trunkActions,
  trunkRun,
  usableProofOf,
  type TrunkProofs,
} from "./landedCiTrunk.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { publishUnbuiltStoryLanding } from "./storyCiComparisonSkippedLandingFixture.ts";
import { git } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { commitTrunkChanges } from "./trunkCommitBatch.ts";

export async function pendingLandedComparison(
  origin: StartOrigin,
  kind: "equivalent" | "later",
  laterRevisionsAfterCompletion = 0,
) {
  const story = await publishUnbuiltStoryLanding(
    origin,
    kind === "equivalent" ? "planning" : "code",
  );
  // Each later revision is a real planning-only commit; they share one Git
  // import (./trunkCommitBatch.ts) rather than a commit process apiece.
  commitTrunkChanges(
    origin.project,
    [...Array(laterRevisionsAfterCompletion).keys()].map((index) => ({
      message: "advance beyond the later-build walk",
      file: `.planning/after-${String(index)}.md`,
      content: "later planning\n",
    })),
  );
  if (laterRevisionsAfterCompletion > 0) push(origin.project);
  const runAt = (revision: string, id: number) =>
    trunkRun(revision, id, passedFrom("2026-11-05T13:00:00Z", 300_000));
  const baseline = runAt(story.baseline, 101);
  const branch = runAt(story.branchSide, 102);
  const represented = runAt(
    kind === "equivalent" ? story.trunkSide : story.completion,
    201,
  );
  const cancelled = makeMe.aCiRun
    .with({
      ...runAt(story.landingMerge, 202),
      conclusion: "cancelled",
    })
    .please();
  const runs: CiRunAnswer[] = [baseline, branch, represented];
  if (kind === "later") runs.push(cancelled);
  const proofs: TrunkProofs = {
    101: usableProofOf(baseline),
    102: usableProofOf(branch),
    201: usableProofOf(represented),
  };
  return { ...story, represented, runs, proofs };
}

export async function readLandedComparison(
  server: DashboardServer,
  identity: string,
): Promise<Extract<StoryCiComparisonAnswer, { kind: "comparison" }>> {
  const query = new URLSearchParams({
    source: "open-dough",
    intent: "ci-comparison",
    identity,
  });
  const response = await rawRequest({
    url: `${server.origin}/__authenticated-read?${query}`,
    headers: { Origin: server.origin },
  });
  if (response.status !== 200) throw new Error(response.body);
  const answer = JSON.parse(response.body) as StoryCiComparisonAnswer;
  if (answer.kind !== "comparison") throw new Error(response.body);
  return answer;
}

export function proofListings(github: FakeGitHub, runId: number): number {
  return github.calls.filter(
    ({ request }) =>
      request.kind === "actions-run-artifacts" && request.runId === runId,
  ).length;
}

export function serveProofAnswer(
  github: FakeGitHub,
  origin: StartOrigin,
  setup: Awaited<ReturnType<typeof pendingLandedComparison>>,
  answer: () => OriginAnswer | undefined,
) {
  const revision = git(origin.origin, "rev-parse", "main");
  const actions = trunkActions(setup.runs, setup.proofs);
  github.serve("terryyin/open-dough", (call) =>
    Promise.resolve(
      (call.request.kind === "actions-run-artifacts" &&
      call.request.runId === 201
        ? answer()
        : undefined) ??
        actions(call.argv, revision) ??
        publishes({ revision })(call),
    ),
  );
}
