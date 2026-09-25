// Typed projection of shared plan-slice facts. The shared reader owns meaning;
// a done status is recorded completion, not verification. Prospective Proof is
// never treated as accepted evidence. Unsupported layout is uninterpretable.
// A plan's execution-complete record is read by the same reader, beside and
// independent of its slices: its product advice as recorded, or its gap.

import { z } from "zod";
import { readPlanSlices } from "../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import { ReadProblem } from "./readProblem.ts";

const planSliceSchema = z.object({
  index: z.number().int().positive(),
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(["planned", "done"]),
  proof: z.string().min(1).optional(),
  accepted: z.string().min(1).optional(),
});

const planCompletionSchema = z.union([
  z.strictObject({ advice: z.string().min(1) }),
  z.strictObject({ problem: z.string().min(1) }),
]);

const interpretedPlanSlices = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("interpreted"),
    slices: z.array(planSliceSchema),
    completion: planCompletionSchema.optional(),
  }),
  z.object({
    status: z.literal("uninterpretable"),
    problem: z.string().min(1),
    completion: planCompletionSchema.optional(),
  }),
]);

export type PlanSlice = z.infer<typeof planSliceSchema>;

// The plan's execution-complete record: its product advice as recorded, or
// the gap when the record has no readable advice. Absent without a record.
export type PlanCompletion = z.infer<typeof planCompletionSchema>;

export type WorkPlanSlices =
  | { readonly status: "loading" }
  | { readonly status: "absent" }
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "uninterpretable";
      readonly problem: string;
      readonly completion?: PlanCompletion;
    }
  | {
      readonly status: "interpreted";
      readonly slices: readonly PlanSlice[];
      readonly completion?: PlanCompletion;
    };

export function interpretPlanSlices(
  source: string,
): Exclude<
  WorkPlanSlices,
  { readonly status: "loading" | "absent" | "unavailable" }
> {
  let raw: unknown;
  try {
    raw = readPlanSlices(source);
  } catch (error) {
    const reported = error instanceof Error ? error.message : String(error);
    return {
      status: "uninterpretable",
      problem: `The shared plan reader reports: “${reported}”`,
    };
  }
  const parsed = interpretedPlanSlices.safeParse(raw);
  if (!parsed.success) {
    throw new ReadProblem(
      "The shared plan reader answered in a shape this dashboard does not understand.",
    );
  }
  const { completion } = parsed.data;
  const recorded = completion === undefined ? {} : { completion };
  if (parsed.data.status === "uninterpretable") {
    return {
      status: "uninterpretable",
      problem: parsed.data.problem,
      ...recorded,
    };
  }
  return {
    status: "interpreted",
    slices: parsed.data.slices,
    ...recorded,
  };
}

export function recordedCompleteCount(slices: readonly PlanSlice[]): number {
  return slices.filter((slice) => slice.status === "done").length;
}
