// A selected story's CI timing comparison on Intent's homepage
// (`./IntentCiStatus.tsx`): names the baseline, branch and landed builds with
// each selection rule and a run link where available (as CI judgment/proof
// do), shows CI wall time with signed whole-second differences, then one row
// per CI entry in the homepage proof table (`./CiProofTable.tsx`) with each
// endpoint's cumulative test execution time. Taken answers label the live tip
// provisional and say Landed has not landed yet; Taken Trunk Mode also names
// the provisional trunk tip beside Branch N/A.

import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import { comparisonEntriesFromProofs } from "./useIntentCiComparisonEntries.ts";
import {
  observedNotAttributed,
  selectionWords,
  wallTimeDifferenceWords,
  wallTimeWords,
} from "./storyCiComparisonWording.ts";
import type {
  StoryCiComparisonAnswer,
  StoryCiComparisonSlot,
} from "./storyCiComparison.ts";

function LinkedRun({
  name,
  url,
}: {
  readonly name: string;
  readonly url: string | undefined;
}) {
  return url === undefined ? (
    <>{name}</>
  ) : (
    <a href={url} target="_blank" rel="noreferrer">
      {name}
    </a>
  );
}

function BuildIdentity({
  slot,
  provisional,
}: {
  readonly slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>;
  readonly provisional: boolean;
}): ReactNode {
  const adapter = slot.adapterAttempt;
  const runName =
    adapter !== undefined
      ? `run ${adapter.runId} · attempt ${adapter.attemptId}`
      : slot.runId !== undefined && slot.runAttempt !== undefined
        ? `run ${String(slot.runId)} #${String(slot.runAttempt)}`
        : "run unknown";
  const state =
    slot.kind === "running"
      ? "running"
      : slot.state === "pass"
        ? "passed"
        : "failed";
  const failed =
    slot.kind === "build" && slot.state === "failed" ? " (failed build)" : "";
  return (
    <>
      <code>{shortSha(slot.revision)}</code>
      {" · "}
      {adapter !== undefined ? `${slot.subject} · ` : null}
      <LinkedRun name={runName} url={slot.runUrl} />
      {` · ${state} · ${selectionWords(slot, provisional)}${failed}`}
    </>
  );
}

function EndpointIdentity({
  slot,
  provisional,
}: {
  readonly slot: StoryCiComparisonSlot;
  readonly provisional: boolean;
}) {
  if (slot.kind === "build" || slot.kind === "running")
    return <BuildIdentity slot={slot} provisional={provisional} />;
  return slot.explanation;
}

function EndpointRow({
  label,
  slot,
  baseline,
  provisional,
}: {
  readonly label: string;
  readonly slot: StoryCiComparisonSlot;
  readonly baseline: StoryCiComparisonSlot;
  readonly provisional: boolean;
}) {
  const wall = wallTimeWords(slot);
  const diff =
    label === "Baseline" ? undefined : wallTimeDifferenceWords(baseline, slot);
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="intent-ci-comparison-identity">
        <EndpointIdentity slot={slot} provisional={provisional} />
      </td>
      <td className="intent-ci-comparison-wall">
        {wall ?? "—"}
        {diff !== undefined ? ` ${diff}` : ""}
      </td>
    </tr>
  );
}

function EntryComparison() {
  const evidence = useIntentCiEvidence();
  const proofs =
    evidence.kind === "comparison" || evidence.kind === "judged"
      ? evidence.endpointProofs
      : undefined;
  if (proofs === undefined) {
    return (
      <p className="intent-ci-reading" role="status">
        Reading entry comparison…
      </p>
    );
  }
  const entries = comparisonEntriesFromProofs(proofs);
  if (entries.kind === "checking") {
    return (
      <p className="intent-ci-reading" role="status">
        Reading entry comparison…
      </p>
    );
  }
  if (entries.kind === "empty") {
    return (
      <p className="intent-ci-comparison-entries">{entries.explanation}</p>
    );
  }
  return (
    <CiProofTable
      label="CI entry timing comparison"
      scopeHeader="Entry"
      rows={entries.rows.map((row) => ({
        key: row.path,
        scope: <ScopePath path={row.path} />,
        cells: row.cells,
      }))}
    />
  );
}

function ComparisonBody({
  answer,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
}) {
  const taken = answer.phase === "taken";
  const branchProvisional = taken && answer.mode === "story-branch";
  return (
    <table className="intent-ci-comparison">
      <caption className="visually-hidden">
        Baseline, branch and landed CI builds with wall times
      </caption>
      <thead>
        <tr>
          <th scope="col">Endpoint</th>
          <th scope="col">Build</th>
          <th scope="col">CI wall time</th>
        </tr>
      </thead>
      <tbody>
        <EndpointRow
          label="Baseline"
          slot={answer.baseline}
          baseline={answer.baseline}
          provisional={false}
        />
        <EndpointRow
          label="Branch"
          slot={answer.branch}
          baseline={answer.baseline}
          provisional={branchProvisional}
        />
        {answer.provisional !== undefined && (
          <EndpointRow
            label="Provisional"
            slot={answer.provisional}
            baseline={answer.baseline}
            provisional={true}
          />
        )}
        <EndpointRow
          label="Landed"
          slot={answer.landed}
          baseline={answer.baseline}
          provisional={false}
        />
      </tbody>
    </table>
  );
}

export function IntentCiComparison({
  story,
  reading,
}: {
  readonly story: string;
  readonly reading: ComparisonReading;
}) {
  if (reading.reading && reading.shown === undefined) {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-reading" role="status">
          Reading CI comparison…
        </p>
      </section>
    );
  }
  if (reading.failed !== undefined && reading.shown === undefined) {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{reading.failed}</p>
      </section>
    );
  }
  const answer = reading.shown;
  if (answer === undefined) return null;
  if (answer.kind === "unavailable") {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{answer.explanation}</p>
      </section>
    );
  }
  return (
    <section className="intent-ci-status" aria-label="CI timing comparison">
      <h3>CI timing changes for {story}</h3>
      <p className="intent-ci-comparison-framing">({observedNotAttributed})</p>
      <ComparisonBody answer={answer} />
      <EntryComparison />
    </section>
  );
}
