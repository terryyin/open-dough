// The CI proof of one CI attempt, as the local authenticated read boundary
// answers it (`../server/intentCiProofRead.ts`): a GitHub Actions run
// attempt's or a ciAdapter attempt's proof summary, in the collector's
// current versioned summary schema
// (`../../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs`;
// the boundary reads a version 1 summary's results as legacy evidence), or
// the one reason no proof can be shown for that attempt. Each declared entry
// keeps its results partitioned by unit (`./ciProofUnits.ts`): test cases,
// test files, or legacy test results, never added together.
import { z } from "zod";

// The GitHub Actions run a proof read is keyed by: the judged result's run id
// and attempt, and the revision it tested.
export type CiProofRun = {
  readonly runId: number;
  readonly runAttempt: number;
  readonly revision: string;
};

// The ciAdapter attempt a proof read is keyed by: the text form of the
// discovered attempt's `runId` and `attemptId`, the branch whose discover
// listed it, and the revision it tested.
export type CiAdapterProofAttempt = {
  readonly runId: string;
  readonly attemptId: string;
  readonly branch: string;
  readonly revision: string;
};

// What one proof read is of.
export type CiProofSubject = CiProofRun | CiAdapterProofAttempt;

export function isAdapterProofAttempt(
  subject: CiProofSubject,
): subject is CiAdapterProofAttempt {
  return "attemptId" in subject;
}

// Only the fields that key a proof read of `subject`, without any other
// field it carries (a read's kind, a shown link).
export function ciProofSubjectOf(subject: CiProofSubject): CiProofSubject {
  if (isAdapterProofAttempt(subject)) {
    const { runId, attemptId, branch, revision } = subject;
    return { runId, attemptId, branch, revision };
  }
  const { runId, runAttempt, revision } = subject;
  return { runId, runAttempt, revision };
}

// Why no proof can be shown: the run has no summary, it has expired, it
// could not be read (GitHub or the adapter refused or could not answer, or
// its archive could not be opened), it is not a valid summary, it names
// another repository, run, attempt or revision, or a size limit kept it
// from being read (`too-large`, with `limitBytes` and `sizeBytes` when
// known).
export const ciProofUnavailableReasons = [
  "none",
  "expired",
  "unreadable",
  "invalid",
  "mismatched",
  "too-large",
] as const;
export type CiProofUnavailableReason =
  (typeof ciProofUnavailableReasons)[number];

const count = z.number().int().nonnegative();
const positive = z.number().int().positive();
// Optional summed test execution time in milliseconds.
const durationMs = z.number().nonnegative().optional();
// Optional count of counted results that recorded no duration (file
// breakdown): absent in an older summary.
const untimed = count.optional();

const partSchema = z.object({
  part: positive,
  status: z.enum(["present", "missing", "ambiguous"]),
  passed: count.optional(),
  failed: count.optional(),
  other: count.optional(),
  durationMs,
  untimed,
  // The part's fragment was broken down by file.
  breakdown: z.literal(true).optional(),
});
export type CiProofPart = z.infer<typeof partSchema>;

// One path's (or the unassigned) figures of an entry's file breakdown.
const figuresSchema = z.object({
  passed: count,
  failed: count,
  other: count,
  durationMs,
  untimed,
});
export type CiProofFigures = z.infer<typeof figuresSchema>;

const fileSchema = figuresSchema.extend({ path: z.string().min(1) });
export type CiProofFile = z.infer<typeof fileSchema>;

// One unit's results at an entry: counts, timing, parts and file breakdown.
const resultsSchema = z.object({
  passed: count,
  failed: count,
  other: count,
  durationMs,
  untimed,
  parts: z.array(partSchema).min(1),
  // Summed over the parts broken down by file; absent when none was.
  files: z.array(fileSchema).optional(),
  unassigned: figuresSchema.optional(),
});

// The results of one unit: test cases, test files, or legacy results whose
// publisher declared no unit, with the label that unit was spelled with
// (`tests`, `checks`, or null when no part was present to say) as
// provenance only.
const evidenceSchema = z.discriminatedUnion("unit", [
  resultsSchema.extend({ unit: z.literal("case") }),
  resultsSchema.extend({ unit: z.literal("file") }),
  resultsSchema.extend({
    unit: z.literal("legacy"),
    label: z.string().min(1).nullable(),
  }),
]);
export type CiProofEvidence = z.infer<typeof evidenceSchema>;

// One declared entry, an Intent location path, with its results in each unit
// reported there.
const entrySchema = z.object({
  path: z.string().min(1),
  evidence: z.array(evidenceSchema).min(1),
});
export type CiProofEntry = z.infer<typeof entrySchema>;

// A summary names either a GitHub Actions run attempt or an adapter attempt.
const summaryFields = z.object({
  schemaVersion: z.literal(2),
  repository: z.string().min(1),
  revision: z.string().min(1),
  entries: z.array(entrySchema),
});
const summarySchema = z.union([
  summaryFields.extend({ runId: positive, runAttempt: positive }),
  summaryFields.extend({ attemptId: z.string().min(1) }),
]);

export const ciProofSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("summary"), summary: summarySchema }),
  z.object({
    kind: z.literal("unavailable"),
    reason: z.enum(ciProofUnavailableReasons),
    detail: z.string().min(1).optional(),
    // `too-large` only: the proof read's byte limit, and the actual size
    // when the reader knows it (GitHub Actions listing or zip entry).
    limitBytes: z.number().int().positive().optional(),
    sizeBytes: z.number().int().positive().optional(),
  }),
]);
export type CiProof = z.infer<typeof ciProofSchema>;
export type CiProofUnavailable = Extract<CiProof, { kind: "unavailable" }>;

// A size-limit refusal from either proof reader: the shared limit, and the
// actual size when the reader knows it.
export function ciProofTooLarge(
  limitBytes: number,
  sizeBytes?: number,
): CiProofUnavailable {
  return {
    kind: "unavailable",
    reason: "too-large",
    limitBytes,
    ...(sizeBytes === undefined ? {} : { sizeBytes }),
  };
}
