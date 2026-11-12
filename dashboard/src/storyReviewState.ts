// A done story's review state, kept per project and story identity on the
// machine serving the dashboard (`../server/storyReviewStates.ts`): the
// developer's judgment that they reviewed the story, independent of its
// sessions, launches and workspaces, and of the story review's snapshot marks
// (`./reviewMark.ts`). A story with no saved state is unreviewed. Local
// evidence only, never a published story fact.
import { z } from "zod";
import { workIdentitySchema } from "./launchRequest.ts";

// GET `?id=<project>` answers the project's reviewed story identities; POST
// with a change sets or clears one story's state and answers the same.
export const storyReviewStateEndpoint =
  "/__project-configuration/story-review-states";

export const storyReviewStatesAnswerSchema = z.object({
  reviewed: z.array(z.string()),
});
export type StoryReviewStatesAnswer = z.infer<
  typeof storyReviewStatesAnswerSchema
>;

// Names the story by its identity, never a path.
export const storyReviewStateChangeSchema = z.strictObject({
  identity: workIdentitySchema,
  reviewed: z.boolean(),
});
export type StoryReviewStateChange = z.infer<
  typeof storyReviewStateChangeSchema
>;
