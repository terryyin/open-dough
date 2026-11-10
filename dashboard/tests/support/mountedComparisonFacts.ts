// Reused canonical entry facts; independently written expectations stay in specs.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiProofEntry } from "../../src/ciProof.ts";
import { preparedComparison } from "./comparisonMountFacts.ts";

type EndpointEntries = [CiProofEntry[], CiProofEntry[], CiProofEntry[]];

// Adapter identity replaces GitHub run identity, matching runIdentityOf.
export function withoutGithubRunIdentity<T extends object>(
  slot: T,
): Omit<T, "runId" | "runAttempt"> {
  const rest = { ...(slot as T & { runId?: unknown; runAttempt?: unknown }) };
  delete rest.runId;
  delete rest.runAttempt;
  return rest;
}

// A comparison build slot whose identity is the adapter attempt, not a
// GitHub run. Scenario fields stay at the call site.
export function adapterSlot<T extends object>(
  slot: T,
  attempt: {
    readonly attemptId: string;
    readonly runId?: string;
    readonly ambiguous?: boolean;
  },
  slotFields: object = {},
) {
  return {
    ...withoutGithubRunIdentity(slot),
    runBranch: "main",
    ...slotFields,
    adapterAttempt: {
      runId: attempt.runId ?? "pipeline",
      attemptId: attempt.attemptId,
      ...(attempt.ambiguous === true ? { ambiguous: true as const } : {}),
    },
  };
}

export const timedEntry = (
  path: string,
  ms: number,
  count = 1,
  unit: "case" | "file" = "case",
) => makeMe.aCiProofEntry.at(path).counting(count, unit).timed(ms).please();

export function mixedEntryFacts(): EndpointEntries {
  return [
    [
      timedEntry("dashboard/tests", 240_000, 2090),
      timedEntry("tests", 120_000, 5, "file"),
    ],
    [
      timedEntry("dashboard/tests", 270_000, 2092),
      timedEntry("tests", 90_000, 5, "file"),
      timedEntry("src/skills", 30_000, 3, "file"),
    ],
    [
      timedEntry("dashboard/tests", 300_000, 2092),
      timedEntry("tests", 60_000, 5, "file"),
      timedEntry("src/skills", 30_000, 3, "file"),
    ],
  ];
}

export function relativeEntryFacts(): EndpointEntries {
  return [
    [
      timedEntry("e/slower", 240_000),
      timedEntry("e/faster", 120_000),
      timedEntry("e/same", 45_000),
      timedEntry("e/zero", 0),
    ],
    [
      timedEntry("e/slower", 270_000),
      timedEntry("e/faster", 90_000),
      timedEntry("e/same", 45_000),
      timedEntry("e/zero", 30_000),
      timedEntry("e/added", 30_000),
    ],
    [
      timedEntry("e/slower", 300_000),
      timedEntry("e/faster", 60_000),
      timedEntry("e/same", 45_000),
      timedEntry("e/zero", 30_000),
      timedEntry("e/added", 30_000),
    ],
  ];
}

export function wallComparedFacts() {
  const facts = preparedComparison();
  const at = (slot: typeof facts.answer.baseline, durationMs: number) => ({
    ...slot,
    completedAt: new Date(
      Date.parse("2026-11-09T00:00:00Z") + durationMs,
    ).toISOString(),
  });
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: at(facts.answer.baseline, 180_000),
      branch: at(facts.answer.branch, 200_000),
      landed: at(facts.answer.landed, 240_000),
    })
    .please();
  return { ...facts, answer };
}
