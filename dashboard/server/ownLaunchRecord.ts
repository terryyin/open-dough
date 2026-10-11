// A story's latest durable launch since acceptance is its attempt's own:
// unresolved starts exclude another launch of that story. Recheck and Continue
// share this rule; neither host identity nor file order changes it.
import type { LaunchAttemptRecord, LaunchRecord } from "../src/agentLaunch.ts";

export function ownLaunchRecord(
  records: ReadonlyMap<string, readonly LaunchRecord[]>,
  { request, acceptedAt }: Pick<LaunchAttemptRecord, "request" | "acceptedAt">,
): LaunchRecord | undefined {
  if (request.workflow === "ad-hoc") return undefined;
  return (records.get(request.source) ?? [])
    .filter(
      (record) =>
        record.request.workflow === request.workflow &&
        record.request.identity === request.identity &&
        record.request.source === request.source &&
        Date.parse(record.launchedAt) >= Date.parse(acceptedAt),
    )
    .sort((a, b) => Date.parse(b.launchedAt) - Date.parse(a.launchedAt))[0];
}
