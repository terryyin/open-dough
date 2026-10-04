// The three labels a held Cursor screen can show, on a Running Cursor
// sessions row and on the story card. They name that screen, not story
// progress.
import { z } from "zod";

export const cursorHeldLabel = {
  followUp: "at the follow-up prompt",
  working: "working",
  waiting: "waiting for an answer",
} as const;

export const cursorHeldLabels = [
  cursorHeldLabel.followUp,
  cursorHeldLabel.working,
  cursorHeldLabel.waiting,
] as const;

export const cursorHeldLabelSchema = z.enum(cursorHeldLabels);

export type CursorHeldLabel = z.infer<typeof cursorHeldLabelSchema>;
