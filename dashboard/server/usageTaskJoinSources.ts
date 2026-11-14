// Attribution proves the native task boundary. Descriptive metadata and activity
// provenance remain on the task instead of multiplying into every response join.
import { uniqueFacts } from "./usageReconciliation.ts";
import type { UsageTask } from "./usageRecords.ts";
export function usageTaskJoinSources(task: UsageTask) {
  const fields = task.fieldSources;
  const sources = [
    ...(fields?.["rootTurnId"] ?? []),
    ...(fields?.["launchReference"] ?? []),
    ...(fields?.["sessionId"] ?? []),
  ];
  return sources.length ? uniqueFacts(sources) : task.sources;
}
