// The three labels a Running Cursor sessions row can show. They name the
// held client's current screen, not story progress.
import { z } from "zod";

export const cursorHeldLabels = [
  "at the follow-up prompt",
  "working",
  "waiting for an answer",
] as const;

export const cursorHeldLabelSchema = z.enum(cursorHeldLabels);

export type CursorHeldLabel = z.infer<typeof cursorHeldLabelSchema>;
