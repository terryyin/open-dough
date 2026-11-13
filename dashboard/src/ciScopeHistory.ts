// A scope's collected test execution time, through one published Done result.
// The local read derives these observations from retained attempt proof; the
// browser never acquires historical CI evidence.
import { z } from "zod";
import { runIdentityShape } from "./baseCiConfirmation.ts";
import { commitIdSchema } from "./launchLanding.ts";
import { runUrlSchema } from "./landedCiHistory.ts";
import { priorBuildReferenceSchema } from "./ciPriorBuildReference.ts";

// The gap reason a failed measured build gives every requested unit.
export const failedBuildReason = "Failed CI build";

export type ScopeHistoryEndpoint = {
  readonly revision: string;
  readonly at: string;
};

const landingSchema = z.object({
  revision: commitIdSchema,
  receivedAt: z.iso.datetime({ offset: true }),
  selected: z.boolean(),
  provenance: z.enum(["exact", "equivalent", "later"]).optional(),
});
export const ciScopeHistoryRunSchema = z.object({
  runUrl: runUrlSchema.optional(),
  ...runIdentityShape,
});
const buildSchema = ciScopeHistoryRunSchema.extend({
  revision: commitIdSchema,
  provenance: z.enum(["exact", "equivalent", "later"]),
});
const entryFields = z.object({
  key: z.string().min(1),
  date: z.iso.datetime({ offset: true }),
  landings: z.array(landingSchema).min(1),
  build: buildSchema.optional(),
  // A pending gap can name an attempt without claiming a measured build.
  run: ciScopeHistoryRunSchema.optional(),
  selected: z.boolean(),
  legacyReason: z.string().min(1).optional(),
});
export const scopeHistoryReadingSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("point"),
    unit: z.enum(["case", "file"]),
    ms: z.number().nonnegative(),
    entry: z.string().min(1),
    segment: z.string().min(1),
  }),
  z.object({
    kind: z.literal("gap"),
    unit: z.enum(["case", "file"]),
    reason: z.string().min(1),
  }),
]);
export type ScopeHistoryReading = z.infer<typeof scopeHistoryReadingSchema>;
const readingsSchema = z
  .array(scopeHistoryReadingSchema)
  .refine(
    (readings) =>
      new Set(readings.map((reading) => reading.unit)).size === readings.length,
  );
export const ciScopeHistoryEntrySchema = z.discriminatedUnion("kind", [
  entryFields.extend({
    kind: z.literal("point"),
    readings: readingsSchema.refine((readings) =>
      readings.some((reading) => reading.kind === "point"),
    ),
  }),
  entryFields
    .extend({
      kind: z.literal("gap"),
      readings: readingsSchema.refine((readings) =>
        readings.every((reading) => reading.kind === "gap"),
      ),
      reason: z.string().min(1).optional(),
    })
    .refine((entry) => entry.reason !== undefined || entry.readings.length > 0),
]);
export type ScopeHistoryEntry = z.infer<typeof ciScopeHistoryEntrySchema>;
export const ciScopeHistorySchema = z.object({
  path: z.string().min(1),
  selectedRevision: commitIdSchema,
  availability: z.enum([
    "retained",
    "empty",
    "outside-retention",
    "uncollected",
    "order-unavailable",
  ]),
  entries: z.array(ciScopeHistoryEntrySchema),
  references: z
    .array(
      z.object({
        unit: z.enum(["case", "file"]),
        reason: z.string().optional(),
        reference: priorBuildReferenceSchema,
      }),
    )
    .optional(),
});
export type CiScopeHistory = z.infer<typeof ciScopeHistorySchema>;
