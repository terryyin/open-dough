// Mark as read for a recorded launch's unread report (`./agentLaunch.ts`):
// the developer asks the local launch boundary
// (`../server/launchBoundaryAnswer.ts`) to keep that they read the session's
// report. The session is not stopped, renamed, detached, or marked done. The
// endpoint and answer are spelled once here, with no Node import, so the
// browser and the server read the same shapes. The mark is local evidence
// only and never a story fact.

import { z } from "zod";
import { agentLaunchEndpoint, launchWithStateSchema } from "./agentLaunch.ts";

// Where a same-origin POST marks one recorded session's report read. Its
// request names the session as Mark as done does (`./doneMark.ts`).
export const agentReadEndpoint = `${agentLaunchEndpoint}/read`;

// The answer to a read mark: the record, with its session's state.
export const markReadAnswerSchema = z.object({ record: launchWithStateSchema });
