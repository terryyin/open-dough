// Creation admission and response projection consume the host's native operation.
import {
  creationRecovery,
  type CreationRecord,
  type CreationView,
} from "../src/launchCreation.ts";
import type { LaunchHost } from "./launchHosts.ts";
import { launchHost } from "./launchHosts.ts";

type CreationHost = Pick<LaunchHost, "name" | "creationEvidence">;

export function creationView(
  record: CreationRecord,
  boundary: CreationHost | undefined = launchHost(record.request.host),
): CreationView {
  const args = boundary?.creationEvidence?.(record).inspectionArgs;
  return {
    ...record,
    recovery: {
      hostName: boundary?.name ?? record.request.host,
      ...(args === undefined || args.length === 0
        ? {}
        : { inspectionArgs: [...args] }),
    },
  };
}

export function creationProblem(
  boundary: CreationHost | undefined,
  evidence: CreationRecord | "unreadable" | undefined,
): string | undefined {
  if (boundary?.creationEvidence === undefined || evidence === undefined)
    return undefined;
  if (evidence === "unreadable")
    return `This machine's launch evidence for ${boundary.name} is unreadable. ${boundary.creationEvidence().unreadableAdvice} No new conversation was created.`;
  return creationRecovery(creationView(evidence, boundary));
}
