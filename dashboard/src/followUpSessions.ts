import { isOpen, projectSessionsOf, storySessionsOf } from "./agentLaunch.ts";
import { sessionContext, type FollowUpSection } from "./followUpContext.ts";
import {
  followUpSessionKey,
  type FollowUpSessionChoice,
} from "./followUpRequest.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import { hostName } from "./sessionCapabilities.ts";
import { reportingReferenceOf } from "./sessionListing.ts";
import type { SessionReference } from "./sessionReference.ts";

// The composer and admission use the same project and story boundaries.
export type FollowUpSession = {
  readonly choice: FollowUpSessionChoice;
} & (
  | {
      readonly retained: LaunchRecord;
      readonly published?: undefined;
    }
  | {
      readonly retained: LaunchRecord;
      readonly published: PublishedSessionRecord;
    }
  | {
      readonly retained?: undefined;
      readonly published: PublishedSessionRecord;
    }
);

export function isFollowUpSession({ request }: LaunchRecord): boolean {
  return request.workflow === "ad-hoc" && request.followUp !== undefined;
}

export function storyFollowUpSessions(
  records: readonly LaunchRecord[] | undefined,
  published: readonly PublishedSessionRecord[],
  sourceId: string,
  identity: string,
): readonly FollowUpSession[] {
  const sessions = new Map<string, FollowUpSession>();
  const localByReference = new Map(
    projectSessionsOf(records, sourceId)?.map((retained) => [
      reportingReferenceOf(retained),
      retained,
    ]),
  );
  for (const retained of storySessionsOf(records, sourceId, identity)) {
    if (isOpen(retained) || isFollowUpSession(retained)) continue;
    const reference = reportingReferenceOf(retained);
    const choice =
      reference === undefined
        ? retainedFollowUpReference(retained)
        : { published: reference };
    const key = followUpSessionKey(choice);
    if (!sessions.has(key)) sessions.set(key, { choice, retained });
  }
  for (const record of published) {
    if (record.story !== identity) continue;
    const choice = { published: record.sessionId };
    const key = followUpSessionKey(choice);
    const retained =
      sessions.get(key)?.retained ?? localByReference.get(record.sessionId);
    if (retained !== undefined && isFollowUpSession(retained)) continue;
    sessions.set(
      key,
      retained === undefined
        ? { choice, published: record }
        : { choice, published: record, retained },
    );
  }
  return [...sessions.values()];
}

export function retainedFollowUpReference({
  session: { host, sessionId },
}: LaunchRecord): SessionReference {
  return { host, sessionId };
}

export function followUpSessionSelected(
  { choice, retained }: FollowUpSession,
  selected: ReadonlySet<string>,
): boolean {
  return (
    selected.has(followUpSessionKey(choice)) ||
    (retained !== undefined &&
      selected.has(followUpSessionKey(retainedFollowUpReference(retained))))
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
  const { host, sessionId } = session.retained.session;
  return `${label} · ${hostName(host)} · ${sessionId}`;
}
