// Intent's Proof pane for one selected feature file (`./IntentBrowser.tsx`):
// every scenario and outline row the published text runs, in source order
// (`./gherkinScenarios.ts`), each with its last successful committed proof
// (`./cucumberProof.ts`) and that observation's own time, commit, and
// whether the feature file's Git blob then was the one published now. A
// count line summarizes successful proof, scenarios without successful proof
// included; it is never a suite verdict. A file without successful proof,
// a project that records no proof, and proof that could not be read (with
// retry) each say so differently (`./IntentProofAbsence.tsx`).

import {
  proofIdentity,
  type SuccessfulProofObservation,
} from "./cucumberProof.ts";
import type { IntentLocationProof } from "./authenticatedIntentRead.ts";
import { scenarioRowsOf, type ScenarioRow } from "./gherkinScenarios.ts";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import {
  noSuccessfulProof,
  passed,
  passedAfterRetry,
  proofScenarioCountLine,
} from "./proofScenarioCountLine.ts";
import { elapsedWords } from "./sessionsSidebarElapsed.ts";
import { useTickingNow } from "./useTickingNow.ts";

// The outcome a row reads, with a retry-assisted pass named as such.
function outcomeOf({ attempts }: SuccessfulProofObservation): string {
  if (attempts === 1) return passed;
  const tries = `${String(attempts)} attempts`;
  return `${passedAfterRetry} (${tries})`;
}

function durationWords(ms: number): string {
  if (ms < 1000) return `${String(Math.round(ms))} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const seconds = Math.round(ms / 1000);
  return `${String(Math.floor(seconds / 60))}m ${String(seconds % 60)}s`;
}

function ScenarioName({ row }: { readonly row: ScenarioRow }) {
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

function ObservedCells({
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

function ProofRows({
  path,
  text,
  proof,
}: {
  readonly path: string;
  readonly text: string;
  readonly proof: Extract<IntentLocationProof, { observations: unknown }>;
}) {
  const now = useTickingNow(30_000);
  const latest = new Map(
    proof.observations
      .filter((observation) => observation.feature === path)
      .map((observation) => [proofIdentity(observation), observation]),
  );
  const rows = scenarioRowsOf(text).map((row) => ({
    row,
    observation: latest.get(proofIdentity({ feature: path, ...row })),
  }));
  const publishedBlob = proof.featureBlobs[path];
  return (
    <>
      <p className="intent-proof-counts">
        {latest.size === 0 ? (
          <>
            No successful proof recorded for this file in{" "}
            <code>{proof.path}</code>.
          </>
        ) : (
          proofScenarioCountLine(rows.map(({ observation }) => observation))
        )}
      </p>
      <table className="intent-proof-rows" aria-label={`${path} proof`}>
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            <th scope="col">Last successful proof</th>
            <th scope="col">Duration</th>
            <th scope="col">Observed</th>
            <th scope="col">Commit</th>
            <th scope="col">Observed on</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, observation }, at) => (
            <tr key={at}>
              <th scope="row">
                <ScenarioName row={row} />
              </th>
              {observation === undefined ? (
                <>
                  <td>{noSuccessfulProof}</td>
                  <td />
                  <td />
                  <td />
                  <td />
                </>
              ) : (
                <ObservedCells
                  observation={observation}
                  publishedBlob={publishedBlob}
                  now={now}
                />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function IntentProof({
  path,
  kind,
  text,
  proof,
  rereading,
  onRetry,
}: {
  readonly path: string;
  readonly kind: string | undefined;
  readonly text: string | undefined;
  readonly proof: IntentLocationProof | undefined;
  // Whether the proof is being read again after a failed read.
  readonly rereading: boolean;
  readonly onRetry: () => void;
}) {
  if (path === "") {
    return <p className="quiet">Select a feature file to see its Proof.</p>;
  }
  if (proof === undefined || "problem" in proof) {
    return (
      <IntentProofAbsence
        kind={kind}
        proof={proof}
        rereading={rereading}
        onRetry={onRetry}
      />
    );
  }
  if (text === undefined) {
    return <p className="quiet">Proof is shown once {path} is read.</p>;
  }
  return <ProofRows path={path} text={text} proof={proof} />;
}
