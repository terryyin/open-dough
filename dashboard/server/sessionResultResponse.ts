// Reads a session's native final report through its admitted host reader.
import type { ServerResponse } from "node:http";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import type { AdmittedResult } from "./sessionAdmission.ts";
import { withResponseSignal } from "./responseSignal.ts";

export async function sessionResultResponse(
  { record, read }: AdmittedResult,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return withResponseSignal(res, async (signal) => ({
    status: 200,
    body: await read(record.session, signal),
  }));
}
