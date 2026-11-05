// Cucumber proof files as the reference
// (`../../src/skills/dough-test-optimization/references/cucumber-proof.md`)
// defines them, read into Intent's case model (`./proofCases.ts`): feature
// path → file, scenario name → case name, outline example cells → variant,
// feature blob → file blob. Run files and consolidated files read the same
// way.

import {
  isRecord,
  proofFileObservations,
  proofMeasureOf,
  type CaseObservation,
} from "./proofCases.ts";

const cucumberOutcomes = [
  "passed",
  "failed",
  "skipped",
  "pending",
  "undefined",
  "ambiguous",
  "unknown",
] as const;

type CucumberOutcome = (typeof cucumberOutcomes)[number];

// One finished scenario or outline row as a Cucumber proof file records it:
// feature path from the repository root, scenario name as written, and for
// an outline the example row's cell values. Its commit and feature blob are
// full Git object ids.
export type CucumberObservation = {
  readonly feature: string;
  readonly scenario: string;
  readonly example?: readonly string[] | undefined;
  readonly outcome: CucumberOutcome;
  readonly attempts: number;
  readonly durationMs: number;
  readonly finishedAt: string;
  readonly commit: string;
  readonly featureBlob: string;
};

function observationOf(value: unknown): CaseObservation | undefined {
  if (!isRecord(value)) return undefined;
  const { feature, scenario, example, outcome } = value;
  if (typeof feature !== "string" || feature.length === 0) return undefined;
  if (typeof scenario !== "string") return undefined;
  if (
    example !== undefined &&
    (!Array.isArray(example) ||
      example.some((cell) => typeof cell !== "string"))
  ) {
    return undefined;
  }
  if (!cucumberOutcomes.includes(outcome as CucumberOutcome)) return undefined;
  const measured = proofMeasureOf(value, value.featureBlob);
  if (measured === undefined) return undefined;
  const named = { file: feature, name: scenario, outcome: outcome as string };
  return example === undefined
    ? { ...named, ...measured }
    : { ...named, variant: example as string[], ...measured };
}

// The observations one Cucumber proof file holds, or undefined when its text
// is not a version 1 proof file whose every observation is complete.
export function parseCucumberProofFile(
  text: string,
): readonly CaseObservation[] | undefined {
  return proofFileObservations(text, observationOf);
}
