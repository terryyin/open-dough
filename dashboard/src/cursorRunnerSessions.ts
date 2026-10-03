// The Running Cursor sessions read. The launch record stays the session
// identity. The label is that client's current screen. A runner that is
// not running, or cannot be reached, answers no sessions.
import { z } from "zod";
import { cursorHeldLabelSchema } from "./cursorHeldLabel.ts";
import { agentLaunchEndpoint } from "./launchRequest.ts";
import { launchRecordSchema } from "./launchRecord.ts";

export const cursorRunnerSessionsEndpoint = `${agentLaunchEndpoint}/cursor-sessions`;

// Whether this read found a runner that is already accepting, and answered.
export const cursorRunnerStatusSchema = z.enum([
  "running",
  "not-running",
  "unreachable",
]);

export type CursorRunnerStatus = z.infer<typeof cursorRunnerStatusSchema>;

export const runningCursorSessionsSchema = z.object({
  runner: cursorRunnerStatusSchema,
  sessions: z.array(
    z.object({
      record: launchRecordSchema,
      label: cursorHeldLabelSchema,
    }),
  ),
});

export type RunningCursorSessions = z.infer<typeof runningCursorSessionsSchema>;
