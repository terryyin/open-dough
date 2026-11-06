// The one owner of Intent's CI evidence (`./IntentPerspective.tsx`): which
// branch is judged (`./intentCiTarget.ts`), its judgment as
// `./authenticatedIntentCiStatusRead.ts` answers it, and the CI proof of the
// attempt that judgment shows (`./shownCiProofRun.ts`,
// `./authenticatedIntentCiProofRead.ts`); or a selected done / Taken Trunk
// Mode story's CI comparison (`./useIntentCiComparison.ts`) with each
// endpoint's proof summary (`./useIntentCiComparisonEntries.ts`); or a Taken
// Story Branch story's live judgment plus provisional comparison. Intent's CI
// status homepage (`./IntentCiStatus.tsx`), a selected entry's or folder's
// Summary (`./IntentScopeProof.tsx`), and a selected file's compact comparison
// (`./IntentFileComparison.tsx`) all read it, so selecting, drilling and
// returning home ask CI nothing again. The judgment
// (`./useIntentCiJudgment.ts`) is read again when the judged branch changes,
// when the page's revision check finds the judged branch at a new head (the
// head `./intentCiTarget.ts` gives), and on Check again, and its proof
// (`./useIntentCiShownProof.ts`) with each judgment; nothing is read while
// it is not active. A done-story comparison is read once and remembered; a
// Taken comparison re-reads when the observed tip moves.

import { createContext, useContext, type ReactNode } from "react";
import { ciTargetOf, type CiTarget } from "./intentCiTarget.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  useIntentCiComparison,
  type ComparisonReading,
} from "./useIntentCiComparison.ts";
import {
  useIntentCiComparisonEndpointProofs,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";
import {
  useIntentCiJudgment,
  type JudgedReading,
} from "./useIntentCiJudgment.ts";
import {
  useIntentCiShownProof,
  type ShownProof,
} from "./useIntentCiShownProof.ts";

export type CiEvidence =
  // Nothing here reads CI (no owner, or not active).
  | { readonly kind: "inactive" }
  | Extract<CiTarget, { kind: "gap" }>
  | {
      readonly kind: "comparison";
      readonly source: PublishedSource;
      readonly story: string;
      readonly identity: string;
      readonly comparison: ComparisonReading;
      readonly endpointProofs: ComparisonEndpointProofs | undefined;
    }
  | {
      readonly kind: "judged";
      readonly source: PublishedSource;
      readonly branch: string;
      readonly story: string | undefined;
      readonly judged: JudgedReading;
      readonly proof: ShownProof | undefined;
      // Taken Story Branch: provisional comparison beside the live judgment.
      readonly comparison?: ComparisonReading;
      readonly comparisonStory?: string;
      readonly endpointProofs?: ComparisonEndpointProofs;
    };

const CiEvidenceContext = createContext<CiEvidence>({ kind: "inactive" });

export const useIntentCiEvidence = (): CiEvidence =>
  useContext(CiEvidenceContext);

// The judged branch's reading and its shown proof, or a done / Taken story's
// comparison and each endpoint's proof summary, read only while ACTIVE. One
// element type whatever the target, so a changed target never remounts what
// it wraps.
export function IntentCiEvidenceProvider({
  source,
  work,
  selectedIdentity,
  active,
  children,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // The page's selected story, if any.
  readonly selectedIdentity: string | undefined;
  // Whether anything Intent shows reads CI now.
  readonly active: boolean;
  readonly children: ReactNode;
}) {
  const target = ciTargetOf(source, work, selectedIdentity);
  const judgedBranch =
    active && target.kind === "judged" ? target.branch : undefined;
  const comparisonIdentity =
    active && target.kind === "comparison"
      ? target.identity
      : active && target.kind === "judged"
        ? target.comparisonIdentity
        : undefined;
  const comparisonHead =
    target.kind === "comparison"
      ? target.head
      : target.kind === "judged"
        ? target.head
        : undefined;
  const judged = useIntentCiJudgment(
    source,
    judgedBranch,
    target.kind === "judged" ? target.head : undefined,
  );
  const proof = useIntentCiShownProof(source, judged.shown);
  const comparison = useIntentCiComparison(
    source,
    comparisonIdentity,
    comparisonIdentity === undefined ? undefined : comparisonHead,
  );
  const endpointProofs = useIntentCiComparisonEndpointProofs(
    source,
    comparison.shown,
  );
  let evidence: CiEvidence = { kind: "inactive" };
  if (active && target.kind === "gap") evidence = target;
  else if (active && target.kind === "comparison")
    evidence = {
      kind: "comparison",
      source,
      story: target.story,
      identity: target.identity,
      comparison,
      endpointProofs,
    };
  else if (judgedBranch !== undefined && target.kind === "judged")
    evidence = {
      kind: "judged",
      source,
      branch: judgedBranch,
      story: target.story,
      judged,
      proof,
      ...(target.comparisonIdentity === undefined
        ? {}
        : {
            comparison,
            comparisonStory: target.story ?? target.comparisonIdentity,
            ...(endpointProofs === undefined ? {} : { endpointProofs }),
          }),
    };
  return (
    <CiEvidenceContext.Provider value={evidence}>
      {children}
    </CiEvidenceContext.Provider>
  );
}
