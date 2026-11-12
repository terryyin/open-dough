// The provider's facts for one original run and its repeat, as GitHub answers
// the dashboard's exact reads of that run: the run as it stands, each attempt,
// each attempt's jobs, and the CI proof of the attempt it stands at. The
// journey scenario (./ciFollowUpScenario.ts) states the run it admits, and
// saved requests (./ciFollowUpSavedRequests.ts) the runs they name.
import { apiJob } from "../../../src/skills/dough-execute-plan/scripts/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { OriginAnswer } from "../originAnswers.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import { providerVerdict } from "./ciFollowUpProviderVerdict.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import {
  passedFrom,
  trunkActions,
  trunkRun,
  usableProofOf,
  type TrunkProofs,
} from "./landedCiTrunk.ts";
import { publishes } from "./publishedRepository.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";

export const json = (value: unknown, status = 200): OriginAnswer => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(value),
});

// The repeat as the provider has it: a full attempt 2 that passed in 106 s
// unless the case states otherwise. With `full` false its jobs are the
// original's, carried forward.
export type RepeatFacts = {
  readonly seconds?: number;
  readonly status?: "queued" | "in_progress" | "completed";
  readonly conclusion?: "success" | "failure" | "cancelled";
  readonly full?: boolean;
  readonly attempt?: number;
};

// Run `id` at `revision` with the `facts` of its first attempt, whose one job
// is `job`; a full repeat's job is the next one.
export function providerRepeatRun(
  revision: string,
  id: number,
  facts: Partial<CiRunAnswer>,
  job = { databaseId: id * 10 + 1, name: "proof" },
) {
  const original = trunkRun(revision, id, facts);
  let current = original;
  const verdict = providerVerdict();
  let full = true;
  let originalJobsReadable = true;
  let repeatProofReadable = true;
  return {
    original,
    // The attempt the run stands at.
    latest: () => current,
    setRepeat: (facts: RepeatFacts) => {
      const { seconds = 106, full: isFull = true, ...rest } = facts;
      full = isFull;
      current = trunkRun(revision, id, {
        ...original,
        ...passedFrom("2026-11-10T07:00:00.000Z", seconds * 1000),
        attempt: 2,
        ...rest,
      });
    },
    providerVerdict: (value: string | null | undefined) => {
      verdict.set(value);
    },
    originalJobsAvailable: (available: boolean) => {
      originalJobsReadable = available;
    },
    repeatProofAvailable: (available: boolean) => {
      repeatProofReadable = available;
    },
    // GitHub's answer to an exact read of this run, undefined for any other
    // request.
    answer: (request: GhRequest): OriginAnswer | undefined => {
      if (request.kind === "actions-current-run" && request.runId === id)
        return json(verdict.of(current));
      if (request.kind === "actions-run-attempt" && request.runId === id)
        return json(verdict.of(request.attempt === 1 ? original : current));
      if (request.kind !== "actions-attempt-jobs" || request.runId !== id)
        return undefined;
      if (request.attempt === 1 && !originalJobsReadable)
        return json({ total_count: 0, jobs: [] });
      const run = request.attempt === 1 ? original : current;
      const repeated = request.attempt !== 1 && full;
      const answered = makeMe.aGitHubJob
        .withFacts({
          databaseId: job.databaseId + (repeated ? 1 : 0),
          name: job.name,
          run_id: id,
          head_sha: revision,
          status: "completed",
          started_at: !full ? original.startedAt : run.startedAt,
          completed_at: !full ? original.completedAt : run.completedAt,
        })
        .please();
      return json({
        total_count: 1,
        jobs: [apiJob(answered as Parameters<typeof apiJob>[0])],
      });
    },
    // The CI proof GitHub keeps of the attempt the run stands at.
    proofs: (): TrunkProofs => {
      const observed = current.attempt === 1 ? original : current;
      if (observed.attempt !== 1 && !repeatProofReadable) return {};
      const proof = {
        ...usableProofOf(observed),
        artifactId: id * 10 + (observed.attempt ?? 1),
      };
      return { [id]: proof };
    },
  };
}

// `runs` as GitHub answers the origin's repository: each run's exact reads as
// its facts stand, then trunk's Actions with those runs and their CI proof,
// and the origin's `main` as published.
export function serveRepeatRuns(
  github: FakeGitHub,
  origin: StartOrigin,
  runs: readonly ReturnType<typeof providerRepeatRun>[],
): void {
  github.serve("terryyin/open-dough", async (call) => {
    const exact = runs
      .map((run) => run.answer(call.request))
      .find((answer) => answer !== undefined);
    if (exact !== undefined) return exact;
    const main = await originMain(origin);
    const proofs = Object.fromEntries(
      runs.flatMap((run) => Object.entries(run.proofs())),
    );
    const latest = runs.map((run) => run.latest());
    return (
      trunkActions(latest, proofs)(call.argv, main) ??
      publishes({ revision: main })(call)
    );
  });
}
