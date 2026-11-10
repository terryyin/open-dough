// One disposable proof reader per endpoint, shared by all comparison views.
// Equal subjects in different slots still make separate reads, as before.
import type { CiProof, CiProofSubject } from "./ciProof.ts";
import { createCiProofReading } from "./ciProofReading.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type {
  StoryCiComparisonAnswer,
  StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import {
  comparisonProofOf,
  type ComparisonEndpointProofs,
} from "./storyCiComparisonEntries.ts";

function subjectOf(
  slot: StoryCiComparisonSlot | undefined,
): CiProofSubject | undefined {
  if (slot?.kind !== "build" || slot.adapterAttempt?.ambiguous === true)
    return undefined;
  const adapter = slot.adapterAttempt;
  if (adapter !== undefined)
    return slot.runBranch === undefined
      ? undefined
      : {
          runId: adapter.runId,
          attemptId: adapter.attemptId,
          branch: slot.runBranch,
          revision: slot.revision,
        };
  return slot.runId === undefined || slot.runAttempt === undefined
    ? undefined
    : {
        runId: slot.runId,
        runAttempt: slot.runAttempt,
        revision: slot.revision,
      };
}

function slotRead(
  source: PublishedSource,
  identity: string | undefined,
  slot: StoryCiComparisonSlot | undefined,
  round: number,
) {
  const subject = subjectOf(slot);
  const key =
    identity === undefined || subject === undefined
      ? undefined
      : JSON.stringify([
          source.id,
          source.repository,
          identity,
          subject,
          round,
        ]);
  return { key, subject };
}

// Taken Trunk's provisional tip occupies the Branch proof position.
function slotsOf(
  answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>,
) {
  return [
    answer.baseline,
    answer.provisional ?? answer.branch,
    answer.landed,
  ] as const;
}

export function createCiComparisonProofs() {
  const readers = [
    createCiProofReading(),
    createCiProofReading(),
    createCiProofReading(),
  ] as const;
  const listeners = new Set<() => void>();
  let version = 0;
  for (const reader of readers)
    reader.subscribe(() => {
      version += 1;
      for (const listener of listeners) listener();
    });
  return {
    getSnapshot: () => version,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    select(
      source: PublishedSource,
      answer: StoryCiComparisonAnswer | undefined,
      round: number,
    ) {
      const identity =
        answer?.kind === "comparison" ? answer.identity : undefined;
      const slots =
        answer?.kind === "comparison"
          ? slotsOf(answer)
          : ([undefined, undefined, undefined] as const);
      return Promise.all(
        slots.map((slot, index) => {
          const { key, subject } = slotRead(source, identity, slot, round);
          return (
            readers[index]?.select(source, key, subject) ?? Promise.resolve()
          );
        }),
      );
    },
    proofsFor(
      source: PublishedSource,
      answer: StoryCiComparisonAnswer | undefined,
      round: number,
    ): ComparisonEndpointProofs | undefined {
      if (answer?.kind !== "comparison") return undefined;
      const [baseline, branch, landed] = slotsOf(answer);
      const proofOf = (slot: StoryCiComparisonSlot, index: number) => {
        const { key, subject } = slotRead(source, answer.identity, slot, round);
        const current = readers[index]?.getSnapshot();
        let proof: CiProof | undefined;
        if (slot.kind === "build" && subject === undefined)
          proof = { kind: "unavailable", reason: "none" };
        else if (key !== undefined && current?.key === key)
          proof =
            current.read.kind === "unanswered"
              ? {
                  kind: "unavailable",
                  reason: "unreadable",
                  ...(current.read.detail === undefined
                    ? {}
                    : { detail: current.read.detail }),
                }
              : current.read;
        return comparisonProofOf(
          slot,
          proof,
          key !== undefined && current?.key !== key,
        );
      };
      return {
        baseline: proofOf(baseline, 0),
        branch: proofOf(branch, 1),
        landed: proofOf(landed, 2),
      };
    },
    dispose() {
      for (const reader of readers) reader.dispose();
    },
  };
}
