// Catalog and kept host-qualified identity are shared across local session requests.
// Passive report admission does not require a project or continuation directory.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { sourceById, type PublishedSource } from "../src/publishedSource.ts";
import {
  sessionHostSchema,
  type SessionReference,
} from "../src/sessionReference.ts";
import type { AgentLaunches, Recorded } from "./agentLaunches.ts";
import { launchHost } from "./launchHosts.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";

export function knownSource(id: string | null): PublishedSource {
  const source = id === null ? undefined : sourceById(id);
  if (source === undefined) {
    throw new RefusedRequest(404, "Unknown catalog source.");
  }
  return source;
}

// A kept session and its existing folder, or a refusal.
export async function recordedSession(
  launches: AgentLaunches,
  source: PublishedSource,
  session: SessionReference,
): Promise<Extract<Recorded, { readonly kind: "recorded" }>> {
  const recorded = await launches.recorded(source, session);
  switch (recorded.kind) {
    case "recorded":
      return recorded;
    case "unrecorded":
      throw new RefusedRequest(
        404,
        "This dashboard launched no such session for this project.",
      );
    case "folder-not-found":
      throw new RefusedRequest(
        404,
        `The project folder ${recorded.folder.shown} was not found on this machine.`,
      );
  }
}

export async function resultRequest(
  url: URL,
): Promise<{ readonly kind: "result"; readonly record: LaunchRecord }> {
  const keys = [...url.searchParams.keys()];
  if (
    keys.length !== 3 ||
    new Set(keys).size !== 3 ||
    keys.some((key) => !["source", "host", "session"].includes(key))
  )
    throw new RefusedRequest(400, "The result request is malformed.");
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(url.searchParams.get("host"));
  const sessionId = url.searchParams.get("session");
  if (!host.success || !sessionId)
    throw new RefusedRequest(400, "The result session is malformed.");
  const record = await keptSession(source.id, { host: host.data, sessionId });
  if (record === undefined)
    throw new RefusedRequest(
      404,
      "This dashboard launched no such session for this project.",
    );
  if (launchHost(record.session.host)?.readResult === undefined)
    throw new RefusedRequest(400, "This host cannot read a final report.");
  return { kind: "result", record };
}
