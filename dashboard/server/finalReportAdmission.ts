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
export type AdmittedFinalReport = {
  readonly kind: "final-report";
  readonly record: LaunchRecord;
  readonly read: NonNullable<LaunchHost["readFinalReport"]>;
};

// Recorded Claude and Cursor launches read dashboard completion evidence:
// the retained explicit report is each host's result source, never a native
// final-answer extraction. Legacy Claude records keep their existing
// refusal, rather than implying a native reader.
function retainedFinalReportReader(
  record: LaunchRecord,
): AdmittedFinalReport["read"] | undefined {
  const { host } = record.session;
  if (
    (host !== "claude" && host !== "cursor") ||
    recordedWorkspace(record) === undefined
  )
    return undefined;
  const hostName = hostDescription(host).name;
  return () => {
    const { completion } = record;
    const nativeLimit = `${hostName} cannot read a native final report here. The saved conversation is unchanged.`;
    // No completion, quiet empty completed, and a nonempty attention message
    // are independent retained-reader answers. Missing workspace is panel-
    // composed separately and never substitutes for these facts.
    if (completion === undefined) {
      return Promise.resolve({
        kind: "unavailable",
        explanation: `No final dashboard message was saved. ${nativeLimit}`,
      });
    }
    if (completion.message === "") {
      return Promise.resolve({
        kind: "unavailable",
        explanation: `Quiet completion was recorded with no attention message. ${nativeLimit}`,
      });
    }
    return Promise.resolve({
      kind: "available",
      receipt: completion.receipt,
      text: completion.message,
    });
  };
}

export async function finalReportRequest(
  url: URL,
): Promise<AdmittedFinalReport> {
  requireExactQuery(url, ["source", "host", "session"], "final report");
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(url.searchParams.get("host"));
  const sessionId = url.searchParams.get("session");
  if (!host.success || !sessionId)
    throw new RefusedRequest(400, "The final report session is malformed.");
  const record = await keptSession(source.id, { host: host.data, sessionId });
  if (record === undefined) throw noSuchSession();
  const boundary = launchHost(record.session.host);
  const read =
    boundary?.readFinalReport?.bind(boundary) ??
    retainedFinalReportReader(record);
  if (read === undefined)
    throw new RefusedRequest(400, "This host cannot read a final report.");
  return { kind: "final-report", record, read };
}
