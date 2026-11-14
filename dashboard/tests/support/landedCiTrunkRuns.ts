// Open Dough's trunk CI as the landed CI wall-time history specs serve it
// (./landedCiTrunk.ts): trunk's push runs, whose times a case may take from
// when their landings were recorded, so they stand in trunk order, and their
// CI proof, served to the server's `gh` as GitHub answers it, with no page
// open or for a page (../intentCiHistoryPage.ts); and a run as the history
// read answers it.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { OriginAnswer } from "../originAnswers.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import { actionsForRuns, type CiRunAnswer } from "./baseCiActions.ts";
import { runArtifactsAnswer } from "./ciProofArtifacts.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { isActionsRequest } from "./ghActionsRequest.ts";
import { publishes } from "./publishedRepository.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  answerComparisonProofRoute,
  mixedEntrySummary,
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";

// Run `id`'s link under ci.invalid.
const runUrlOf = (id: number) => `https://ci.invalid/runs/${String(id)}`;

// A push run of trunk's selected workflow at `revision`: run `id`, its first
// attempt, linked under ci.invalid, with the facts the case states.
export const trunkRun = (
  revision: string,
  id: number,
  facts: Partial<CiRunAnswer>,
): CiRunAnswer =>
  makeMe.aCiRun
    .with({
      headSha: revision,
      id,
      attempt: 1,
      url: runUrlOf(id),
      ...facts,
    })
    .please();

// `trunkRun`'s run `id` as the history read answers it: its link and its
// first attempt.
export const answeredRun = (id: number) =>
  makeMe.anAnsweredCiRun
    .with({
      runUrl: runUrlOf(id),
      runId: id,
      runAttempt: 1,
    })
    .please();

// A run's facts once it passed, from its start to its completion, created as
// it started.
export const passedBetween = (startedAt: string, completedAt: string) => ({
  conclusion: "success" as const,
  createdAt: startedAt,
  startedAt,
  completedAt,
});

// `ms` after the moment `at`, as a CI read names a moment.
export const timeAfter = (at: string, ms: number): string =>
  new Date(Date.parse(at) + ms).toISOString();

// A run's facts once it passed: created and started as the landing recorded
// at `at` was pushed, so it stands in trunk order, and completed `wallMs`
// later.
export const passedFrom = (at: string, wallMs: number) =>
  passedBetween(at, timeAfter(at, wallMs));

// A run's facts while it runs, created as the landing recorded at `at` was
// pushed.
export const runningFrom = (at: string) => ({
  status: "in_progress" as const,
  createdAt: at,
});

// What CI kept of each run's CI proof, by run: a usable summary of that run,
// a summary that has expired, an archive GitHub serves that cannot be opened
// as one, or a listing GitHub does not answer. A run named nowhere published
// no summary.
export type TrunkProofs = Readonly<
  Record<
    number,
    | ComparisonProofServe
    | { readonly kind: "unopenable"; readonly artifactId: number }
    | { readonly kind: "unanswered" }
  >
>;

// An artifact archive that is not a zip.
const unopenableArchive = (): OriginAnswer => ({
  status: 200,
  contentType: "application/zip",
  encoding: "base64",
  body: Buffer.from("not a zip archive").toString("base64"),
});

// A usable CI proof summary of `run`, as its own collector wrote it.
export function usableProofOf(run: CiRunAnswer): ComparisonProofServe {
  const runId = run.databaseId ?? run.id ?? 0;
  return {
    kind: "summary",
    artifactId: runId * 10,
    summary: mixedEntrySummary(
      proofRun(runId, run.headSha, run.attempt),
      "landed",
    ),
  };
}

// Trunk's Actions as GitHub answers them, whichever revision or branch a
// listing names: `runs` as the selected workflow's push runs, and each run's
// CI proof as `proofs` keeps it.
export function trunkActions(
  runs: readonly CiRunAnswer[],
  proofs: TrunkProofs = {},
): (argv: readonly string[]) => OriginAnswer | undefined {
  const runsByRevision: Record<string, CiRunAnswer[]> = {};
  for (const run of runs) (runsByRevision[run.headSha] ??= []).push(run);
  const served: Record<number, ComparisonProofServe> = {};
  const unanswered = new Set<number>();
  // Each unopenable archive's artifact by its run.
  const unopenable = new Map<number, number>();
  for (const [runId, proof] of Object.entries(proofs)) {
    if (proof.kind === "unanswered") unanswered.add(Number(runId));
    else if (proof.kind === "unopenable")
      unopenable.set(Number(runId), proof.artifactId);
    else served[Number(runId)] = proof;
  }
  return (argv) => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    const listed = Number(
      /\/actions\/runs\/(\d+)\/artifacts/.exec(route)?.[1] ?? Number.NaN,
    );
    if (unanswered.has(listed)) return notFoundAnswer();
    const unopenableArtifact = unopenable.get(listed);
    const run = runs.find(({ id }) => id === listed);
    if (unopenableArtifact !== undefined && run !== undefined)
      return runArtifactsAnswer(
        proofRun(listed, run.headSha, run.attempt),
        unopenableArtifact,
      );
    const zipped = Number(
      /\/actions\/artifacts\/(\d+)\/zip$/.exec(route)?.[1] ?? Number.NaN,
    );
    if ([...unopenable.values()].includes(zipped)) return unopenableArchive();
    return (
      actionsForRuns(runs)(argv) ??
      answerComparisonProofRoute(route, served, runsByRevision)
    );
  };
}

// Open Dough's trunk as GitHub answers the server's `gh` with no page open:
// the origin's `main` as published when asked, with `runs` of that `main` as
// the selected workflow's push runs and their CI proof as `proofs` keeps it,
// none unless the case states it (`trunkActions`), whichever revision or
// branch a listing names; while `readable` says no, every Actions read is not
// found.
export function serveTrunkRuns(
  github: FakeGitHub,
  origin: StartOrigin,
  runs: (main: string) => readonly CiRunAnswer[],
  {
    readable = () => true,
    proofs = () => ({}),
  }: {
    readonly readable?: () => boolean;
    readonly proofs?: () => TrunkProofs;
  } = {},
): void {
  github.serve("terryyin/open-dough", async (call) => {
    if (!readable() && isActionsRequest(call.request)) return notFoundAnswer();
    const main = await originMain(origin);
    return (
      trunkActions(runs(main), proofs())(call.argv) ??
      publishes({ revision: main })(call)
    );
  });
}
