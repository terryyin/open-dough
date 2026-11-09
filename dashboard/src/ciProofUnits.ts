// The units an entry's CI proof results are counted in (`./ciProof.ts`,
// the collector's "Units"), as Intent names them everywhere: test cases,
// test files, and legacy test results, whose publisher declared no unit and
// whose label is provenance only. Each unit's results are an entry's own
// evidence (`CiEntryEvidence`): their counts, timing and parts never move to
// another unit or add to it. Results compare only within one declared unit;
// legacy results never compare, whatever label they carry. An entry
// reporting several units names each unit beside the others' results.

import type { CiProofEntry, CiProofEvidence } from "./ciProof.ts";

export type CiProofUnit = CiProofEvidence["unit"];

// The units a publisher declares, in the order Intent lists them: test
// cases, then test files.
export type DeclaredUnit = Exclude<CiProofUnit, "legacy">;
export const declaredUnits: readonly DeclaredUnit[] = ["case", "file"];

// Every unit in the order Intent lists them: the declared units, then legacy
// test results.
export const listedUnits: readonly CiProofUnit[] = [...declaredUnits, "legacy"];

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
  legacy: ["legacy test result", "legacy test results"],
};

// What COUNT results in UNIT are called: "1 test case", "3 test files".
export const unitNoun = (unit: CiProofUnit, count: number): string =>
  nouns[unit][count === 1 ? 0 : 1];

// What UNIT's results are called.
export const unitName = (unit: CiProofUnit): string => nouns[unit][1];

// Whether results in units A and B can be compared: both declared, and the
// same.
export const comparableUnits = (a: CiProofUnit, b: CiProofUnit): boolean =>
  a !== "legacy" && a === b;

// Why results in UNITS, at ends that do not compare, have no difference:
// legacy results, whose unit is not known, or declared units that differ.
export const whyNotCompared = (units: readonly CiProofUnit[]): string =>
  units.includes("legacy") ? "legacy unit unknown" : "different units";

// Whether EVIDENCE counted any result: a part was present.
export const countedAny = (evidence: CiProofEvidence): boolean =>
  evidence.parts.some((part) => part.status === "present");

// Whether any part of EVIDENCE was broken down by file.
export const hasFileBreakdown = (evidence: CiProofEvidence): boolean =>
  evidence.parts.some((part) => part.breakdown === true);
