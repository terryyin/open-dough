// A scope's collected test execution time, through one published Done result.
// The local read derives these observations from retained attempt proof; the
// browser never acquires historical CI evidence. The default answer
// (`CiScopeHistory`) keeps each build's landings, run and reference
// membership; the glance views read its slim projection (`ScopeHistoryGlance`,
// `../server/ciHistoryGlance.ts`).
import { z } from "zod";
import { runIdentityShape } from "./baseCiConfirmation.ts";
import { commitIdSchema } from "./launchLanding.ts";
import { runUrlSchema } from "./landedCiHistory.ts";
import {
  priorBuildFiguresSchema,
  priorBuildReferenceSchema,
} from "./ciPriorBuildReference.ts";

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
const unitSchema = z.enum(["case", "file"]);
const pointReadingSchema = z.object({
  kind: z.literal("point"),
  unit: unitSchema,
  ms: z.number().nonnegative(),
  entry: z.string().min(1),
  segment: z.string().min(1),
});
const gapReadingSchema = z.object({
  kind: z.literal("gap"),
  unit: unitSchema,
  reason: z.string().min(1),
});
export const scopeHistoryReadingSchema = z.discriminatedUnion("kind", [
  pointReadingSchema,
  gapReadingSchema,
]);
export type ScopeHistoryReading = z.infer<typeof scopeHistoryReadingSchema>;
// A build reads each unit at most once; a measured build measures at least
// one unit, and a build without timing reads only gaps.
type UnitReading = { readonly kind: string; readonly unit: string };
const uniqueUnits = (readings: readonly UnitReading[]) =>
  new Set(readings.map((reading) => reading.unit)).size === readings.length;
const measuresAUnit = (readings: readonly UnitReading[]) =>
  readings.some((reading) => reading.kind === "point");
const onlyGaps = (readings: readonly UnitReading[]) =>
  readings.every((reading) => reading.kind === "gap");
const readingsSchema = z.array(scopeHistoryReadingSchema).refine(uniqueUnits);
export const ciScopeHistoryEntrySchema = z.discriminatedUnion("kind", [
  entryFields.extend({
    kind: z.literal("point"),
    readings: readingsSchema.refine(measuresAUnit),
  }),
  entryFields
    .extend({
      kind: z.literal("gap"),
      readings: readingsSchema.refine(onlyGaps),
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
        unit: unitSchema,
        reason: z.string().optional(),
        reference: priorBuildReferenceSchema,
      }),
    )
    .optional(),
});
export type CiScopeHistory = z.infer<typeof ciScopeHistorySchema>;

// How a build without timing for a unit reads: a failed build, or any other
// unavailable timing, with its reason.
const typedGapSchema = z.object({
  status: z.enum(["failed", "unavailable"]),
  reason: gapReadingSchema.shape.reason,
});
// Each unit's reading without the entry it was read from, a gap typed.
const glanceReadingsSchema = z
  .array(
    z.discriminatedUnion("kind", [
      pointReadingSchema.omit({ entry: true }),
      gapReadingSchema.extend(typedGapSchema.shape),
    ]),
  )
  .refine(uniqueUnits);
// A dated build: whether it is the selected one, how it stands for each
// landing it represents, and its reading of each unit.
const glanceEntryFields = entryFields
  .pick({ key: true, date: true, selected: true })
  .extend({
    landings: z
      .array(landingSchema.pick({ selected: true, provenance: true }))
      .min(1),
  });
export const scopeHistoryGlanceSchema = z.object({
  path: ciScopeHistorySchema.shape.path,
  selectedRevision: commitIdSchema,
  availability: ciScopeHistorySchema.shape.availability,
  entries: z.array(
    z.discriminatedUnion("kind", [
      glanceEntryFields.extend({
        kind: z.literal("point"),
        readings: glanceReadingsSchema.refine(measuresAUnit),
      }),
      glanceEntryFields
        .extend({
          kind: z.literal("gap"),
          readings: glanceReadingsSchema.refine(onlyGaps),
          // Why the build has no timing for a unit it has no reading of.
          gap: typedGapSchema.optional(),
        })
        .refine(
          (entry) => entry.gap !== undefined || entry.readings.length > 0,
        ),
    ]),
  ),
  references: z
    .array(
      z.object({
        unit: unitSchema,
        reason: z.string().optional(),
        reference: priorBuildFiguresSchema,
      }),
    )
    .optional(),
});
export type ScopeHistoryGlance = z.infer<typeof scopeHistoryGlanceSchema>;
export type ScopeGlanceEntry = ScopeHistoryGlance["entries"][number];
