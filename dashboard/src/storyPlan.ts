// Typed projection of shared plan-slice facts. The shared reader owns meaning;
// a done status is recorded completion, not verification. Prospective Proof is
// never treated as accepted evidence. Unsupported layout is uninterpretable.

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

const interpretedPlanSlices = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("interpreted"),
    slices: z.array(planSliceSchema),
  }),
  z.object({
    status: z.literal("uninterpretable"),
    problem: z.string().min(1),
  }),
]);

export type PlanSlice = z.infer<typeof planSliceSchema>;

export type WorkPlanSlices =
  | { readonly status: "loading" }
  | { readonly status: "absent" }
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "uninterpretable";
      readonly problem: string;
    }
  | {
      readonly status: "interpreted";
      readonly slices: readonly PlanSlice[];
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
  if (parsed.data.status === "uninterpretable") {
    return {
      status: "uninterpretable",
      problem: parsed.data.problem,
    };
  }
  return {
    status: "interpreted",
    slices: parsed.data.slices,
  };
}

export function recordedCompleteCount(slices: readonly PlanSlice[]): number {
  return slices.filter((slice) => slice.status === "done").length;
}
