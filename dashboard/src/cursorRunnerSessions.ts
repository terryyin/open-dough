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

// What a read says about the Cursor runner itself. A held client's screen
// label is that screen's own words.
export function cursorRunnerSentence(
  runner: CursorRunnerStatus | "reading",
): string {
  switch (runner) {
    case "reading":
      return "Reading the Cursor runner…";
    case "running":
      return "The Cursor runner is running.";
    case "not-running":
      return "The Cursor runner is not running.";
    case "unreachable":
      return "The Cursor runner cannot be reached.";
  }
}

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
