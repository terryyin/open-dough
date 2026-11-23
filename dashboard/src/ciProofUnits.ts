// Intent displays declared case and file results separately, including their
// counts, timing, and parts.

import {
  ciProofUnitSchema,
  type CiProofEntry,
  type CiProofEvidence,
} from "./ciProof.ts";

export type CiProofUnit = CiProofEvidence["unit"];
export const declaredUnits: readonly CiProofUnit[] = ciProofUnitSchema.options;

// One unit's results with the path of the entry that declared them.
export type CiEntryEvidence = CiProofEvidence & { readonly path: string };

// ENTRY's results, one per unit, in its order, each with ENTRY's path.
export const entryEvidenceOf = (
  entry: CiProofEntry,
): readonly CiEntryEvidence[] =>
  entry.evidence.map((evidence) => ({ ...evidence, path: entry.path }));

// Whether ENTRY's results are each named by their unit: it reports several.
export const namesUnits = (entry: CiProofEntry): boolean =>
  entry.evidence.length > 1;

const nouns: Record<CiProofUnit, readonly [one: string, many: string]> = {
  case: ["test case", "test cases"],
  file: ["test file", "test files"],
};

// What COUNT results in UNIT are called: "1 test case", "3 test files".
export const unitNoun = (unit: CiProofUnit, count: number): string =>
  nouns[unit][count === 1 ? 0 : 1];

// What UNIT's results are called.
export const unitName = (unit: CiProofUnit): string => nouns[unit][1];

// Whether EVIDENCE counted any result: a part was present.
export const countedAny = (evidence: CiProofEvidence): boolean =>
  evidence.parts.some((part) => part.status === "present");

// Whether any part of EVIDENCE was broken down by file.
export const hasFileBreakdown = (evidence: CiProofEvidence): boolean =>
  evidence.parts.some((part) => part.breakdown === true);
