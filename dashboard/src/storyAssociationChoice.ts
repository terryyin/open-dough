import { z } from "zod";
import { agentLaunchEndpoint } from "./launchRequest.ts";
import { sessionHostSchema } from "./sessionReference.ts";

export const storyAssociationChoiceEndpoint = `${agentLaunchEndpoint}/choose-story`;

const candidates = z.object({
  close: z.uuid(),
  retained: z.string().min(1),
  published: z.string().min(1),
});

export const storyAssociationChoiceSchema = candidates.extend({
  selected: z.enum(["retained", "published"]),
});
export type StoryAssociationChoice = z.infer<
  typeof storyAssociationChoiceSchema
>;
export type StoryAssociationCandidates = z.infer<typeof candidates>;

export const storyAssociationChoiceRequestSchema = z.strictObject({
  source: z.string().min(1),
  host: sessionHostSchema,
  session: z.string().min(1),
  choice: storyAssociationChoiceSchema.strict(),
});

export const storyAssociationChoiceReceiptSchema = z.object({
  saved: z.literal(true),
});

export function sameStoryAssociation(
  left: StoryAssociationCandidates | undefined,
  right: StoryAssociationCandidates,
) {
  return (
    left?.close === right.close &&
    left.retained === right.retained &&
    left.published === right.published
  );
}
