// One Intent CI timing comparison endpoint row: requested-revision status
// beside the selected build identity, plus wall time and its difference from
// Baseline (`./IntentCiComparison.tsx`).
import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";
import {
  requestedStatusOrExplanation,
  requestedStatusPrefix,
  selectionWords,
  wallTimeDifferenceWords,
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
