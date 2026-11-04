// Vitest proof files as the reference
// (`../../src/skills/dough-test-optimization/references/vitest-proof.md`)
// defines them, read into Intent's case model (`./proofCases.ts`): file
// path → file, the `test` names from the outermost suite to the test → case
// name as Vitest joins them (`./vitestCaseNames.ts`), project → variant, file
// blob → file blob.

import {
  isRecord,
  proofFileObservations,
  proofMeasureOf,
  type CaseObservation,
} from "./proofCases.ts";
import { vitestCaseName } from "./vitestCaseNames.ts";

const isNameList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((name) => typeof name === "string");

function observationOf(value: unknown): CaseObservation | undefined {
  if (!isRecord(value)) return undefined;
  const { file, test, project, outcome } = value;
  if (typeof file !== "string" || file.length === 0) return undefined;
  if (!isNameList(test)) return undefined;
  if (
    project !== undefined &&
    (typeof project !== "string" || project.length === 0)
  ) {
    return undefined;
  }
  if (outcome !== "passed") return undefined;
  const measured = proofMeasureOf(value, value.fileBlob);
  if (measured === undefined) return undefined;
  const named = { file, name: vitestCaseName(test), outcome };
  return project === undefined
    ? { ...named, ...measured }
    : { ...named, variant: [project], ...measured };
}

// The observations one Vitest proof file holds, or undefined when its text
// is not a version 1 proof file whose every observation is a complete pass.
export function parseVitestProofFile(
  text: string,
): readonly CaseObservation[] | undefined {
  return proofFileObservations(text, observationOf);
}
