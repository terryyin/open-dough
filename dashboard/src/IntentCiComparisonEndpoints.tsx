// Endpoint table for Intent's story CI timing comparison
// (`./IntentCiComparison.tsx`): each endpoint's requested-revision status
// beside a compact Build source cue (exact / ancestor icon with accessible
// words, or concise equivalent / later words), and its measured CI wall time
// and CI time without runner waits. The active comparison's changes are the
// summary's (`./IntentCiComparison.tsx`).

import type { ReactNode } from "react";
import { GitCommitHorizontal, History, type LucideIcon } from "lucide-react";
import { shortSha } from "./baseCiWording.ts";
import { Icon } from "./Icon.tsx";
import {
  requestedStatusOrExplanation,
  requestedStatusPrefix,
} from "./storyCiComparisonSlotWords.ts";
import {
  selectionWords,
  timeWithoutRunnerWaitsWords,
  wallTimeWords,
} from "./storyCiComparisonWording.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";

function exceptionalRequestedStatusPrefix(
  slot: Pick<StoryCiComparisonSlot, "requestedStatus">,
): string {
  // Routine Skipped stays out of the default Build cell; Cancelled and No
  // build keep their short visible explanation.
  if (slot.requestedStatus?.kind === "skipped") return "";
  return requestedStatusPrefix(slot);
}

function selectionSourceIcon(
  selection: Extract<
    StoryCiComparisonSlot,
    { kind: "build" | "running" }
  >["selection"],
): LucideIcon | undefined {
  switch (selection) {
    case "exact":
      return GitCommitHorizontal;
    case "ancestor":
      return History;
    case "equivalent":
    case "later":
      return undefined;
  }
}

function BuildSourceCue({
  slot,
  provisional,
}: {
  readonly slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>;
  readonly provisional: boolean;
}): ReactNode {
  const words = selectionWords(slot, provisional);
  const glyph = selectionSourceIcon(slot.selection);
  if (glyph === undefined) {
    return <span className="intent-ci-comparison-source-words">{words}</span>;
  }
  return (
    <span
      className="intent-ci-comparison-source"
      data-selection={slot.selection}
      title={words}
    >
      <Icon icon={glyph} />
      <span className="visually-hidden">{words}</span>
    </span>
  );
}

function BuildIdentity({
  slot,
  provisional,
}: {
  readonly slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>;
  readonly provisional: boolean;
}): ReactNode {
  const failed =
    slot.kind === "build" && slot.state === "failed" ? " failed build" : "";
  return (
    <>
      <code>{shortSha(slot.revision)}</code>{" "}
      <BuildSourceCue slot={slot} provisional={provisional} />
      {failed}
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
        {exceptionalRequestedStatusPrefix(slot)}
        <BuildIdentity slot={slot} provisional={provisional} />
      </>
    );
  }
  return requestedStatusOrExplanation(slot);
}

function EndpointRow({
  label,
  slot,
  provisional,
}: {
  readonly label: string;
  readonly slot: StoryCiComparisonSlot;
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
        {timeWithoutRunnerWaitsWords(slot)}
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
    <div className="intent-ci-comparison-box">
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
          <EndpointRow label="Baseline" slot={baseline} provisional={false} />
          <EndpointRow
            label="Branch"
            slot={branch}
            provisional={branchProvisional}
          />
          {provisional !== undefined && (
            <EndpointRow
              label="Provisional"
              slot={provisional}
              provisional={true}
            />
          )}
          <EndpointRow label="Landed" slot={landed} provisional={false} />
        </tbody>
      </table>
    </div>
  );
}
