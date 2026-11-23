// Admits a completed-story association read for one retained session of a
// configured project. The browser names only source and session identity.
import type { ServerResponse } from "node:http";
import { completedStoryAssociationEndpoint } from "../src/completedStoryAssociation.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { completedStoryAssociation } from "./completedStoryAssociation.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { withResponseSignal } from "./responseSignal.ts";
import {
  knownSource,
  noSuchSession,
  requireExactQuery,
} from "./sessionAdmission.ts";

export type AdmittedCompletedStoryAssociation = {
  readonly kind: "completed-story-association";
  readonly sourceId: string;
  readonly host: string;
  readonly sessionId: string;
};

export async function completedStoryAssociationRequest(
  url: URL,
): Promise<AdmittedCompletedStoryAssociation> {
  requireExactQuery(url, ["source", "host", "session"], "completed-story");
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(url.searchParams.get("host"));
  const sessionId = url.searchParams.get("session");
  if (!host.success || sessionId === null || sessionId === "")
    throw new RefusedRequest(400, "The completed-story request is malformed.");
  const record = await keptSession(source.id, {
    host: host.data,
    sessionId,
  });
  if (record === undefined) throw noSuchSession();
  return {
    kind: "completed-story-association",
    sourceId: source.id,
    host: host.data,
    sessionId,
  };
}

export async function completedStoryAssociationResponse(
  request: AdmittedCompletedStoryAssociation,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const source = knownSource(request.sourceId);
  const record = await keptSession(source.id, {
    host: sessionHostSchema.parse(request.host),
    sessionId: request.sessionId,
  });
  if (record === undefined) throw noSuchSession();
  return {
    status: 200,
    body: await withResponseSignal(
      res,
      (signal) => completedStoryAssociation(source, record, signal),
      60_000,
    ),
  };
}

export { completedStoryAssociationEndpoint };
