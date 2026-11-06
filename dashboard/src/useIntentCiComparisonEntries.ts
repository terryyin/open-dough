// Proof summaries of a done story's comparison endpoints
// (`./useIntentCiComparison.ts`), each read through `./authenticatedIntentCiProofRead.ts`
// with the build's full revision. A late answer for another story or attempt
// never becomes the shown proof. Intent's homepage (`./IntentCiComparison.tsx`)
// turns the three proofs into entry rows (`./storyCiComparisonEntries.ts`).

import { useEffect, useState } from "react";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import type { CiProof, CiProofRun } from "./ciProof.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type {
  StoryCiComparisonAnswer,
  StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import {
  comparisonEntriesOf,
  comparisonProofOf,
  type ComparisonEntries,
} from "./storyCiComparisonEntries.ts";

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

export function useIntentCiComparisonEntries(
  source: PublishedSource,
  answer: StoryCiComparisonAnswer | undefined,
): ComparisonEntries {
  const identity = answer?.kind === "comparison" ? answer.identity : undefined;
  const baseline = useSlotProof(
    source,
    identity,
    "baseline",
    answer?.kind === "comparison" ? answer.baseline : undefined,
  );
  const branch = useSlotProof(
    source,
    identity,
    "branch",
    answer?.kind === "comparison" ? answer.branch : undefined,
  );
  const landed = useSlotProof(
    source,
    identity,
    "landed",
    answer?.kind === "comparison" ? answer.landed : undefined,
  );

  if (answer === undefined || answer.kind !== "comparison") {
    return { kind: "checking" };
  }

  return comparisonEntriesOf(
    comparisonProofOf(answer.baseline, baseline.proof, baseline.reading),
    comparisonProofOf(answer.branch, branch.proof, branch.reading),
    comparisonProofOf(answer.landed, landed.proof, landed.reading),
  );
}
