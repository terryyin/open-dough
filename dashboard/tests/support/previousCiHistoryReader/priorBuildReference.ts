// Frozen previous deployed prior-build reference schema from Open Dough
// 92574ccd3, as its Done and scoped readers parsed it: every reference
// carries its per-build membership. Keep it independent of the current
// client schema.
import { z } from "zod";

const instantSchema = z.iso.datetime({ offset: true });
const measurement = {
  key: z.string(),
  date: instantSchema,
  ms: z.number().nonnegative().optional(),
  reason: z.string().optional(),
};
const evidenceSchema = z.object({
  ...measurement,
  status: z.enum(["included", "excluded", "selected"]),
});
export const priorBuildReferenceSchema = z.object({
  endpoint: z.string(),
  selected: z.object(measurement).optional(),
  evidence: z.array(evidenceSchema),
  sampleCount: z.number().int().nonnegative(),
  medianMs: z.number().nonnegative().optional(),
  averageMs: z.number().nonnegative().optional(),
  from: instantSchema.optional(),
  to: instantSchema.optional(),
  difference: z
    .object({
      text: z.string(),
      changeMs: z.number(),
      relative: z.number().optional(),
    })
    .optional(),
});
