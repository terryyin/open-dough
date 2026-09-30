// Delete record for a recorded launch (`./agentLaunch.ts`): the developer asks
// the local launch boundary (`../server/agentLaunchPlugin.ts`) to forget one
// recorded session whose state is still unknown. The endpoint, request, and
// answer are spelled once here, with no Node import, so the browser and the
// server read the same shapes. Only the dashboard's own record goes; the
// session and the conversation are never touched.

import { z } from "zod";
import { sessionHostSchema } from "./sessionReference.ts";
import {
  agentLaunchEndpoint,
  launchTextLimit,
  launchWithStateSchema,
} from "./agentLaunch.ts";

// Where a same-origin POST deletes one recorded session's record.
export const agentDeleteEndpoint = `${agentLaunchEndpoint}/delete`;

// Names the session to delete: the project and the full session id, as Mark
// as done takes them.
export const deleteRecordRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  session: z.string().min(1).max(launchTextLimit),
  host: sessionHostSchema.default("claude"),
});

// The answer to a delete: the record gone, or, when the boundary's own
// reading finds the state known, the record kept with that state.
export const deleteRecordAnswerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("deleted") }),
  z.object({ kind: z.literal("state-known"), record: launchWithStateSchema }),
]);

export type DeleteRecordAnswer = z.infer<typeof deleteRecordAnswerSchema>;
