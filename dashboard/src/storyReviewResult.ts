import { z } from "zod";
import {
  intentLocationSchema,
  intentSettingsProblemSchema,
} from "./authenticatedIntentRead.ts";
import { objectIdSchema } from "./storyReviewFiles.ts";
import type { ReviewedStorySubject } from "./reviewedWorkSubject.ts";

export const storyReviewResultEndpoint = "/__agent-launch/review/result";

export type StoryReviewResultRead = {
  readonly subject: ReviewedStorySubject;
  readonly tree: string;
  readonly path?: string;
} & (
  | { readonly completion: string }
  | { readonly publishedHead: string }
  | { readonly reference: string }
);

export function storyReviewResultQuery({
  subject: { source, identity },
  ...result
}: StoryReviewResultRead): Record<string, string> {
  return { source, identity, ...result };
}

const resultRevision = { revision: objectIdSchema };
const resultPath = { ...resultRevision, path: z.string() };
export const storyReviewResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("inventory"),
    ...resultRevision,
    paths: z.array(z.string()),
    locations: z.array(intentLocationSchema).nullable(),
    settingsProblem: intentSettingsProblemSchema.optional(),
  }),
  z.object({ kind: z.literal("text"), ...resultPath, text: z.string() }),
  z.object({ kind: z.literal("absent"), ...resultPath }),
  z.object({
    kind: z.literal("unavailable"),
    ...resultRevision,
    path: z.string().optional(),
    explanation: z.string(),
  }),
]);

export type StoryReviewResult = z.infer<typeof storyReviewResultSchema>;
