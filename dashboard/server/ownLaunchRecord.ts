// A story's latest durable launch since acceptance is its attempt's own:
// unresolved starts exclude another launch of that story. Recheck and Continue
// share this rule; neither host identity nor file order changes it.
import {
  storyOf,
  type LaunchAttemptRecord,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { attemptStory } from "../src/launchAttemptSelection.ts";

export function ownLaunchRecord(
  records: ReadonlyMap<string, readonly LaunchRecord[]>,
  attempt: Pick<LaunchAttemptRecord, "request" | "acceptedAt" | "publication">,
): LaunchRecord | undefined {
  const { request, acceptedAt } = attempt;
  const identity = attemptStory(attempt);
  if (!identity) return undefined;
  return (records.get(request.source) ?? [])
    .filter(
      (record) =>
        record.request.workflow === request.workflow &&
        storyOf(record.request) === identity &&
        record.request.source === request.source &&
        Date.parse(record.launchedAt) >= Date.parse(acceptedAt),
    )
    .sort((a, b) => Date.parse(b.launchedAt) - Date.parse(a.launchedAt))[0];
}
