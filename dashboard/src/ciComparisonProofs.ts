// One disposable proof reader per endpoint, shared by all comparison views.
// Equal subjects in different slots still make separate reads, as before.
import type { CiProof, CiProofSubject } from "./ciProof.ts";
import type { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import { createCiProofReading } from "./ciProofReading.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  selectedCiComparisonKey,
  type SelectedCiComparisonAnswer,
} from "./selectedCiComparison.ts";
import {
  branchResultOf,
  type StoryCiComparisonAnswer,
  type StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import {
  comparisonProofOf,
  type ComparisonEndpointProof,
} from "./storyCiComparisonEntries.ts";

export type SelectedComparisonEndpointProofs = {
  readonly baseline: ComparisonEndpointProof;
  readonly selection: ComparisonEndpointProof;
};

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
  comparisonKey: string | undefined,
  slot: StoryCiComparisonSlot | undefined,
  round: number,
) {
  const subject = subjectOf(slot);
  const key =
    comparisonKey === undefined || subject === undefined
      ? undefined
      : JSON.stringify([
          source.id,
          source.repository,
          comparisonKey,
          subject,
          round,
        ]);
  return { key, subject };
}

type ComparisonProofRead<Endpoint extends string> = {
  readonly key: string;
  readonly slots: Readonly<Record<Endpoint, StoryCiComparisonSlot>>;
};

function createEndpointProofs<Answer, Endpoint extends string>(
  readProof: typeof readIntentCiProof,
  endpoints: readonly Endpoint[],
  comparisonOf: (
    answer: Answer | undefined,
    source: PublishedSource,
  ) => ComparisonProofRead<Endpoint> | undefined,
) {
  const readers = endpoints.map(
    (endpoint) => [endpoint, createCiProofReading(readProof)] as const,
  );
  const listeners = new Set<() => void>();
  let version = 0;
  for (const [, reader] of readers)
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
    select(source: PublishedSource, answer: Answer | undefined, round: number) {
      const comparison = comparisonOf(answer, source);
      return Promise.all(
        readers.map(([endpoint, reader]) => {
          const { key, subject } = slotRead(
            source,
            comparison?.key,
            comparison?.slots[endpoint],
            round,
          );
          return reader.select(source, key, subject) ?? Promise.resolve();
        }),
      );
    },
    proofsFor(
      source: PublishedSource,
      answer: Answer | undefined,
      round: number,
    ): Record<Endpoint, ComparisonEndpointProof> | undefined {
      const comparison = comparisonOf(answer, source);
      if (comparison === undefined) return undefined;
      return Object.fromEntries(
        readers.map(([endpoint, reader]) => {
          const slot = comparison.slots[endpoint];
          const { key, subject } = slotRead(
            source,
            comparison.key,
            slot,
            round,
          );
          const current = reader.getSnapshot();
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
          return [
            endpoint,
            comparisonProofOf(
              slot,
              proof,
              key !== undefined && current?.key !== key,
            ),
          ];
        }),
      ) as Record<Endpoint, ComparisonEndpointProof>;
    },
    dispose() {
      for (const [, reader] of readers) reader.dispose();
    },
  };
}

export function createCiComparisonProofs(readProof: typeof readIntentCiProof) {
  return createEndpointProofs(
    readProof,
    ["baseline", "branch", "landed"],
    (answer: StoryCiComparisonAnswer | undefined) =>
      answer?.kind === "comparison"
        ? {
            key: answer.identity,
            slots: {
              baseline: answer.baseline,
              branch: branchResultOf(answer).slot,
              landed: answer.landed,
            },
          }
        : undefined,
  );
}

export function createSelectedCiComparisonProofs(
  readProof: typeof readIntentCiProof,
) {
  return createEndpointProofs(
    readProof,
    ["baseline", "selection"],
    (answer: SelectedCiComparisonAnswer | undefined, source) =>
      answer?.kind === "selection"
        ? {
            key: selectedCiComparisonKey(source, answer.identity, answer.range),
            slots: answer,
          }
        : undefined,
  );
}
