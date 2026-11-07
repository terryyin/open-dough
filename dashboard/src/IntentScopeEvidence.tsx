// The CI evidence a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) or a selected file's Proof
// (`./IntentFileProof.tsx`) names, from Intent's one CI evidence owner
// (`./IntentCiEvidence.tsx`): the summary of a named attempt -- the attempt,
// its revision, the judged branch and whether it is a running result's
// completed ancestor -- or a selected story's CI comparison endpoints with
// each endpoint's proof summary already held by the owner -- or the one line
// saying why there is none, as the homepage says it
// (`./useIntentCiShownProof.ts`). Either way, a judgment previously
// retrieved, not newly verified, and a failed refresh beside it are kept
// (`./IntentCiJudgedBranch.tsx`). Its labels: `./IntentScopeEvidenceLabels.tsx`.

import type { ReactNode } from "react";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
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
      readonly kind: "none";
      readonly checking: boolean;
      readonly line: ReactNode;
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

export function scopeEvidenceOf(evidence: CiEvidence): ScopeEvidence {
  if (evidence.kind === "inactive")
    return { kind: "none", checking: true, line: "Checking the CI…" };
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
