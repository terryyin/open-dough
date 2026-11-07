// One Intent CI timing comparison endpoint row: requested-revision status
// beside the selected build identity, wall time, and CI time without runner
// waits (`./IntentCiComparison.tsx`).
import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";
import {
  requestedStatusOrExplanation,
  requestedStatusPrefix,
  selectionWords,
  timeWithoutRunnerWaitsWords,
  wallTimeWords,
} from "./storyCiComparisonWording.ts";

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

export function EndpointRow({
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
