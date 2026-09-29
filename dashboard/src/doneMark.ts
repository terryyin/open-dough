// Mark as done for a recorded launch (`./agentLaunch.ts`): the developer asks
// the local launch boundary (`../server/doneMarks.ts`) to rename one recorded
// session `done-<name>` and stop it. The endpoint, request, answer, and the
// `done-` name are spelled once here, with no Node import, so the browser and
// the server read the same shapes. The mark is local evidence only and never
// a story fact.

import { z } from "zod";
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
});

// The answer to a done mark: the marked record, with its session's state
// once stopped.
export const markDoneAnswerSchema = z.object({ record: launchWithStateSchema });

// The name Mark as done gives a session: its launch name with the `done-`
// prefix, in Claude Code when the rename is confirmed there and always in the
// dashboard's own record.
export function doneSessionName(session: Pick<HostSession, "name">): string {
  return `done-${session.name}`;
}
