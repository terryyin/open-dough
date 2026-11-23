// Endpoint table for Intent's story CI timing comparison
// (`./IntentCiComparison.tsx`): each endpoint's requested-revision status
// beside a compact Build source cue (exact / ancestor icon with accessible
// words, or concise equivalent / later words), and its measured CI wall time
// and CI time without runner waits. The active comparison's changes are the
// summary's (`./IntentCiComparison.tsx`).

import type { ReactNode } from "react";
import { GitCommitHorizontal, History, type LucideIcon } from "lucide-react";
import { shortSha } from "./baseCiWording.ts";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
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
  showRun,
  showSource = true,
}: {
  readonly slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>;
  readonly provisional: boolean;
  readonly showRun: boolean;
  readonly showSource?: boolean;
}): ReactNode {
  const failed =
    slot.kind === "build" && slot.state === "failed" ? " failed build" : "";
  const runId =
    slot.adapterAttempt?.runId ??
    (slot.runAttempt === undefined ? slot.runId : undefined);
  return (
    <>
      <code>{shortSha(slot.revision)}</code>{" "}
      {showSource && <BuildSourceCue slot={slot} provisional={provisional} />}
      {failed}
      {showRun && (
        <>
          {runId !== undefined && ` · Run ${String(runId)}`}
          <HistoryRunAttempt run={slot} />
        </>
      )}
    </>
  );
}

function EndpointIdentity({
  slot,
  provisional,
  showRun,
}: {
  readonly slot: StoryCiComparisonSlot;
  readonly provisional: boolean;
  readonly showRun: boolean;
}) {
  if (slot.kind === "build" || slot.kind === "running") {
    return (
      <>
        {exceptionalRequestedStatusPrefix(slot)}
        <BuildIdentity
          slot={slot}
          provisional={provisional}
          showRun={showRun}
        />
      </>
    );
  }
  return requestedStatusOrExplanation(slot);
}

export function SelectedBuildIdentity({
  slot,
  showSource = true,
}: {
  readonly slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>;
  readonly showSource?: boolean;
}) {
  return (
    <BuildIdentity
      slot={slot}
      provisional={false}
      showRun
      showSource={showSource}
    />
  );
}

function EndpointRow({
  label,
  slot,
  provisional = false,
  showRun = false,
}: {
  readonly label: string;
  readonly slot: StoryCiComparisonSlot;
  readonly provisional?: boolean;
  readonly showRun?: boolean;
}) {
  const wall = wallTimeWords(slot);
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="intent-ci-comparison-identity">
        <EndpointIdentity
          slot={slot}
          provisional={provisional}
          showRun={showRun}
        />
      </td>
      <td className="intent-ci-comparison-wall">{wall ?? "—"}</td>
      <td className="intent-ci-comparison-without-waits">
        {timeWithoutRunnerWaitsWords(slot)}
      </td>
    </tr>
  );
}

function EndpointsTable({
  caption,
  children,
}: {
  readonly caption: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="intent-ci-comparison-box">
      <table className="intent-ci-comparison">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Endpoint</th>
            <th scope="col">Build</th>
            <th scope="col">CI wall time</th>
            <th scope="col">CI time without runner waits</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
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
    <EndpointsTable caption="Baseline, branch and landed CI builds with timing">
      <EndpointRow label="Baseline" slot={baseline} />
      <EndpointRow
        label="Branch"
        slot={branch}
        provisional={branchProvisional}
      />
      {provisional !== undefined && (
        <EndpointRow label="Provisional" slot={provisional} provisional />
      )}
      <EndpointRow label="Landed" slot={landed} />
    </EndpointsTable>
  );
}

export function SelectedComparisonEndpointsTable({
  baseline,
  selection,
}: {
  readonly baseline: StoryCiComparisonSlot;
  readonly selection: StoryCiComparisonSlot;
}) {
  return (
    <EndpointsTable caption="Baseline and selection CI builds with timing">
      <EndpointRow label="Baseline" slot={baseline} showRun />
      <EndpointRow label="Selection" slot={selection} showRun />
    </EndpointsTable>
  );
}
