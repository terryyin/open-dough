// pytest proof files as the reference
// (`../../src/skills/dough-test-optimization/references/pytest-proof.md`)
// defines them, read into Intent's case model (`./proofCases.ts`): file
// path → file, the node id's `::`-joined names after the file → case name,
// parameter id → variant, file blob → file blob.

import {
  isRecord,
  proofFileObservations,
  proofMeasureOf,
  type CaseObservation,
} from "./proofCases.ts";

function observationOf(value: unknown): CaseObservation | undefined {
  if (!isRecord(value)) return undefined;
  const { file, test, parameterId, outcome } = value;
  if (typeof file !== "string" || file.length === 0) return undefined;
  if (typeof test !== "string" || test.length === 0) return undefined;
  if (parameterId !== undefined && typeof parameterId !== "string") {
    return undefined;
  }
  if (outcome !== "passed") return undefined;
  const measured = proofMeasureOf(value, value.fileBlob);
  if (measured === undefined) return undefined;
  const named = { file, name: test, outcome };
  return parameterId === undefined
    ? { ...named, ...measured }
    : { ...named, variant: [parameterId], ...measured };
}

// The observations one pytest proof file holds, or undefined when its text
// is not a version 1 proof file whose every observation is a complete pass.
export function parsePytestProofFile(
  text: string,
): readonly CaseObservation[] | undefined {
  return proofFileObservations(text, observationOf);
}
