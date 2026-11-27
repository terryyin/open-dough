// A done story's review state, kept per project and story identity on the
// machine serving the dashboard (`../server/storyReviewStates.ts`): the
// developer's judgment, saved at `reviewedAt`, that they reviewed the story's
// sessions completed by then. Beside it, explicit marks of single sessions by
// their identity (`./recentlyDoneListing.ts`), each winning over
// `reviewedAt`. A story with no saved state is unreviewed.
// Local evidence only, never a published story fact.
import { z } from "zod";
import { workIdentitySchema } from "./launchRequest.ts";

// GET `?id=<project>` answers the project's saved story review states by
// story identity; POST with a change sets or clears one story's or one
// session's state and answers the same.
export const storyReviewStateEndpoint =
  "/__project-configuration/story-review-states";

export const storyReviewMarkSchema = z.object({
  reviewedAt: z.iso.datetime().optional(),
  sessions: z.record(z.string(), z.boolean()).optional(),
});
export type StoryReviewMark = z.infer<typeof storyReviewMarkSchema>;

export const storyReviewStatesAnswerSchema = z.object({
  stories: z.record(z.string(), storyReviewMarkSchema),
});
export type StoryReviewStatesAnswer = z.infer<
  typeof storyReviewStatesAnswerSchema
>;

// Names the story by its identity, never a path, and, for one session's
// explicit mark, the session by its identity. A story's change replaces its
// sessions' explicit marks.
export const storyReviewStateChangeSchema = z.strictObject({
  identity: workIdentitySchema,
  session: z.string().min(1).max(200).optional(),
  reviewed: z.boolean(),
});
export type StoryReviewStateChange = z.infer<
  typeof storyReviewStateChangeSchema
>;
