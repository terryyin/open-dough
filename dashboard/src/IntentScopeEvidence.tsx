// Summary and file Proof read the named attempt, comparison endpoints, or
// gap already held by IntentCiEvidence. A previously retrieved judgment
// retains its checked time and any refresh failure.

import type { ReactNode } from "react";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import {
  selectedComparisonOf,
  type SelectedComparisonEvidence,
} from "./intentCiEvidenceModel.ts";
import type { SelectedComparisonEndpointProofs } from "./ciComparisonProofs.ts";
import type { SelectedCiComparisonAnswer } from "./selectedCiComparison.ts";
import { previouslyRetrievedAt } from "./IntentCiJudgedBranch.tsx";
import type { ShownCiProofRun } from "./shownCiProofRun.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import type { ComparisonEndpointProofs } from "./useIntentCiComparisonEntries.ts";
import { unreadReason } from "./useIntentCiJudgment.ts";
import {
  shownProofStateOf,
  type ShownProofState,
} from "./useIntentCiShownProof.ts";

// The shown judgment's freshness when it is not newly verified: when it was
// previously retrieved, and a failed refresh beside it.
export type KeptEvidence = {
  readonly checkedAt: string;
  readonly refreshFailed: string | undefined;
};

// What the Summary can say from the evidence: a summary of a named attempt,
// a selected story's comparison with its endpoint proofs, or why there is
// none (`checking` while it is still being read).
export type ScopeEvidence = (
  | {
      readonly kind: "summary";
      readonly summary: Extract<
        ShownProofState,
        { kind: "summary" }
      >["summary"];
      readonly run: ShownCiProofRun;
      readonly branch: string;
      readonly story: string | undefined;
      readonly ancestor: boolean;
    }
  | {
      readonly kind: "comparison";
      readonly story: string;
      readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
      readonly proofs: ComparisonEndpointProofs;
    }
  | {
      readonly kind: "selection";
      readonly story: string;
      readonly answer: Extract<
        SelectedCiComparisonAnswer,
        { kind: "selection" }
      >;
      readonly proofs: SelectedComparisonEndpointProofs;
    }
  | {
      readonly kind: "none";
      readonly checking: boolean;
      readonly line: ReactNode;
      // A size-limit failure, so Summary can reuse evidence-problem styling.
      readonly problem?: true;
    }
) & { readonly kept?: KeptEvidence };

function comparisonFrom(
  story: string,
  comparison: ComparisonReading,
  endpointProofs: ComparisonEndpointProofs | undefined,
): ScopeEvidence {
  if (comparison.reading && comparison.shown === undefined)
    return {
      kind: "none",
      checking: true,
      line: "Reading CI comparison…",
    };
  if (comparison.failed !== undefined && comparison.shown === undefined)
    return { kind: "none", checking: false, line: comparison.failed };
  if (comparison.shown?.kind === "unavailable")
    return {
      kind: "none",
      checking: false,
      line: comparison.shown.explanation,
    };
  if (comparison.shown?.kind !== "comparison" || endpointProofs === undefined)
    return {
      kind: "none",
      checking: true,
      line: "Reading CI comparison…",
    };
  return {
    kind: "comparison",
    story,
    answer: comparison.shown,
    proofs: endpointProofs,
  };
}

export type ScopeComparisonEvidence = Extract<
  ScopeEvidence,
  { kind: "comparison" | "selection" }
>;

function selectionFrom(
  { comparison, endpointProofs }: SelectedComparisonEvidence,
  story: string | undefined,
): ScopeEvidence {
  const answer = comparison.shown;
  if (answer?.kind === "selection" && endpointProofs !== undefined) {
    return {
      kind: "selection",
      story: story ?? answer.identity,
      answer,
      proofs: endpointProofs,
    };
  }
  const reason =
    comparison.failed ??
    (answer?.kind === "unavailable" ? answer.explanation : undefined);
  return {
    kind: "none",
    checking: reason === undefined,
    line: reason ?? "Reading CI comparison…",
  };
}

export function scopeEvidenceOf(evidence: CiEvidence): ScopeEvidence {
  const selection = selectedComparisonOf(evidence);
  if (selection !== undefined) {
    const story =
      evidence.kind === "judged"
        ? (evidence.comparisonStory ?? evidence.story)
        : evidence.kind === "comparison"
          ? evidence.story
          : undefined;
    return selectionFrom(selection, story);
  }
  if (evidence.kind === "inactive")
    return { kind: "none", checking: true, line: "Checking the CI…" };
  if (evidence.kind === "retained") {
    const original = evidence.reading?.original;
    if (
      original?.proof?.kind !== "summary" ||
      original.runId === undefined ||
      original.runAttempt === undefined
    )
      return {
        kind: "none",
        checking:
          evidence.reading === undefined && evidence.problem === undefined,
        line:
          evidence.problem ??
          original?.completeness ??
          "Reading retained original proof…",
      };
    return {
      kind: "summary",
      summary: original.proof.summary,
      run: {
        runId: original.runId,
        runAttempt: original.runAttempt,
        revision: original.revision,
        runUrl: original.runUrl,
      },
      branch: evidence.source.ref,
      story: undefined,
      ancestor: false,
    };
  }
  if (evidence.kind === "gap")
    return { kind: "none", checking: false, line: evidence.why };
  if (evidence.kind === "comparison")
    return comparisonFrom(
      evidence.story,
      evidence.comparison,
      evidence.endpointProofs,
    );
  // Taken Story Branch: prefer the provisional comparison for the Summary
  // when the story is selected, matching the homepage's comparison columns.
  if (
    evidence.comparison !== undefined &&
    evidence.comparisonStory !== undefined
  ) {
    const compared = comparisonFrom(
      evidence.comparisonStory,
      evidence.comparison,
      evidence.endpointProofs,
    );
    if (compared.kind === "comparison") return compared;
    if (compared.kind === "none" && compared.checking) return compared;
    // Unavailable comparison beside judgment falls through to live proof.
  }
  const { branch, story, judged, proof } = evidence;
  const { shown } = judged;
  const checkedAt = previouslyRetrievedAt(judged);
  const kept =
    checkedAt === undefined
      ? {}
      : { kept: { checkedAt, refreshFailed: judged.refreshFailed } };
  if (shown === undefined)
    return {
      kind: "none",
      checking: true,
      line: <>Checking the CI of {branch}…</>,
    };
  if (shown.state === "unread")
    return {
      kind: "none",
      checking: false,
      line: shown.reason ?? unreadReason,
      ...kept,
    };
  if (proof === undefined)
    return {
      kind: "none",
      checking: false,
      line: `The branch ${branch} is no longer published, so it has no CI status.`,
      ...kept,
    };
  const state = shownProofStateOf(shown, proof);
  if (state.kind !== "summary")
    return {
      kind: "none",
      checking: state.kind === "checking",
      line: state.line,
      ...(state.kind === "unavailable" && state.problem === true
        ? { problem: true as const }
        : {}),
      ...kept,
    };
  return {
    kind: "summary",
    summary: state.summary,
    run: state.run,
    branch,
    story,
    ancestor: shown.state === "running",
    ...kept,
  };
}
