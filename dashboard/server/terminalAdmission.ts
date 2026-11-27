// Native terminal admission remains independent of passive report access.
import type { IncomingMessage } from "node:http";
import { attachOpens, recordedWorkspace, storyOf } from "../src/agentLaunch.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import { launchHost } from "./launchHosts.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { localFolder } from "./localFolder.ts";
import { knownSource, recordedSession } from "./sessionAdmission.ts";

// A loopback upgrade naming a session it may attach.
export async function admittedAttach(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
  verifyLocalOrigin(req);
  return attachableSession(url, launches);
}

// An upgrade attaches only a kept session through its host’s supported
// operation, in an existing folder, unless the host confirms it unavailable.
export async function attachableSession(
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
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
  const savedWorkspace =
    record.session.host === "claude"
      ? (recordedWorkspace(record) ?? record.defaultStart?.workspace)
      : undefined;
  return {
    sourceId: source.id,
    session: record.session,
    markedDone: record.doneAt !== undefined,
    folder:
      savedWorkspace !== undefined && storyOf(record.request) === undefined
        ? localFolder(savedWorkspace)
        : folder,
    ...(savedWorkspace === undefined ? {} : { savedWorkspace }),
  };
}
