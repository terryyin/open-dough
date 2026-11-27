import { sessionContext, type FollowUpSection } from "./followUpContext.ts";
import { followUpSessionKey } from "./followUpRequest.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import {
  retainedSessionIdentifier,
  retainedSessionReference,
  storySessions,
  type StorySession,
} from "./storySessions.ts";

// The composer and admission use the same project and story boundaries.
export type FollowUpSession = StorySession;

export function isFollowUpSession({ request }: LaunchRecord): boolean {
  return request.workflow === "ad-hoc" && request.followUp !== undefined;
}

// Follow up targets a story's sessions other than follow-ups themselves.
export function storyFollowUpSessions(
  records: readonly LaunchRecord[] | undefined,
  published: readonly PublishedSessionRecord[],
  sourceId: string,
  identity: string,
): readonly FollowUpSession[] {
  return storySessions(records, published, sourceId, identity).filter(
    ({ retained }) => retained === undefined || !isFollowUpSession(retained),
  );
}

export function followUpSessionSelected(
  { choice, retained }: FollowUpSession,
  selected: ReadonlySet<string>,
): boolean {
  return (
    selected.has(followUpSessionKey(choice)) ||
    (retained !== undefined &&
      selected.has(followUpSessionKey(retainedSessionReference(retained))))
  );
}

export function followUpSessionContext({
  retained,
  published,
}: FollowUpSession): FollowUpSection {
  if (published === undefined) return sessionContext(retained);
  const local = retained === undefined ? undefined : sessionContext(retained);
  return {
    label: local?.label ?? "Published session",
    items: [
      { label: "Published session", value: published.sessionId },
      ...(local === undefined
        ? [{ label: "Workflow", value: published.workflow }]
        : []),
      ...published.ranges.map(({ base, candidate, uncertainty }, index) => ({
        label: `Recorded range ${index + 1}`,
        value: `${base} → ${candidate}${uncertainty === undefined ? "" : ` (${uncertainty})`}`,
      })),
      ...(local?.items ?? []),
    ],
  };
}

export function followUpSessionName(session: FollowUpSession, label: string) {
  if (session.retained === undefined)
    return `${label} ${session.published.sessionId}`;
  return `${label} · ${retainedSessionIdentifier(session.retained)}`;
}
