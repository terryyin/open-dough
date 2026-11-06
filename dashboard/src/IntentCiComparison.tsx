// A selected done story's CI timing comparison on Intent's homepage
// (`./IntentCiStatus.tsx`): names the baseline, branch and landed builds with
// each selection rule and a run link where available (as CI judgment/proof
// do), shows CI wall time with signed whole-second differences, and states
// that entry comparison is not yet shown.

import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import {
  entryComparisonNotYetShown,
  observedNotAttributed,
  selectionWords,
  wallTimeDifferenceWords,
  wallTimeWords,
} from "./storyCiComparisonWording.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";

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
}: {
  readonly slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>;
}): ReactNode {
  const runName =
    slot.runId !== undefined && slot.runAttempt !== undefined
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
      <LinkedRun name={runName} url={slot.runUrl} />
      {` · ${state} · ${selectionWords(slot)}${failed}`}
    </>
  );
}

function EndpointIdentity({ slot }: { readonly slot: StoryCiComparisonSlot }) {
  if (slot.kind === "build" || slot.kind === "running")
    return <BuildIdentity slot={slot} />;
  return slot.explanation;
}

function EndpointRow({
  label,
  slot,
  baseline,
}: {
  readonly label: string;
  readonly slot: StoryCiComparisonSlot;
  readonly baseline: StoryCiComparisonSlot;
}) {
  const wall = wallTimeWords(slot);
  const diff =
    label === "Baseline" ? undefined : wallTimeDifferenceWords(baseline, slot);
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="intent-ci-comparison-identity">
        <EndpointIdentity slot={slot} />
      </td>
      <td className="intent-ci-comparison-wall">
        {wall ?? "—"}
        {diff !== undefined ? ` ${diff}` : ""}
      </td>
    </tr>
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
      <section className="intent-ci-status" aria-label="CI status">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-reading" role="status">
          Reading CI comparison…
        </p>
      </section>
    );
  }
  if (reading.failed !== undefined && reading.shown === undefined) {
    return (
      <section className="intent-ci-status" aria-label="CI status">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{reading.failed}</p>
      </section>
    );
  }
  const answer = reading.shown;
  if (answer === undefined) return null;
  if (answer.kind === "unavailable") {
    return (
      <section className="intent-ci-status" aria-label="CI status">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{answer.explanation}</p>
      </section>
    );
  }
  return (
    <section className="intent-ci-status" aria-label="CI status">
      <h3>CI timing changes for {story}</h3>
      <p className="intent-ci-comparison-framing">({observedNotAttributed})</p>
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
          />
          <EndpointRow
            label="Branch"
            slot={answer.branch}
            baseline={answer.baseline}
          />
          <EndpointRow
            label="Landed"
            slot={answer.landed}
            baseline={answer.baseline}
          />
        </tbody>
      </table>
      <p className="intent-ci-comparison-entries">
        {entryComparisonNotYetShown}
      </p>
    </section>
  );
}
