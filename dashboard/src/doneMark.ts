// Mark as done for a recorded launch (`./agentLaunch.ts`): the developer asks
// the local launch boundary (`../server/doneMarks.ts`) to rename one recorded
// session `done-<name>` and stop it. The endpoint, request, answer, and the
// `done-` name are spelled once here, with no Node import, so the browser and
// the server read the same shapes. The mark is local evidence only and never
// a story fact.

import { z } from "zod";
import { sessionHostSchema } from "./sessionReference.ts";
import {
  agentLaunchEndpoint,
  launchTextLimit,
  launchWithStateSchema,
  type HostSession,
} from "./agentLaunch.ts";

// Where a same-origin POST marks one recorded session done.
export const agentDoneEndpoint = `${agentLaunchEndpoint}/done`;

// Names the session to mark done: the project and the full session id, as
// the terminal boundary takes them.
export const markDoneRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  session: z.string().min(1).max(launchTextLimit),
  host: sessionHostSchema.default("claude"),
});

// The answer to a done mark: the marked record, with its session's state
// after the attempted native operations; the local mark is independent.
export const markDoneAnswerSchema = z.object({ record: launchWithStateSchema });

// The name Mark as done gives a session: its launch name with the `done-`
// prefix. The original base name remains in the record; operation failures
// display the intended name rather than claim a confirmed native rename.
export function doneSessionName(session: Pick<HostSession, "name">): string {
  return `done-${session.name}`;
}

// What a done mark says between a quiet report's receipt and its native Done:
// the local mark is kept, the rename still to come. It is no problem.
export const nativeDoneMarkPending =
  "Local done mark retained. Native done mark is pending.";
