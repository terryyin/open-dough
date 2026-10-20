// Admission of a recorded session's passive final-report read: a kept
// session with its admitted reader, from its host boundary or, for
// recorded Claude and Cursor launches, its retained explicit report.
import { recordedWorkspace, type LaunchRecord } from "../src/agentLaunch.ts";
import { hostDescription } from "../src/hostDescription.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { launchHost, type LaunchHost } from "./launchHosts.ts";
import {
  knownSource,
  noSuchSession,
  requireExactQuery,
} from "./sessionAdmission.ts";

// A kept session with its admitted passive final-report reader.
export type AdmittedResult = {
  readonly kind: "result";
  readonly record: LaunchRecord;
  readonly read: NonNullable<LaunchHost["readResult"]>;
};

// Recorded Claude and Cursor launches read dashboard completion evidence:
// the retained explicit report is each host's result source, never a native
// final-answer extraction. Legacy Claude records keep their existing
// refusal, rather than implying a native reader.
function retainedResultReader(
  record: LaunchRecord,
): AdmittedResult["read"] | undefined {
  const { host } = record.session;
  if (
    (host !== "claude" && host !== "cursor") ||
    recordedWorkspace(record) === undefined
  )
    return undefined;
  const hostName = hostDescription(host).name;
  return () => {
    const { completion } = record;
    if (completion === undefined || completion.message === "") {
      return Promise.resolve({
        kind: "unavailable",
        explanation: `No retained final report is available. ${hostName} cannot read a native final report here. The saved conversation is unchanged.`,
      });
    }
    return Promise.resolve({
      kind: "available",
      receipt: completion.receipt,
      text: completion.message,
    });
  };
}

export async function resultRequest(url: URL): Promise<AdmittedResult> {
  requireExactQuery(url, ["source", "host", "session"], "result");
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(url.searchParams.get("host"));
  const sessionId = url.searchParams.get("session");
  if (!host.success || !sessionId)
    throw new RefusedRequest(400, "The result session is malformed.");
  const record = await keptSession(source.id, { host: host.data, sessionId });
  if (record === undefined) throw noSuchSession();
  const boundary = launchHost(record.session.host);
  const read =
    boundary?.readResult?.bind(boundary) ?? retainedResultReader(record);
  if (read === undefined)
    throw new RefusedRequest(400, "This host cannot read a final report.");
  return { kind: "result", record, read };
}
