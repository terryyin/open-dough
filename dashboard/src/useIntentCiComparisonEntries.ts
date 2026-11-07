// Proof summaries of a done story's comparison endpoints
// (`./useIntentCiComparison.ts`), each read through `./authenticatedIntentCiProofRead.ts`
// with the build's full revision. A late answer for another story or attempt
// never becomes the shown proof. Intent's one CI evidence owner
// (`./IntentCiEvidence.tsx`) holds these proofs so the homepage entry rows
// (`./IntentCiComparison.tsx`) and a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) share them; selecting, drilling and returning
// home ask CI nothing again.

import { useEffect, useState } from "react";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import type { CiProof, CiProofRun } from "./ciProof.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type {
  StoryCiComparisonAnswer,
  StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import {
  comparisonAfterSideOf,
  type ComparisonAfterSide,
} from "./ciScopeComparisonCues.ts";
import {
  comparisonEntriesOf,
  comparisonProofOf,
  type ComparisonEndpointProofs,
  type ComparisonEntries,
} from "./storyCiComparisonEntries.ts";
import { activeComparisonOf } from "./storyCiComparisonWording.ts";

export type { ComparisonEndpointProofs };

type SlotProof = {
  readonly proof: CiProof | undefined;
  readonly reading: boolean;
};

function buildSubject(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" }>,
): CiProofRun | undefined {
  if (slot.runId === undefined || slot.runAttempt === undefined)
    return undefined;
  return {
    runId: slot.runId,
    runAttempt: slot.runAttempt,
    revision: slot.revision,
  };
}

function slotKey(
  identity: string,
  role: string,
  slot: StoryCiComparisonSlot,
): string | undefined {
  if (slot.kind !== "build") return `${identity}|${role}|${slot.kind}`;
  const subject = buildSubject(slot);
  if (subject === undefined) return `${identity}|${role}|no-run`;
  return `${identity}|${role}|${String(subject.runId)}|${String(subject.runAttempt)}|${subject.revision}`;
}

function useSlotProof(
  source: PublishedSource,
  identity: string | undefined,
  role: string,
  slot: StoryCiComparisonSlot | undefined,
): SlotProof {
  const key =
    identity === undefined || slot === undefined
      ? undefined
      : slotKey(identity, role, slot);
  const subject = slot?.kind === "build" ? buildSubject(slot) : undefined;
  const [answer, setAnswer] = useState<
    { readonly key: string; readonly proof: CiProof } | undefined
  >(undefined);

  useEffect(() => {
    if (key === undefined || subject === undefined) return;
    const controller = new AbortController();
    void readIntentCiProof(source, subject, controller.signal)
      .then((proof) => {
        if (!controller.signal.aborted) setAnswer({ key, proof });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setAnswer({
          key,
          proof: {
            kind: "unavailable",
            reason: "unreadable",
            ...(error instanceof Error && error.message !== ""
              ? { detail: error.message }
              : {}),
          },
        });
      });
    return () => {
      controller.abort();
    };
  }, [source, key, subject?.runId, subject?.runAttempt, subject?.revision]);

  if (key === undefined) return { proof: undefined, reading: false };
  if (slot?.kind === "build" && subject === undefined) {
    return {
      proof: { kind: "unavailable", reason: "none" },
      reading: false,
    };
  }
  if (subject === undefined) return { proof: undefined, reading: false };
  if (answer?.key === key) return { proof: answer.proof, reading: false };
  return { proof: undefined, reading: true };
}

// The three endpoint proofs for a comparison answer, keyed by story identity
// and each build's attempt so a late answer never paints another selection.
export function useIntentCiComparisonEndpointProofs(
  source: PublishedSource,
  answer: StoryCiComparisonAnswer | undefined,
): ComparisonEndpointProofs | undefined {
  const identity = answer?.kind === "comparison" ? answer.identity : undefined;
  const baseline = useSlotProof(
    source,
    identity,
    "baseline",
    answer?.kind === "comparison" ? answer.baseline : undefined,
  );
  // Taken Trunk Mode puts the live tip in `provisional` beside Branch N/A;
  // entry rows still compare that tip in the Branch column.
  const branchSlot =
    answer?.kind === "comparison"
      ? (answer.provisional ?? answer.branch)
      : undefined;
  const branch = useSlotProof(source, identity, "branch", branchSlot);
  const landed = useSlotProof(
    source,
    identity,
    "landed",
    answer?.kind === "comparison" ? answer.landed : undefined,
  );

  if (answer === undefined || answer.kind !== "comparison") return undefined;

  return {
    baseline: comparisonProofOf(
      answer.baseline,
      baseline.proof,
      baseline.reading,
    ),
    branch: comparisonProofOf(
      branchSlot ?? answer.branch,
      branch.proof,
      branch.reading,
    ),
    landed: comparisonProofOf(answer.landed, landed.proof, landed.reading),
  };
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
