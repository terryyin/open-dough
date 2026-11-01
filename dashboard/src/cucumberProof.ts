// Cucumber proof files as the reference
// (`../../src/skills/dough-test-optimization/references/cucumber-proof.md`)
// defines them: parse one committed run or consolidated file, and reduce any
// number of them to the latest observation of each scenario or outline row.
// Run files and consolidated files read the same way. Shared by the pinned
// Intent read (`../server/intentProofRead.ts`), its answer's schema
// (`./authenticatedIntentRead.ts`), and the Proof pane (`./IntentProof.tsx`).

import { commitShaPattern } from "./authenticatedReadRules.ts";

export const proofOutcomes = [
  "passed",
  "failed",
  "skipped",
  "pending",
  "undefined",
  "ambiguous",
  "unknown",
] as const;

type ProofOutcome = (typeof proofOutcomes)[number];

// One finished scenario or outline row, named by its source: feature path
// from the repository root, scenario name as written, and for an outline the
// example row's cell values. Its commit and feature blob are full Git object
// ids.
export type ProofObservation = {
  readonly feature: string;
  readonly scenario: string;
  readonly example?: readonly string[] | undefined;
  readonly outcome: ProofOutcome;
  readonly attempts: number;
  readonly durationMs: number;
  readonly finishedAt: string;
  readonly commit: string;
  readonly featureBlob: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function observationOf(value: unknown): ProofObservation | undefined {
  if (!isRecord(value)) return undefined;
  const {
    feature,
    scenario,
    example,
    outcome,
    attempts,
    durationMs,
    finishedAt,
    commit,
    featureBlob,
  } = value;
  if (typeof feature !== "string" || feature.length === 0) return undefined;
  if (typeof scenario !== "string") return undefined;
  if (
    example !== undefined &&
    (!Array.isArray(example) ||
      example.some((cell) => typeof cell !== "string"))
  ) {
    return undefined;
  }
  if (!proofOutcomes.includes(outcome as ProofOutcome)) return undefined;
  if (
    typeof attempts !== "number" ||
    !Number.isInteger(attempts) ||
    attempts < 1
  ) {
    return undefined;
  }
  if (
    typeof durationMs !== "number" ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    return undefined;
  }
  if (typeof finishedAt !== "string" || Number.isNaN(Date.parse(finishedAt))) {
    return undefined;
  }
  if (typeof commit !== "string" || !commitShaPattern.test(commit)) {
    return undefined;
  }
  if (typeof featureBlob !== "string" || !commitShaPattern.test(featureBlob)) {
    return undefined;
  }
  const named = { feature, scenario, outcome: outcome as ProofOutcome };
  const measured = { attempts, durationMs, finishedAt, commit, featureBlob };
  return example === undefined
    ? { ...named, ...measured }
    : { ...named, example: example as string[], ...measured };
}

// The observations one proof file holds, or undefined when its text is not
// a version 1 proof file whose every observation is complete.
export function parseProofFile(
  text: string,
): readonly ProofObservation[] | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!isRecord(parsed) || parsed.version !== 1) return undefined;
  if (!Array.isArray(parsed.observations)) return undefined;
  const observations: ProofObservation[] = [];
  for (const entry of parsed.observations) {
    const observation = observationOf(entry);
    if (observation === undefined) return undefined;
    observations.push(observation);
  }
  return observations;
}

// The identity a scenario or outline row keeps across runs and files.
export function proofIdentity({
  feature,
  scenario,
  example,
}: Pick<ProofObservation, "feature" | "scenario" | "example">): string {
  return JSON.stringify([feature, scenario, example ?? null]);
}

// The latest observation of each identity, by finish time, whatever its
// outcome. Of equal finish times the one met first is kept.
export function latestObservations(
  observations: Iterable<ProofObservation>,
): ProofObservation[] {
  const latest = new Map<string, ProofObservation>();
  for (const observation of observations) {
    const identity = proofIdentity(observation);
    const kept = latest.get(identity);
    if (
      kept === undefined ||
      Date.parse(observation.finishedAt) > Date.parse(kept.finishedAt)
    ) {
      latest.set(identity, observation);
    }
  }
  return [...latest.values()];
}
