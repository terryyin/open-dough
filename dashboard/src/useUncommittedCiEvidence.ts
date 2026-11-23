import { commitShaPattern } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  branchResultOf,
  type StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import {
  useSelectedIntentCiComparison,
  type ComparisonReading,
} from "./useIntentCiComparison.ts";

type CompletedBuild = Extract<StoryCiComparisonSlot, { kind: "build" }>;

export type UncommittedCiEvidence = { readonly head: string } & (
  | { readonly kind: "build"; readonly build: CompletedBuild }
  | { readonly kind: "checking" | "no-build" | "unavailable" }
);

function completedAt(
  head: string | undefined,
  slot: StoryCiComparisonSlot | undefined,
): CompletedBuild | undefined {
  return slot?.kind === "build" && slot.revision === head ? slot : undefined;
}

export function useUncommittedCiEvidence(
  source: PublishedSource,
  identity: string | undefined,
  head: string | undefined,
  comparison: ComparisonReading,
): UncommittedCiEvidence | undefined {
  const current = comparison.shown;
  const known =
    current?.kind === "comparison"
      ? (completedAt(head, branchResultOf(current).slot) ??
        completedAt(head, current.baseline))
      : undefined;
  const checkingDefault = comparison.reading && current === undefined;
  // Equal endpoints ask the existing reader for the build at or before the
  // head without selecting any changes. Only the head itself can answer here.
  const range =
    head !== undefined &&
    commitShaPattern.test(head) &&
    known === undefined &&
    !checkingDefault
      ? { start: head, end: head }
      : undefined;
  const lookup = useSelectedIntentCiComparison(source, identity, range);
  if (head === undefined) return undefined;
  if (known !== undefined) return { kind: "build", head, build: known };
  if (identity === undefined || !commitShaPattern.test(head))
    return { kind: "unavailable", head };
  if (checkingDefault || lookup.reading) return { kind: "checking", head };
  if (lookup.shown?.kind !== "selection") return { kind: "unavailable", head };
  const build = completedAt(head, lookup.shown.baseline);
  if (build !== undefined) return { kind: "build", head, build };
  return {
    kind:
      lookup.shown.baseline.kind === "unavailable" ? "unavailable" : "no-build",
    head,
  };
}
