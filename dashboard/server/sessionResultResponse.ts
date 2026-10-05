// Reads a session's native final report through its host.
import type { ServerResponse } from "node:http";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { launchHost } from "./launchHosts.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { withResponseSignal } from "./responseSignal.ts";

export async function sessionResultResponse(
  record: LaunchRecord,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return withResponseSignal(res, async (signal) => {
    const host = launchHost(record.session.host);
    if (host?.readResult === undefined)
      throw new RefusedRequest(400, "This host cannot read a final report.");
    return { status: 200, body: await host.readResult(record.session, signal) };
  });
}
