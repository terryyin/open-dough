// Proof summaries of a story's comparison endpoints
// (`./useIntentCiComparison.ts`), each read through `./authenticatedIntentCiProofRead.ts`
// with the build's full revision. A late answer for another story or attempt
// never becomes the shown proof. Intent's one CI evidence owner
// (`./IntentCiEvidence.tsx`) holds these proofs so the homepage entry rows
// (`./IntentCiComparison.tsx`) and a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) share them; selecting, drilling and returning
// home ask CI nothing again.

import { useEffect, useMemo, useState } from "react";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import type { CiProof, CiProofSubject } from "./ciProof.ts";
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

function useSlotProof(
  source: PublishedSource,
  identity: string | undefined,
  slot: StoryCiComparisonSlot | undefined,
): SlotProof {
  const build = slot?.kind === "build" ? slot : undefined;
  const adapterAttempt = build?.adapterAttempt;
  const revision =
    adapterAttempt?.ambiguous === true ? undefined : build?.revision;
  const runId = adapterAttempt?.runId ?? build?.runId;
  const runAttempt =
    adapterAttempt === undefined ? build?.runAttempt : undefined;
  const attemptId = adapterAttempt?.attemptId;
  const branch = adapterAttempt === undefined ? undefined : build?.runBranch;
  // Capture the proof subject with its key and keep it stable when a fresh
  // comparison answer still names the same attempt.
  const subject = useMemo<CiProofSubject | undefined>(() => {
    if (revision === undefined) return undefined;
    if (typeof runId === "string")
      return attemptId === undefined || branch === undefined
        ? undefined
        : { runId, attemptId, branch, revision };
    return runId === undefined || runAttempt === undefined
      ? undefined
      : { runId, runAttempt, revision };
  }, [attemptId, branch, revision, runId, runAttempt]);
  const key =
    identity === undefined || subject === undefined
      ? undefined
      : JSON.stringify([source.id, source.repository, identity, subject]);
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
  }, [source, key, subject]);

  if (slot?.kind === "build" && subject === undefined) {
    return {
      proof: { kind: "unavailable", reason: "none" },
      reading: false,
    };
  }
  if (key === undefined) return { proof: undefined, reading: false };
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
    answer?.kind === "comparison" ? answer.baseline : undefined,
  );
  // Taken Trunk Mode puts the live tip in `provisional` beside Branch N/A;
  // entry rows still compare that tip in the Branch column.
  const branchSlot =
    answer?.kind === "comparison"
      ? (answer.provisional ?? answer.branch)
      : undefined;
  const branch = useSlotProof(source, identity, branchSlot);
  const landed = useSlotProof(
    source,
    identity,
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
