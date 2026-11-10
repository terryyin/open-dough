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
import { createCiComparisonProofs } from "./ciComparisonProofs.ts";
import type { PublishedSource } from "./publishedSource.ts";
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

export type { ComparisonEndpointProofs };

// React owns attachment; the disposable owner owns attempt and retry-round reads.
export function useIntentCiComparisonEndpointProofs(
  source: PublishedSource,
  answer: StoryCiComparisonAnswer | undefined,
  checkedAgain: number,
): ComparisonEndpointProofs | undefined {
  const [owner] = useState(createCiComparisonProofs);
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
