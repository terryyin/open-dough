import { makeMe } from "../../../tests/support/makeMe.mjs";
// Proof-summary Answers for Intent's story CI comparison journeys
// (./storyCiComparisonFixture.ts): retained summaries, expired listings and
// the mixed entry durations from example 2. Summaries of MakeMe-built
// entries are ./storyCiComparisonEntrySummaries.ts's.

import type { OriginAnswer } from "../originAnswers.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import {
  proofSummaryForEntries,
  runArtifactsAnswer,
  summaryZipAnswer,
  type ProofRun,
} from "./ciProofArtifacts.ts";

// One endpoint's proof summary for the comparison journey: a retained
// summary, an expired artifact listing, or no summary artifact.
export type ComparisonProofServe =
  | {
      readonly kind: "summary";
      readonly summary: unknown;
      readonly artifactId: number;
    }
  | { readonly kind: "expired"; readonly artifactId: number }
  | { readonly kind: "none" };

const repository = "terryyin/open-dough";

export function proofRun(
  runId: number,
  revision: string,
  attempt = 1,
): ProofRun {
  return { repository, runId, attempt, revision };
}

const slowerMs = {
  baseline: 240_000,
  branch: 270_000,
  landed: 300_000,
} as const;

const fasterMs = {
  baseline: 120_000,
  branch: 90_000,
  landed: 60_000,
} as const;

// Mixed entry changes from example 2, plus a faster entry and an added entry
// on branch/landed.
export function mixedEntrySummary(
  run: ProofRun,
  at: "baseline" | "branch" | "landed",
) {
  // Counts differ so comparison reads 2,090 → 2,092 test cases (+2),
  // while test-file counts stay flat.
  const entries = [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .counting(at === "baseline" ? 2090 : 2092, "case")
      .timed(slowerMs[at])
      .please(),
    makeMe.aCiProofEntry
      .at("tests")
      .counting(5, "file")
      .timed(fasterMs[at])
      .please(),
  ];
  if (at !== "baseline")
    entries.push(
      makeMe.aCiProofEntry
        .at("src/skills")
        .counting(3, "file")
        .timed(30_000)
        .please(),
    );
  return proofSummaryForEntries(run, entries);
}

// Baseline where dashboard/tests has no durations and tests is partial; branch
// and landed keep the mixed timed summaries.
export function untimedBaselineMixedProofs(args: {
  readonly baseline: string;
  readonly branchSide: string;
  readonly completion: string;
}): Record<number, ComparisonProofServe> {
  const baseline = proofRun(101, args.baseline);
  const branch = proofRun(102, args.branchSide);
  const landed = proofRun(103, args.completion);
  return {
    101: {
      kind: "summary",
      artifactId: 1001,
      summary: proofSummaryForEntries(baseline, [
        makeMe.aCiProofEntry
          .at("dashboard/tests")
          .counting(2090, "case")
          .please(),
        makeMe.aCiProofEntry
          .at("tests")
          .holding(
            makeMe.aCiProofEvidence
              .inUnit("file")
              .counting(3, 0, 0)
              .timed(60_000)
              .inParts(2)
              .withPresentPart(2, {
                passed: 2,
                failed: 0,
                other: 0,
                untimed: 0,
              })
              .please(),
          )
          .please(),
      ]),
    },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: mixedEntrySummary(branch, "branch"),
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: mixedEntrySummary(landed, "landed"),
    },
  };
}

export function defaultMixedProofs(args: {
  readonly landedAttempt?: number;
  readonly baseline: string;
  readonly branchSide: string;
  readonly completion: string;
}): Record<number, ComparisonProofServe> {
  return {
    101: {
      kind: "summary",
      artifactId: 1001,
      summary: mixedEntrySummary(proofRun(101, args.baseline), "baseline"),
    },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: mixedEntrySummary(proofRun(102, args.branchSide), "branch"),
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: mixedEntrySummary(
        proofRun(103, args.completion, args.landedAttempt),
        "landed",
      ),
    },
  };
}

function runForId(
  runsBySha: Record<string, readonly CiRunAnswer[]>,
  runId: number,
): CiRunAnswer | undefined {
  for (const group of Object.values(runsBySha)) {
    const found = group.find((run) => (run.databaseId ?? run.id) === runId);
    if (found !== undefined) return found;
  }
  return undefined;
}

// Artifact listing and zip Answers for comparison proof serving.
export function answerComparisonProofRoute(
  route: string,
  proofsByRunId: Record<number, ComparisonProofServe>,
  runsBySha: Record<string, readonly CiRunAnswer[]>,
): OriginAnswer | undefined {
  const artifacts = /\/actions\/runs\/(\d+)\/artifacts(?:\?(.*))?$/.exec(route);
  if (artifacts?.[1] !== undefined) {
    const runId = Number(artifacts[1]);
    const proof = proofsByRunId[runId];
    const found = runForId(runsBySha, runId);
    const run = proofRun(
      runId,
      found?.headSha ?? "0".repeat(40),
      found?.attempt,
    );
    if (proof === undefined || proof.kind === "none")
      return runArtifactsAnswer(run, undefined);
    if (proof.kind === "expired")
      return runArtifactsAnswer(run, proof.artifactId, true);
    return runArtifactsAnswer(run, proof.artifactId);
  }
  const zip = /\/actions\/artifacts\/(\d+)\/zip$/.exec(route);
  if (zip?.[1] !== undefined) {
    const artifactId = Number(zip[1]);
    for (const proof of Object.values(proofsByRunId)) {
      if (proof.kind !== "summary" || proof.artifactId !== artifactId) continue;
      return summaryZipAnswer(proof.summary);
    }
  }
  return undefined;
}
