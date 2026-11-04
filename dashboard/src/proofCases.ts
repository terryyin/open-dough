// The one model Intent reads committed proof through, whatever runner wrote
// it: a test case named by its file, its case name path as the runner names
// it, and an optional variant (an outline's example cells), observed with an
// outcome, attempts, duration, finish time, commit and the file's Git blob as
// tested. Each proof kind (`./proofKinds.ts`) parses its files into this
// model and derives source rows from its published text; identity,
// latest-first reduction, and matching rows to proof live here once, for the
// pinned Intent read (`../server/intentProofRead.ts`), file Proof
// (`./IntentProof.tsx`) and summaries (`./intentSummaryCoverage.ts`).

import { commitShaPattern } from "./authenticatedReadRules.ts";

// A test case as proof names it: the file's repository path, the case name
// path as written, and for a case the runner varies, its variant.
export type ProofCase = {
  readonly file: string;
  readonly name: string;
  readonly variant?: readonly string[] | undefined;
};

// What one finished case's observation measured. Its commit and file blob
// are full Git object ids.
export type ProofMeasure = {
  readonly attempts: number;
  readonly durationMs: number;
  readonly finishedAt: string;
  readonly commit: string;
  readonly fileBlob: string;
};

export type CaseObservation = ProofCase &
  ProofMeasure & { readonly outcome: string };

// The retained proof Intent publishes after reducing legacy observations.
export type SuccessfulCaseObservation = CaseObservation & {
  readonly outcome: "passed";
};

// One case row a published file defines, in source order, with the 1-based
// line of its definition.
export type CaseRow = {
  readonly name: string;
  readonly variant?: readonly string[];
  readonly line: number;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// The measured fields every proof kind records alike, or undefined when one
// is missing or invalid; the file blob is passed by its kind's field name.
export function proofMeasureOf(
  value: Record<string, unknown>,
  fileBlob: unknown,
): ProofMeasure | undefined {
  const { attempts, durationMs, finishedAt, commit } = value;
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
  if (typeof fileBlob !== "string" || !commitShaPattern.test(fileBlob)) {
    return undefined;
  }
  return { attempts, durationMs, finishedAt, commit, fileBlob };
}

// The observations of one version 1 proof file, `{"version": 1,
// "observations": […]}`, each read by its kind; undefined when the text is
// not such a file or any observation is incomplete.
export function proofFileObservations(
  text: string,
  observationOf: (value: unknown) => CaseObservation | undefined,
): readonly CaseObservation[] | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!isRecord(parsed) || parsed.version !== 1) return undefined;
  if (!Array.isArray(parsed.observations)) return undefined;
  const observations: CaseObservation[] = [];
  for (const entry of parsed.observations) {
    const observation = observationOf(entry);
    if (observation === undefined) return undefined;
    observations.push(observation);
  }
  return observations;
}

// Orders sequences item by item, a shorter prefix first.
function lexicographic<T>(compare: (left: T, right: T) => number) {
  return (left: readonly T[], right: readonly T[]): number => {
    for (const [at, item] of left.entries()) {
      const other = right[at];
      if (other === undefined) return 1;
      const difference = compare(item, other);
      if (difference !== 0) return difference;
    }
    return left.length - right.length;
  };
}

const codePointsOf = (text: string): number[] =>
  Array.from(text, (character) => character.codePointAt(0) ?? 0);

// Orders strings by Unicode code point; the default comparison orders UTF-16
// code units, which differs beyond the Basic Multilingual Plane. Every
// reader-side order of observed names and variants is this one, whatever
// order the snapshot holds them in.
const byCodePoints = lexicographic(
  (left: number, right: number) => left - right,
);
export const byCodePoint = (left: string, right: string): number =>
  byCodePoints(codePointsOf(left), codePointsOf(right));

// Orders variants, such as parameter ids or a project, compared item by item.
export const byVariant = lexicographic(byCodePoint);

// How a file's case `name` was observed, for kinds whose variants exist only
// once run: its variants in variant order, and whether it was also observed
// without one.
export function observedVariantsOf(
  name: string,
  observed: readonly SuccessfulCaseObservation[],
): {
  readonly variants: readonly (readonly string[])[];
  readonly plain: boolean;
} {
  const variants: (readonly string[])[] = [];
  let plain = false;
  for (const { name: observedName, variant } of observed) {
    if (observedName !== name) continue;
    if (variant === undefined) plain = true;
    else variants.push(variant);
  }
  return { variants: variants.sort(byVariant), plain };
}

// The identity a case keeps across runs and files.
export function proofIdentity({ file, name, variant }: ProofCase): string {
  return JSON.stringify([file, name, variant ?? null]);
}

// Read legacy outcomes latest-first, then expose only successful proof. A
// later unsuccessful result clears the older success instead of reviving it.
// At equal finish times an unsuccessful result clears the success regardless
// of file ordering.
export function latestSuccessfulObservations(
  observations: Iterable<CaseObservation>,
): SuccessfulCaseObservation[] {
  const latest = new Map<string, CaseObservation>();
  for (const observation of observations) {
    const identity = proofIdentity(observation);
    const kept = latest.get(identity);
    if (
      kept === undefined ||
      Date.parse(observation.finishedAt) > Date.parse(kept.finishedAt) ||
      (Date.parse(observation.finishedAt) === Date.parse(kept.finishedAt) &&
        kept.outcome === "passed" &&
        observation.outcome !== "passed")
    ) {
      latest.set(identity, observation);
    }
  }
  return [...latest.values()].filter(
    (observation): observation is SuccessfulCaseObservation =>
      observation.outcome === "passed",
  );
}

// A location's retained proof indexed for matching: by case identity, and
// each file's observations for kinds whose rows depend on what was observed.
export type LatestProof = {
  readonly byIdentity: ReadonlyMap<string, SuccessfulCaseObservation>;
  readonly byFile: ReadonlyMap<string, readonly SuccessfulCaseObservation[]>;
};

export function latestProofOf(
  observations: readonly SuccessfulCaseObservation[],
): LatestProof {
  const byIdentity = new Map<string, SuccessfulCaseObservation>();
  const byFile = new Map<string, SuccessfulCaseObservation[]>();
  for (const observation of observations) {
    byIdentity.set(proofIdentity(observation), observation);
    const kept = byFile.get(observation.file);
    if (kept === undefined) byFile.set(observation.file, [observation]);
    else kept.push(observation);
  }
  return { byIdentity, byFile };
}

export const noLatestProof: LatestProof = latestProofOf([]);

// How a kind derives a published file's case rows: from its text and, for a
// kind whose variants exist only once run, the file's observed cases.
export type CaseRowsOf = (
  text: string,
  observed: readonly SuccessfulCaseObservation[],
) => readonly CaseRow[];

// One case row of a read file with its latest successful observation, if
// any: the single matching of rows to proof that file Proof and summary
// totals, counts, sums, and slowest cases all read.
export type ObservedRow = {
  readonly path: string;
  readonly row: CaseRow;
  readonly observation: SuccessfulCaseObservation | undefined;
};

export function observedRowsOf(
  path: string,
  text: string,
  rowsOf: CaseRowsOf,
  latest: LatestProof,
): readonly ObservedRow[] {
  return rowsOf(text, latest.byFile.get(path) ?? []).map((row) => ({
    path,
    row,
    observation: latest.byIdentity.get(proofIdentity({ file: path, ...row })),
  }));
}
