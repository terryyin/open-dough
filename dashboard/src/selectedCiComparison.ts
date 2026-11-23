import { z } from "zod";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { storyCiComparisonSlotSchema } from "./storyCiComparison.ts";

const revision = z.string().regex(commitShaPattern);
const ciComparisonRangeSchema = z.object({ start: revision, end: revision });

export type CiComparisonRange = z.infer<typeof ciComparisonRangeSchema>;

export function selectedCiComparisonKey(
  source: PublishedSource,
  identity: string,
  range: CiComparisonRange,
): string {
  return JSON.stringify([
    source.id,
    source.repository.toLowerCase(),
    source.ref,
    source.backlogPath,
    identity,
    range.start,
    range.end,
  ]);
}

const reading = {
  source: z.string().min(1),
  identity: z.string().min(1),
  range: ciComparisonRangeSchema,
  checkedAt: z.iso.datetime(),
};

export const selectedCiComparisonAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    ...reading,
    kind: z.literal("selection"),
    phase: z.enum(["done", "taken"]),
    baseline: storyCiComparisonSlotSchema,
    selection: storyCiComparisonSlotSchema,
  }),
  z.object({
    ...reading,
    kind: z.literal("unavailable"),
    explanation: z.string().min(1),
  }),
]);

export type SelectedCiComparisonAnswer = z.infer<
  typeof selectedCiComparisonAnswerSchema
>;
