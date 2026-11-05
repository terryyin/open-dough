// The one owner of Intent's CI evidence (`./IntentPerspective.tsx`): which
// branch is judged (`./intentCiTarget.ts`), its judgment as
// `./authenticatedIntentCiStatusRead.ts` answers it, and the CI proof of the
// attempt that judgment shows (`./shownCiProofRun.ts`,
// `./authenticatedIntentCiProofRead.ts`). Intent's CI status homepage
// (`./IntentCiStatus.tsx`) and a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) both read it, so selecting, drilling and
// returning home ask CI nothing again. The judgment
// (`./useIntentCiJudgment.ts`) is read again when the judged branch changes,
// when the page's revision check finds the judged branch at a new head (the
// head `./intentCiTarget.ts` gives), and on Check again, and its proof
// (`./useIntentCiShownProof.ts`) with each judgment; nothing is read while
// it is not active.

import { createContext, useContext, type ReactNode } from "react";
import { ciTargetOf, type CiTarget } from "./intentCiTarget.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
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
      readonly kind: "judged";
      readonly branch: string;
      readonly story: string | undefined;
      readonly judged: JudgedReading;
      readonly proof: ShownProof | undefined;
    };

const CiEvidenceContext = createContext<CiEvidence>({ kind: "inactive" });

export const useIntentCiEvidence = (): CiEvidence =>
  useContext(CiEvidenceContext);

// The judged branch's reading and its shown proof, read only while ACTIVE.
// One element type whatever the target, so a changed target never remounts
// what it wraps.
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
  const judged = useIntentCiJudgment(
    source,
    judgedBranch,
    target.kind === "judged" ? target.head : undefined,
  );
  const proof = useIntentCiShownProof(source, judged.shown);
  let evidence: CiEvidence = { kind: "inactive" };
  if (active && target.kind === "gap") evidence = target;
  else if (judgedBranch !== undefined && target.kind === "judged")
    evidence = {
      kind: "judged",
      branch: judgedBranch,
      story: target.story,
      judged,
      proof,
    };
  return (
    <CiEvidenceContext.Provider value={evidence}>
      {children}
    </CiEvidenceContext.Provider>
  );
}
