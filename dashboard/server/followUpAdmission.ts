// A follow-up's context, resolved at admission from the records the server
// keeps (`../src/followUpContext.ts`); a request carrying context text a page
// composed is malformed. The
// resolved text stays on the request, so the attempt, its record, a retry,
// a recovery and a rebuilt first input all carry it without reading again,
// even after the source record is gone.

import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import { followUpContextText, sessionContext } from "../src/followUpContext.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";

export async function withFollowUpContext(
  request: AgentLaunchRequest,
  source: PublishedSource,
): Promise<AgentLaunchRequest> {
  if (request.workflow !== "ad-hoc" || request.followUp === undefined)
    return request;
  if (request.followUp.context !== undefined)
    throw new RefusedRequest(400, "The launch request is malformed.");
  const record = await keptSession(source.id, request.followUp.session);
  if (record === undefined)
    throw new RefusedRequest(
      404,
      "The session this follows up is no longer kept on this machine.",
    );
  return {
    ...request,
    followUp: {
      ...request.followUp,
      context: followUpContextText([sessionContext(record)]),
    },
  };
}
