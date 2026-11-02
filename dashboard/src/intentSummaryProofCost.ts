// Summed proof cost of a Gherkin location or folder summary
// (`./IntentGherkinSummary.tsx`): the last successful proof durations of the
// read files' scenario rows (`./intentSummaryCoverage.ts`), with how many rows
// that covers, labelled Partial like the count line, and when and from which
// commits those observations finished. Rows without successful proof add no
// duration, and a selection with none says its duration is unknown, never
// zero.

import type { SuccessfulProofObservation } from "./cucumberProof.ts";
import {
  coverageLabelledLine,
  scenarioWords,
  type CoverageTally,
} from "./intentSummaryCoverage.ts";
import { durationWords } from "./proofDurationWords.ts";

// The summed cost of the scenario rows of read files: counted rows are those
// with a latest successful observation, and the spread is their oldest and
// newest finish and distinct commits.
export type ProofCost = {
  readonly summedMs: number;
  readonly covered: number;
  readonly scenarios: number;
  readonly oldest: string | undefined;
  readonly newest: string | undefined;
  readonly commits: readonly string[];
};

export function proofCostOf(
  observed: readonly (SuccessfulProofObservation | undefined)[],
): ProofCost {
  let summedMs = 0;
  let covered = 0;
  let oldest: string | undefined;
  let newest: string | undefined;
  const commits = new Set<string>();
  for (const observation of observed) {
    if (observation === undefined) continue;
    summedMs += observation.durationMs;
    covered += 1;
    commits.add(observation.commit);
    const finished = Date.parse(observation.finishedAt);
    if (oldest === undefined || finished < Date.parse(oldest)) {
      oldest = observation.finishedAt;
    }
    if (newest === undefined || finished > Date.parse(newest)) {
      newest = observation.finishedAt;
    }
  }
  return {
    summedMs,
    covered,
    scenarios: observed.length,
    oldest,
    newest,
    commits: [...commits],
  };
}

export function proofCostLineFor(
  coverage: CoverageTally,
  cost: ProofCost,
): string {
  return coverageLabelledLine(
    coverage,
    cost.covered === 0
      ? "Summed duration of last successful proof unknown"
      : `Summed duration of last successful proof: ${durationWords(cost.summedMs)} over ${String(cost.covered)} of ${scenarioWords(cost.scenarios)}`,
    "Summed duration unavailable",
  );
}

export const proofCostNote =
  "A sum of separate scenario observations, retries included, not a run's elapsed time.";

const utcDay = (at: string) =>
  new Date(Date.parse(at)).toISOString().slice(0, 10);
const utcMinute = (at: string) =>
  new Date(Date.parse(at)).toISOString().slice(11, 16);

// When the counted observations finished, oldest to newest in UTC, and from
// which commit or how many commits; undefined without counted rows.
export function proofSpreadLine(cost: ProofCost): string | undefined {
  const { oldest, newest, commits, covered } = cost;
  if (oldest === undefined || newest === undefined) return undefined;
  const noun = covered === 1 ? "Observation" : "Observations";
  const sameDay = utcDay(oldest) === utcDay(newest);
  let when: string;
  if (sameDay && utcMinute(oldest) === utcMinute(newest)) {
    when = `at ${utcMinute(oldest)} UTC on ${utcDay(oldest)}`;
  } else if (sameDay) {
    when = `between ${utcMinute(oldest)} and ${utcMinute(newest)} UTC on ${utcDay(oldest)}`;
  } else {
    when = `between ${utcDay(oldest)} ${utcMinute(oldest)} and ${utcDay(newest)} ${utcMinute(newest)} UTC`;
  }
  const from =
    commits.length === 1
      ? `commit ${(commits[0] ?? "").slice(0, 7)}`
      : `${String(commits.length)} commits`;
  return `${noun} finished ${when}, from ${from}.`;
}
