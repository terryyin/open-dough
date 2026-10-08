// Developer-requested recovery of an unfinished Cursor session the runner
// does not hold. The endpoint, request, and answer are spelled once here so
// the browser and the server share the same shapes. Recover is offered only
// for the three not-held readings; held, done, and completed sessions never
// gain it.
import { z } from "zod";
import {
  agentLaunchEndpoint,
  launchTextLimit,
  launchWithStateSchema,
  type LaunchRecord,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { cursorRunnerSentence } from "./cursorRunnerSessions.ts";
import { sessionHostSchema } from "./sessionReference.ts";

export const agentRecoverEndpoint = `${agentLaunchEndpoint}/recover`;

export const recoverSessionRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  session: z.string().min(1).max(launchTextLimit),
  host: sessionHostSchema.default("claude"),
});

export const recoverSessionAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("recovered"),
    record: launchWithStateSchema,
  }),
  z.object({
    kind: z.literal("failed"),
    explanation: z.string().min(1),
    record: launchWithStateSchema.optional(),
  }),
]);

export type RecoverSessionAnswer = z.infer<typeof recoverSessionAnswerSchema>;

// Unfinished means not marked done, and the latest completion is missing or
// unfinished. A completed report is finished work even when it asks for
// attention.
export function sessionUnfinished(record: LaunchRecord): boolean {
  return (
    record.doneAt === undefined &&
    (record.completion === undefined ||
      record.completion.outcome === "unfinished")
  );
}

// Observation label for an unfinished Cursor session the runner does not hold
// while the runner is still running.
export const agentNotRunningLabel = "The agent is not running.";

const recoverLabels = new Set([
  agentNotRunningLabel,
  cursorRunnerSentence("not-running"),
  cursorRunnerSentence("unreachable"),
]);

// Whether this entry offers Recover: an unfinished Cursor session whose
// observation is one of the three not-held labels.
export function sessionRecoverable(record: LaunchWithState): boolean {
  if (record.session.host !== "cursor") return false;
  if (!sessionUnfinished(record)) return false;
  if (record.sessionState.kind !== "unknown") return false;
  return (
    record.sessionState.label !== undefined &&
    recoverLabels.has(record.sessionState.label)
  );
}
