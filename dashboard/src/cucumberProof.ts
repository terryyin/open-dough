// Cucumber proof files as the reference
// (`../../src/skills/dough-test-optimization/references/cucumber-proof.md`)
// defines them, read into Intent's case model (`./proofCases.ts`): feature
// path → file, scenario name → case name, outline example cells → variant,
// feature blob → file blob. Run files and consolidated files read the same
// way. The pinned Intent read (`../server/intentProofRead.ts`) answers in the
// same Cucumber fields, and its answer's schema
// (`./authenticatedIntentRead.ts`) reads them back into the case model.

import {
  isRecord,
  proofFileObservations,
  proofMeasureOf,
  type CaseObservation,
  type SuccessfulCaseObservation,
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

export type SuccessfulCucumberObservation = CucumberObservation & {
  readonly outcome: "passed";
};

// A retained Cucumber observation as a case observation.
export function caseOfCucumber({
  feature,
  scenario,
  example,
  featureBlob,
  ...measured
}: SuccessfulCucumberObservation): SuccessfulCaseObservation {
  const named = { file: feature, name: scenario };
  const recorded = { ...measured, fileBlob: featureBlob };
  return example === undefined
    ? { ...named, ...recorded }
    : { ...named, variant: example, ...recorded };
}

// A retained case observation in the Cucumber fields the Intent answer
// carries.
export function cucumberOfCase({
  file,
  name,
  variant,
  fileBlob,
  outcome,
  attempts,
  durationMs,
  finishedAt,
  commit,
}: SuccessfulCaseObservation): SuccessfulCucumberObservation {
  const named = { feature: file, scenario: name, outcome };
  const measured = {
    attempts,
    durationMs,
    finishedAt,
    commit,
    featureBlob: fileBlob,
  };
  return variant === undefined
    ? { ...named, ...measured }
    : { ...named, example: variant, ...measured };
}

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
