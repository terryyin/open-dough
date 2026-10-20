// Stop for a recorded launch (`./agentLaunch.ts`): the developer asks the
// local launch boundary (`../server/sessionStop.ts`) to stop one recorded
// session through its host, confirmed only by the host's re-observation.
// Stop is separate from Mark as done: it never writes the done mark. The
// endpoint, request, and answer are spelled once here, with no Node import,
// so the browser and the server read the same shapes.

import { z } from "zod";
import { sessionHostSchema } from "./sessionReference.ts";
import { agentLaunchEndpoint, launchTextLimit } from "./launchRequest.ts";
import { launchWithStateSchema } from "./launchRecord.ts";

// Where a same-origin POST stops one recorded session.
export const agentStopEndpoint = `${agentLaunchEndpoint}/stop`;

// Names the session to stop: the project and the full session id.
export const stopSessionRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  session: z.string().min(1).max(launchTextLimit),
  host: sessionHostSchema.default("claude"),
});

// The answer to a stop: confirmed only when the host re-observed the
// session no longer held/working, with the record un-done either way. An
// unconfirmed stop retains its explanation on the record.
export const stopSessionAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("stopped"),
    record: launchWithStateSchema,
  }),
  z.object({
    kind: z.literal("unconfirmed"),
    explanation: z.string().min(1),
    record: launchWithStateSchema,
  }),
]);

export type StopSessionAnswer = z.infer<typeof stopSessionAnswerSchema>;

// What a launch answers before anything is accepted when a session in the
// same workspace carries an unconfirmed stop: the competing-writer risk
// the developer must explicitly override to start a replacement.
export const stopUnconfirmedFoundSchema = z.object({
  kind: z.literal("stop-unconfirmed"),
  explanation: z.string().min(1),
  workspace: z.string().min(1),
});

export type StopUnconfirmedFound = z.infer<typeof stopUnconfirmedFoundSchema>;
