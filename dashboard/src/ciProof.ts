// The CI proof of one GitHub Actions run attempt, as the local authenticated
// read boundary answers it (`../server/intentCiProofRead.ts`): the run's
// proof summary, in the collector's versioned summary schema
// (`../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs`),
// or the one reason no proof can be shown for that run.
import { z } from "zod";

// The run a proof read is keyed by: the judged result's run id and attempt,
// and the revision it tested.
export type CiProofRun = {
  readonly runId: number;
  readonly runAttempt: number;
  readonly revision: string;
};

// Why no proof can be shown: the run has no summary, it has expired, it
// could not be read (GitHub refused or could not answer, or its archive
// could not be opened), it is not a valid summary, it names another
// repository, run, attempt or revision, or the project's CI is read through
// a ciAdapter.
export const ciProofUnavailableReasons = [
  "none",
  "expired",
  "unreadable",
  "invalid",
  "mismatched",
  "ci-adapter",
] as const;
export type CiProofUnavailableReason =
  (typeof ciProofUnavailableReasons)[number];

const count = z.number().int().nonnegative();
const positive = z.number().int().positive();

const partSchema = z.object({
  part: positive,
  status: z.enum(["present", "missing", "ambiguous"]),
  passed: count.optional(),
  failed: count.optional(),
  other: count.optional(),
});

const entrySchema = z.object({
  path: z.string().min(1),
  // What the entry's runner counts, such as Playwright `tests`; null when no
  // part was present to say.
  unit: z.string().min(1).nullable(),
  passed: count,
  failed: count,
  other: count,
  parts: z.array(partSchema).min(1),
});
export type CiProofEntry = z.infer<typeof entrySchema>;

const summarySchema = z.object({
  schemaVersion: z.literal(1),
  repository: z.string().min(1),
  runId: positive,
  runAttempt: positive,
  revision: z.string().min(1),
  entries: z.array(entrySchema),
});

export const ciProofSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("summary"), summary: summarySchema }),
  z.object({
    kind: z.literal("unavailable"),
    reason: z.enum(ciProofUnavailableReasons),
    detail: z.string().min(1).optional(),
  }),
]);
export type CiProof = z.infer<typeof ciProofSchema>;
