// Frozen previous deployed scoped history reader from Open Dough 92574ccd3:
// it asked `intent=ci-history&scope&revision&through` and accepted the answer
// only as this rich shape, with each unit reference's membership. Only
// supporting imports are relocated to the unchanged shared validators in
// dashboard/src.
import { z } from "zod";
import { runIdentityShape } from "../../../src/baseCiConfirmation.ts";
import { commitIdSchema } from "../../../src/launchLanding.ts";
import { priorBuildReferenceSchema } from "./priorBuildReference.ts";

const provenance = z.enum(["exact", "equivalent", "later"]);
const runSchema = z.object({
  runUrl: z.url({ protocol: /^https?$/ }).optional(),
  ...runIdentityShape,
});
const entryFields = z.object({
  key: z.string().min(1),
  date: z.iso.datetime({ offset: true }),
  landings: z
    .array(
      z.object({
        revision: commitIdSchema,
        receivedAt: z.iso.datetime({ offset: true }),
        selected: z.boolean(),
        provenance: provenance.optional(),
      }),
    )
    .min(1),
  build: runSchema.extend({ revision: commitIdSchema, provenance }).optional(),
  run: runSchema.optional(),
  selected: z.boolean(),
  legacyReason: z.string().min(1).optional(),
});
const unit = z.enum(["case", "file"]);
const readingsSchema = z
  .array(
    z.discriminatedUnion("kind", [
      z.object({
        kind: z.literal("point"),
        unit,
        ms: z.number().nonnegative(),
        entry: z.string().min(1),
        segment: z.string().min(1),
      }),
      z.object({ kind: z.literal("gap"), unit, reason: z.string().min(1) }),
    ]),
  )
  .refine(
    (readings) =>
      new Set(readings.map((reading) => reading.unit)).size === readings.length,
  );

export const scopeHistorySchema = z.object({
  path: z.string().min(1),
  selectedRevision: commitIdSchema,
  availability: z.enum([
    "retained",
    "empty",
    "outside-retention",
    "uncollected",
    "order-unavailable",
  ]),
  entries: z.array(
    z.discriminatedUnion("kind", [
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
        .refine(
          (entry) => entry.reason !== undefined || entry.readings.length > 0,
        ),
    ]),
  ),
  references: z
    .array(
      z.object({
        unit,
        reason: z.string().optional(),
        reference: priorBuildReferenceSchema,
      }),
    )
    .optional(),
});

export type PreviousScopeHistory = z.infer<typeof scopeHistorySchema>;

// What the previous scoped reader accepted for `path` at `revision`,
// undefined when it reported an answer it did not understand.
export function previousScopeHistoryOf(
  body: unknown,
  path: string,
  revision: string,
): PreviousScopeHistory | undefined {
  const parsed = scopeHistorySchema.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.path !== path ||
    parsed.data.selectedRevision !== revision ||
    parsed.data.references?.some(
      ({ reference }) => reference.endpoint !== revision,
    ) === true
  )
    return undefined;
  return parsed.data;
}
