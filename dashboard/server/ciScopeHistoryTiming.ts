// Timing eligibility stays within one declared evidence unit. Cohort ordering,
// represented attempts and independent segment state live in ciScopeHistory.ts.
import { ciProofSchema, type CiProofEntry } from "../src/ciProof.ts";
import { entryTimingOf, scopeTimingOf } from "../src/ciProofTiming.ts";
import {
  comparableUnits,
  declaredUnits,
  entryEvidenceOf,
  hasFileBreakdown,
  unitName,
  type DeclaredUnit,
} from "../src/ciProofUnits.ts";
import { owningEntryOf, scopeFiguresOf } from "../src/ciScopeProof.ts";
import type { StoryCiBuildSelection } from "../src/storyCiComparison.ts";
import type { KeptBuild } from "./landedCiObservation.ts";

const proofGap = {
  none: "Missing CI proof summary",
  expired: "Expired CI proof summary",
  unreadable: "Unreadable CI proof summary",
  invalid: "Invalid CI proof summary",
  mismatched: "CI proof identity does not match the measured attempt",
  "too-large": "CI proof summary exceeds the read size limit",
} as const;

const signatureOf = (path: string, entry: string, unit: DeclaredUnit): string =>
  `${path}\n${entry}\n${unit}`;

function entryOf(
  build: KeptBuild | undefined,
  path: string,
): CiProofEntry | undefined {
  const parsed = ciProofSchema.safeParse(build?.proof);
  return parsed.success && parsed.data.kind === "summary"
    ? owningEntryOf(parsed.data.summary.entries, path)
    : undefined;
}

export function scopeHistoryDeclaredUnitsOf(
  build: KeptBuild | undefined,
  path: string,
): readonly DeclaredUnit[] {
  const entry = entryOf(build, path);
  return entry === undefined
    ? []
    : declaredUnits.filter((unit) =>
        entry.evidence.some((evidence) => comparableUnits(evidence.unit, unit)),
      );
}

export function scopeHistorySignatureOf(
  build: KeptBuild | undefined,
  path: string,
  unit: DeclaredUnit,
): string | undefined {
  const entry = entryOf(build, path);
  return entry === undefined ||
    !entry.evidence.some((evidence) => comparableUnits(evidence.unit, unit))
    ? undefined
    : signatureOf(path, entry.path, unit);
}

type ScopeUnitTiming =
  | {
      readonly kind: "gap";
      readonly unit: DeclaredUnit;
      readonly reason: string;
    }
  | {
      readonly kind: "point";
      readonly unit: DeclaredUnit;
      readonly ms: number;
      readonly entry: string;
      readonly signature: string;
    };

type ScopeTimings = {
  readonly readings: readonly ScopeUnitTiming[];
  readonly reason?: string;
  readonly legacyReason?: string;
};

// Every requested declared unit is evaluated independently, including absent
// units. unitResultsAt's first-result placeholder never chooses a history.
export function scopeHistoryTimingsOf(
  build: KeptBuild | undefined,
  selection: StoryCiBuildSelection,
  path: string,
  expected: ReadonlyMap<DeclaredUnit, string | undefined>,
  hasMeasuredDate: boolean,
  units: readonly DeclaredUnit[],
): ScopeTimings {
  const gap = (reason: string): ScopeTimings => ({
    readings: units.map((unit) => ({ kind: "gap", unit, reason })),
    reason,
  });
  if (selection === "ancestor")
    return gap("Unsupported landing build selection");
  if (build?.state === "failed") return gap("Failed CI build");
  if (!hasMeasuredDate) return gap("Measured build date unavailable");
  const parsed = ciProofSchema.safeParse(build?.proof);
  if (!parsed.success) return gap("CI proof has not been collected");
  if (parsed.data.kind === "unavailable")
    return gap(proofGap[parsed.data.reason]);
  const entry = owningEntryOf(parsed.data.summary.entries, path);
  if (entry === undefined)
    return gap("No matching scope in this build's CI proof");
  const evidence = entryEvidenceOf(entry);
  const hasLegacy = evidence.some((result) => result.unit === "legacy");
  const legacyReason = "Legacy unit unknown in this build's CI proof";
  const declared = evidence.some((result) => result.unit !== "legacy");
  const readings = units.map((unit): ScopeUnitTiming => {
    const unitGap = (reason: string): ScopeUnitTiming => ({
      kind: "gap",
      unit,
      reason,
    });
    const result = evidence.find((candidate) =>
      comparableUnits(candidate.unit, unit),
    );
    if (result === undefined)
      return unitGap(
        `No declared ${unitName(unit)} evidence in this build's CI proof${hasLegacy ? "; legacy unit unknown" : ""}`,
      );
    const signature = signatureOf(path, entry.path, unit);
    const selectedSignature = expected.get(unit);
    if (selectedSignature !== undefined && signature !== selectedSignature)
      return unitGap(
        "Unsupported scope match: owning entry or counted unit changed",
      );
    if (path !== entry.path && !hasFileBreakdown(result))
      return unitGap("No file breakdown in this build's CI proof");
    const figures = scopeFiguresOf(result, path);
    if (path !== entry.path && figures.paths === 0)
      return unitGap("No matching scope in this build's CI proof");
    const timing =
      path === entry.path
        ? entryTimingOf(result)
        : scopeTimingOf(result, figures);
    return timing.kind === "measured"
      ? { kind: "point", unit, ms: timing.ms, entry: entry.path, signature }
      : unitGap(timing.explanation);
  });
  return {
    readings,
    ...(!declared
      ? {
          reason: hasLegacy
            ? legacyReason
            : "Counted unit unavailable in this build's CI proof",
        }
      : {}),
    ...(hasLegacy && declared ? { legacyReason } : {}),
  };
}
