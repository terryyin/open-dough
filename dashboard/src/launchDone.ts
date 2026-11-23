import { z } from "zod";

export const launchDoneSchema = z.object({
  doneAt: z.iso.datetime().optional(),
  // A developer's explicit Done or reopen takes precedence over an older report.
  dispositionChangedAt: z.iso.datetime().optional(),
  // Native operations may fail even though local Done intent was retained.
  doneProblem: z.string().max(1_200).optional(),
  // Story membership can outlive a reopen. Only an originating story supplies
  // local card facts; a linked story's facts are owned by its published record.
  doneStory: z
    .discriminatedUnion("kind", [
      z.object({
        kind: z.literal("originating"),
        identity: z.string().min(1),
        title: z.string().min(1),
        completedAt: z.iso.datetime(),
      }),
      z.object({
        kind: z.literal("linked"),
        identity: z.string().min(1),
      }),
    ])
    .optional(),
});
