// The owner of Intent's CI evidence, one for Project Intent and one for the
// selected story (`./IntentPerspective.tsx`): which branch is judged
// (`./intentCiTarget.ts`), its judgment as
// `./authenticatedIntentCiStatusRead.ts` answers it, and the CI proof of the
// attempt that judgment shows (`./shownCiProofRun.ts`,
// `./authenticatedIntentCiProofRead.ts`); or a selected done / Taken Trunk Mode
// story's CI comparison (`./useIntentCiComparison.ts`) with each endpoint's
// proof summary (`./useIntentCiComparisonEntries.ts`); or a Taken Story Branch
// story's live judgment plus provisional comparison. Beside the trunk's
// judgment it reads the project's collected CI wall time history
// (`./useIntentCiHistory.ts`) with each read of that judgment. Intent's CI
// status homepage (`./IntentCiStatus.tsx`), a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`), and a selected file's Proof
// (`./IntentFileProof.tsx`) all read it, so selecting, drilling and returning
// home ask CI nothing again. The judgment (`./useIntentCiJudgment.ts`) is read
// again when the judged branch changes, when the page's revision check finds
// the judged branch at a new head (the head `./intentCiTarget.ts` gives), and
// on Check again, and its proof (`./useIntentCiShownProof.ts`) with each
// judgment; nothing is read while it is not active. A done-story comparison is
// read on each selection and on its Check again, which also reads its endpoint
// proofs again, and is remembered once final; a Taken comparison re-reads when
// the observed tip moves. A Done comparison also carries the published
// result endpoint that its historical source owner established, separately
// from the comparison's measured CI revision.

import { createContext, useContext, type ReactNode } from "react";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
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
  useIntentCiHistory,
  type HistoryReading,
} from "./useIntentCiHistory.ts";
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
      readonly phase: "done" | "taken";
      readonly source: PublishedSource;
      readonly story: string;
      readonly identity: string;
      readonly comparison: ComparisonReading;
      readonly endpointProofs: ComparisonEndpointProofs | undefined;
      readonly doneEndpoint?: ScopeHistoryEndpoint;
    }
  | {
      readonly kind: "judged";
      readonly source: PublishedSource;
      readonly branch: string;
      readonly story: string | undefined;
      readonly judged: JudgedReading;
      readonly proof: ShownProof | undefined;
      // The trunk's: its collected CI wall time history.
      readonly history?: HistoryReading;
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
  doneEndpoint,
  children,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // The page's selected story, if any.
  readonly selectedIdentity: string | undefined;
  // Whether anything Intent shows reads CI now.
  readonly active: boolean;
  readonly doneEndpoint?: ScopeHistoryEndpoint;
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
  const history = useIntentCiHistory(
    source,
    target.kind === "judged" && target.story === undefined
      ? judged.round
      : undefined,
  );
  const comparison = useIntentCiComparison(
    source,
    comparisonIdentity,
    comparisonIdentity === undefined ? undefined : comparisonHead,
  );
  const endpointProofs = useIntentCiComparisonEndpointProofs(
    source,
    comparison.shown,
    comparison.checkedAgain,
  );
  let evidence: CiEvidence = { kind: "inactive" };
  if (active && target.kind === "gap") evidence = target;
  else if (active && target.kind === "comparison")
    evidence = {
      kind: "comparison",
      phase: target.phase,
      source,
      story: target.story,
      identity: target.identity,
      comparison,
      endpointProofs,
      ...(target.phase === "done" && doneEndpoint !== undefined
        ? { doneEndpoint }
        : {}),
    };
  else if (judgedBranch !== undefined && target.kind === "judged")
    evidence = {
      kind: "judged",
      source,
      branch: judgedBranch,
      story: target.story,
      judged,
      proof,
      ...(history === undefined ? {} : { history }),
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
