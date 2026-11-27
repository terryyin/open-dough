// Proof summaries of a story's comparison endpoints
// (`./useIntentCiComparison.ts`), each read through `./authenticatedIntentCiProofRead.ts`
// with the build's full revision. A late answer for another story or attempt
// never becomes the shown proof. Each proof is read again when a Check again
// read of the comparison answers (`checkedAgain`); valid summaries are
// remembered on the server, so only the others ask GitHub again. Intent's one
// CI evidence owner
// (`./IntentCiEvidence.tsx`) holds these proofs so the homepage entry rows
// (`./IntentCiEntryComparison.tsx`) and a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) share them; selecting, drilling and returning
// home ask CI nothing again.

import { useEffect, useState, useSyncExternalStore } from "react";
import type { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import {
  createCiComparisonProofs,
  createSelectedCiComparisonProofs,
} from "./ciComparisonProofs.ts";
import type { SelectedComparisonEvidence } from "./intentCiEvidenceModel.ts";
import { useIntentCiReads } from "./pageReads.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { CiComparisonRange } from "./selectedCiComparison.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import {
  comparisonAfterSideOf,
  type ComparisonAfterSide,
} from "./ciScopeComparisonCues.ts";
import {
  comparisonEntriesOf,
  type ComparisonEndpointProofs,
  type ComparisonEntries,
} from "./storyCiComparisonEntries.ts";
import { activeComparisonOf } from "./storyCiComparisonWording.ts";
import { useSelectedIntentCiComparison } from "./useIntentCiComparison.ts";

export type { ComparisonEndpointProofs };

// React owns attachment; the disposable owner owns attempt and retry-round reads.
export function useIntentCiComparisonEndpointProofs(
  source: PublishedSource,
  answer: StoryCiComparisonAnswer | undefined,
  checkedAgain: number,
): ComparisonEndpointProofs | undefined {
  return useEndpointProofs(
    createCiComparisonProofs,
    source,
    answer,
    checkedAgain,
  );
}

export function useSelectedComparisonEvidence(
  source: PublishedSource,
  identity: string | undefined,
  range: CiComparisonRange | undefined,
  // Why the selection has no range; it measures nothing and reads nothing.
  gap?: string,
): SelectedComparisonEvidence | undefined {
  const comparison = useSelectedIntentCiComparison(source, identity, range);
  const endpointProofs = useEndpointProofs(
    createSelectedCiComparisonProofs,
    source,
    comparison.shown,
    comparison.checkedAgain,
  );
  if (identity === undefined) return undefined;
  if (range !== undefined)
    return { kind: "measured", comparison, endpointProofs };
  return gap === undefined
    ? undefined
    : { kind: "unmeasured", explanation: gap };
}

function useEndpointProofs<Answer, Proofs>(
  create: (readProof: typeof readIntentCiProof) => {
    readonly subscribe: (listener: () => void) => () => void;
    readonly getSnapshot: () => number;
    readonly dispose: () => void;
    readonly select: (
      source: PublishedSource,
      answer: Answer | undefined,
      round: number,
    ) => unknown;
    readonly proofsFor: (
      source: PublishedSource,
      answer: Answer | undefined,
      round: number,
    ) => Proofs | undefined;
  },
  source: PublishedSource,
  answer: Answer | undefined,
  checkedAgain: number,
): Proofs | undefined {
  const { readProof } = useIntentCiReads();
  const [owner] = useState(() => create(readProof));
  useSyncExternalStore(owner.subscribe, owner.getSnapshot, owner.getSnapshot);
  useEffect(
    () => () => {
      owner.dispose();
    },
    [owner],
  );
  useEffect(() => {
    void owner.select(source, answer, checkedAgain);
  }, [owner, source, answer, checkedAgain]);
  return owner.proofsFor(source, answer, checkedAgain);
}

export function comparisonEntriesFromProofs(
  proofs: ComparisonEndpointProofs,
  afterSide: ComparisonAfterSide = "landed",
): ComparisonEntries {
  return comparisonEntriesOf(
    proofs.baseline,
    proofs.branch,
    proofs.landed,
    afterSide,
  );
}

// After endpoint the active comparison uses for cues (Landed with proof,
// otherwise Branch / Provisional).
export function activeComparisonAfterSideOf(
  answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>,
  proofs: ComparisonEndpointProofs,
): ComparisonAfterSide {
  return comparisonAfterSideOf(activeComparisonOf(answer, proofs).endpoint);
}
