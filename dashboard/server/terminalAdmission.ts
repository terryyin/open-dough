// Native terminal admission remains independent of passive report access.
import type { IncomingMessage } from "node:http";
import { attachOpens } from "../src/agentLaunch.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import { launchHost } from "./launchHosts.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { knownSource, recordedSession } from "./sessionAdmission.ts";

// An upgrade attaches only a kept session through its host’s supported
// operation, in an existing folder, unless the host confirms it unavailable.
export async function admittedAttach(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
  verifyLocalOrigin(req);
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(
    url.searchParams.get("host") ?? "claude",
  );
  if (!host.success)
    throw new RefusedRequest(400, "The session host is malformed.");
  const { record, folder } = await recordedSession(launches, source, {
    sessionId: url.searchParams.get("session") ?? "",
    host: host.data,
  });
  const hostBoundary = launchHost(record.session.host);
  if (hostBoundary?.attach === undefined) {
    throw new RefusedRequest(
      400,
      "This host cannot open an embedded terminal.",
    );
  }
  const joined = await launches.stateOf(source, record);
  if (!attachOpens(joined.sessionState)) {
    throw new RefusedRequest(
      410,
      hostBoundary.description.unavailableSessionExplanation ??
        `The session is no longer available in ${hostBoundary.description.name}.`,
    );
  }
  return {
    sourceId: source.id,
    session: record.session,
    markedDone: record.doneAt !== undefined,
    folder,
  };
}
