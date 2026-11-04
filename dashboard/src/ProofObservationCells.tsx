// How one case row's last successful proof reads: its name with its variant
// in the proof kind's words (`./proofKinds.ts`), and its outcome with
// attempts, duration, time since, short commit, and whether the file's Git
// blob then was the one published now. Shared by file Proof rows
// (`./IntentProof.tsx`) and a summary's slowest cases
// (`./IntentSummarySlowest.tsx`), with the duration wording of
// `./proofDurationWords.ts`.

import type { CaseRow, SuccessfulCaseObservation } from "./proofCases.ts";
import { durationWords } from "./proofDurationWords.ts";
import { passed, passedAfterRetry } from "./proofCountLine.ts";
import type { ProofKindWords } from "./proofKinds.ts";
import { elapsedWords } from "./sessionsSidebarElapsed.ts";

// The outcome a row reads, with a retry-assisted pass named as such.
function outcomeOf({ attempts }: SuccessfulCaseObservation): string {
  if (attempts === 1) return passed;
  const tries = `${String(attempts)} attempts`;
  return `${passedAfterRetry} (${tries})`;
}

// A case name with a line-break opportunity after each `_` and `::`, so a
// long pytest name wraps between its words rather than inside them.
function breakableName(name: string) {
  return name
    .split(/(?<=_|::)/)
    .flatMap((part, at) => (at === 0 ? [part] : [<wbr key={at} />, part]));
}

export function CaseName({
  row,
  words,
}: {
  readonly row: CaseRow;
  readonly words: ProofKindWords;
}) {
  return (
    <>
      {breakableName(row.name)}
      {row.variant === undefined ? null : (
        <span className="intent-proof-example">
          {" "}
          {words.variant(row.variant)}
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
  readonly observation: SuccessfulCaseObservation;
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
        {observation.fileBlob === publishedBlob
          ? "This file version"
          : "Earlier file version"}
      </td>
    </>
  );
}
