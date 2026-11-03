// What one entry of this user's incident record (`./incidentRecord.ts`)
// holds: the process that wrote it and the facts of its kind, each field
// already sanitized and validated again when read back. Entries are told
// apart across processes by `incidentIdentity`.

import { z } from "zod";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";
import { isSafeCount, safeText } from "./readDiagnosticSanitize.ts";

const safeString = z.string().refine((value) => safeText(value) === value);
export const safeCount = z.number().refine(isSafeCount);
const loadValue = z.number().nonnegative();

// Every entry names the process that wrote it: its pid and start, the
// sequence number it gave the entry, the dashboard revision it runs when
// known, its age when it wrote the entry, and the entry's wall-clock time.
// `kind` names what the entry records; readers skip kinds they do not know.
const processFields = {
  at: z.iso.datetime(),
  pid: safeCount,
  processStartedAt: z.iso.datetime(),
  seq: safeCount,
  revision: z.string().regex(commitShaPattern).optional(),
  processAgeMs: safeCount,
};

// One failed upstream read this process waited on (`./readDiagnostics.ts`).
const failedReadSchema = z.object({
  kind: z.literal("failed-read"),
  ...processFields,
  source: safeString,
  category: safeString,
  pin: z.string().regex(commitShaPattern).optional(),
  cause: safeString,
  ownerCause: safeString.optional(),
  failureCategory: z.enum(["local", "upstream", "unknown"]),
  dispatched: z.boolean(),
  queueWaitMs: safeCount.optional(),
  ownerPid: safeCount.optional(),
  ownerGeneration: safeCount.optional(),
  ownerProtocol: safeCount.optional(),
  elapsedMs: safeCount,
  status: safeCount.optional(),
  requestId: safeString.optional(),
  rateLimit: z
    .object({
      limit: safeCount.optional(),
      remaining: safeCount.optional(),
      reset: safeCount.optional(),
      resource: safeString.optional(),
      retryAfterSeconds: safeCount.optional(),
    })
    .optional(),
});

// One stall this process observed in its own event loop
// (`./eventLoopWatch.ts`): the longest delay it measured, the machine's load
// average then (1, 5, and 15 minutes), and how many stalls the entry folds
// together, `at` being the first one's start.
const stallSchema = z.object({
  kind: z.literal("stall"),
  ...processFields,
  delayMs: safeCount,
  loadAverage: z.tuple([loadValue, loadValue, loadValue]),
  stalls: safeCount.refine((count) => count >= 1),
});

// This process began writing to the record, or ended it on a clean close
// (`./incidentLifecycle.ts`). A process whose record has no end is lost.
const processStartedSchema = z.object({
  kind: z.literal("process-started"),
  ...processFields,
});
const processEndedSchema = z.object({
  kind: z.literal("process-ended"),
  ...processFields,
});

// Every kind the record holds; a later kind joins this union.
export const incidentEntrySchema = z.discriminatedUnion("kind", [
  failedReadSchema,
  stallSchema,
  processStartedSchema,
  processEndedSchema,
]);

export type IncidentEntry = z.infer<typeof incidentEntrySchema>;
export type FailedReadIncident = z.infer<typeof failedReadSchema>;
export type StallIncident = z.infer<typeof stallSchema>;

// The fields a writer gives an entry of each kind; the record adds who wrote
// it and, unless the writer names one, when.
type FactsOf<Entry> = Entry extends unknown
  ? Omit<Entry, keyof typeof processFields> & { readonly at?: string }
  : never;
export type IncidentFacts = FactsOf<IncidentEntry>;

// One entry's identity across the record: its writer's pid alone is not,
// since a later process may reuse it.
export const incidentIdentity = (entry: IncidentEntry): string =>
  `${String(entry.pid)}@${entry.processStartedAt}#${String(entry.seq)}`;
