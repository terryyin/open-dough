// The browser's GET of the machine's sessions from the local launch boundary
// (`../server/launchBoundary.ts`), naming the revision it holds, if any
// (`./machineSessionsRevision.ts`). What it answers crossed a process/HTTP
// boundary, so it is checked as external input.

import { agentLaunchEndpoint, type MachineAnswer } from "./agentLaunch.ts";
import {
  machineSessionsReadSchema,
  sessionsFreshHeader,
  sessionsRevisionHeader,
  type MachineSessionsRead,
} from "./machineSessionsRevision.ts";

export type MachineSessionsReadOptions = {
  // The read must be answered by an observation begun after it arrived
  // (`./machineSessionsRevision.ts` `sessionsFreshHeader`).
  readonly fresh?: boolean;
};

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
// asker's latest full answer, still stands. `options.fresh` names the ask
// for an observation begun after it arrived; ordinary polls omit it.
export async function readMachineSessionsSince(
  held: string | undefined,
  signal?: AbortSignal,
  options?: MachineSessionsReadOptions,
): Promise<MachineSessionsRead | undefined> {
  try {
    const headers: Record<string, string> = {};
    if (held !== undefined) headers[sessionsRevisionHeader] = held;
    if (options?.fresh === true) headers[sessionsFreshHeader] = "1";
    const response = await fetch(agentLaunchEndpoint, {
      signal: signal ?? null,
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    });
    if (!response.ok) return undefined;
    const answer = machineSessionsReadSchema.safeParse(await response.json());
    return answer.success ? answer.data : undefined;
  } catch {
    return undefined;
  }
}
