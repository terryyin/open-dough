import { isOpen, storySessionsOf } from "./agentLaunch.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import type { SessionReference } from "./sessionReference.ts";

// The same retained candidates are offered by the composer and admitted at
// Start. Their identity is native to the host and scoped to this project/story.
export function retainedStoryFollowUpSessions<Session extends LaunchRecord>(
  records: readonly Session[] | undefined,
  sourceId: string,
  identity: string,
): readonly Session[] {
  return storySessionsOf(records, sourceId, identity).filter(
    (record) => !isOpen(record),
  );
}

export function retainedFollowUpReference({
  session: { host, sessionId },
}: LaunchRecord): SessionReference {
  return { host, sessionId };
}
