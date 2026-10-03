// Native conversation identity and continuation remain specific to each host.
import { z } from "zod";

const claudeSessionSchema = z.object({
  host: z.literal("claude"),
  sessionId: z.string().min(1),
  shortId: z.string().min(1),
  name: z.string(),
});

const codexSessionSchema = z.object({
  host: z.literal("codex"),
  sessionId: z.string().min(1),
  name: z.string(),
  continuation: z
    .object({
      workspace: z.string().min(1),
      endpoint: z.string().min(1),
      args: z.array(z.string()),
      // Context for continuing a conversation after native observation ends.
      notice: z.string().optional(),
    })
    .optional(),
});

// The printed create-chat id, plus the workspace and resume command that
// continue it. No alias and no endpoint.
const cursorSessionSchema = z.object({
  host: z.literal("cursor"),
  sessionId: z.uuid(),
  name: z.string(),
  continuation: z.object({
    workspace: z.string().min(1),
    args: z.array(z.string()),
  }),
});

export const hostSessionSchema = z.discriminatedUnion("host", [
  claudeSessionSchema,
  codexSessionSchema,
  cursorSessionSchema,
]);

export type ClaudeSession = z.infer<typeof claudeSessionSchema>;
export type CodexSession = z.infer<typeof codexSessionSchema>;
export type CursorSession = z.infer<typeof cursorSessionSchema>;
export type HostSession = z.infer<typeof hostSessionSchema>;
