// Endpoint table for Intent's story CI timing comparison
// (`./IntentCiComparison.tsx`): each endpoint's requested-revision status
// beside build identity (revision, run, state, exact / ancestor / equivalent
// selection), CI wall time, and CI time without runner waits with a signed
// difference against Baseline.

import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import {
  requestedStatusOrExplanation,
  requestedStatusPrefix,
  selectionWords,
  timeWithoutRunnerWaitsWords,
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
  if (slot.kind === "build" || slot.kind === "running") {
    return (
      <>
        {requestedStatusPrefix(slot)}
        <BuildIdentity slot={slot} provisional={provisional} />
      </>
    );
  }
  return requestedStatusOrExplanation(slot);
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
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="intent-ci-comparison-identity">
        <EndpointIdentity slot={slot} provisional={provisional} />
      </td>
      <td className="intent-ci-comparison-wall">{wall ?? "—"}</td>
      <td className="intent-ci-comparison-without-waits">
        {timeWithoutRunnerWaitsWords(
          slot,
          label === "Baseline" ? undefined : baseline,
        )}
      </td>
    </tr>
  );
}

export function ComparisonEndpointsTable({
  baseline,
  branch,
  provisional,
  landed,
  branchProvisional,
}: {
  readonly baseline: StoryCiComparisonSlot;
  readonly branch: StoryCiComparisonSlot;
  readonly provisional: StoryCiComparisonSlot | undefined;
  readonly landed: StoryCiComparisonSlot;
  readonly branchProvisional: boolean;
}) {
  return (
    <table className="intent-ci-comparison">
      <caption className="visually-hidden">
        Baseline, branch and landed CI builds with timing
      </caption>
      <thead>
        <tr>
          <th scope="col">Endpoint</th>
          <th scope="col">Build</th>
          <th scope="col">CI wall time</th>
          <th scope="col">CI time without runner waits</th>
        </tr>
      </thead>
      <tbody>
        <EndpointRow
          label="Baseline"
          slot={baseline}
          baseline={baseline}
          provisional={false}
        />
        <EndpointRow
          label="Branch"
          slot={branch}
          baseline={baseline}
          provisional={branchProvisional}
        />
        {provisional !== undefined && (
          <EndpointRow
            label="Provisional"
            slot={provisional}
            baseline={baseline}
            provisional={true}
          />
        )}
        <EndpointRow
          label="Landed"
          slot={landed}
          baseline={baseline}
          provisional={false}
        />
      </tbody>
    </table>
  );
}
