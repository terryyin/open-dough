// How one scenario row's last successful proof reads: its name with example
// cells, and its outcome with attempts, duration, time since, short commit,
// and whether the feature file's Git blob then was the one published now.
// Shared by file Proof rows (`./IntentProof.tsx`) and a summary's slowest
// scenarios (`./IntentSummarySlowest.tsx`), with the duration wording of
// `./proofDurationWords.ts`.

import type { SuccessfulProofObservation } from "./cucumberProof.ts";
import type { ScenarioRow } from "./gherkinScenarios.ts";
import { durationWords } from "./proofDurationWords.ts";
import { passed, passedAfterRetry } from "./proofScenarioCountLine.ts";
import { elapsedWords } from "./sessionsSidebarElapsed.ts";

// The outcome a row reads, with a retry-assisted pass named as such.
function outcomeOf({ attempts }: SuccessfulProofObservation): string {
  if (attempts === 1) return passed;
  const tries = `${String(attempts)} attempts`;
  return `${passedAfterRetry} (${tries})`;
}

export function ScenarioName({ row }: { readonly row: ScenarioRow }) {
  return (
    <>
      {row.scenario}
      {row.example === undefined ? null : (
        <span className="intent-proof-example">
          {" "}
          Example: {row.example.join(" | ")}
        </span>
      )}
    </>
  );
}

// The headers of the cells `ObservedCells` fills, in their order.
export const observedCellHeaders = [
  "Last successful proof",
  "Duration",
  "Observed",
  "Commit",
  "Observed on",
] as const;

export function ObservedCells({
  observation,
  publishedBlob,
  now,
}: {
  readonly observation: SuccessfulProofObservation;
  readonly publishedBlob: string | undefined;
  readonly now: number;
}) {
  const finished = Date.parse(observation.finishedAt);
  return (
    <>
      <td>{outcomeOf(observation)}</td>
      <td>{durationWords(observation.durationMs)}</td>
      <td>
        <time dateTime={observation.finishedAt}>
          {elapsedWords(Math.max(0, now - finished))} ago
        </time>
      </td>
      <td>
        <code>{observation.commit.slice(0, 7)}</code>
      </td>
      <td>
        {observation.featureBlob === publishedBlob
          ? "This file version"
          : "Earlier file version"}
      </td>
    </>
  );
}
