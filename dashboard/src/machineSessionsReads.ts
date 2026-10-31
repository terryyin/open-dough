// The browser's GET of the machine's sessions from the local launch boundary
// (`../server/launchBoundary.ts`), naming the revision it holds, if any
// (`./machineSessionsRevision.ts`). What it answers crossed a process/HTTP
// boundary, so it is checked as external input.

import { agentLaunchEndpoint, type MachineAnswer } from "./agentLaunch.ts";
import {
  machineSessionsReadSchema,
  sessionsRevisionHeader,
  type MachineSessionsRead,
} from "./machineSessionsRevision.ts";

// The machine's sessions: the launch records this machine keeps for every
// project, each naming its project, oldest first within it, with its
// session's current state, and whether the server can alert, or undefined
// when no trustworthy answer came.
export async function readMachineSessions(
  signal?: AbortSignal,
): Promise<MachineAnswer | undefined> {
  const answer = await readMachineSessionsSince(undefined, signal);
  return answer === undefined || "unchanged" in answer ? undefined : answer;
}

// The machine's sessions as `readMachineSessions` reads them, with the
// revision a full answer reports, or only that `held`, the revision of the
// asker's latest full answer, still stands.
export async function readMachineSessionsSince(
  held: string | undefined,
  signal?: AbortSignal,
): Promise<MachineSessionsRead | undefined> {
  try {
    const response = await fetch(agentLaunchEndpoint, {
      signal: signal ?? null,
      ...(held !== undefined && {
        headers: { [sessionsRevisionHeader]: held },
      }),
    });
    if (!response.ok) return undefined;
    const answer = machineSessionsReadSchema.safeParse(await response.json());
    return answer.success ? answer.data : undefined;
  } catch {
    return undefined;
  }
}
