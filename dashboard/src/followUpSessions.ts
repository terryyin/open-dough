import { isOpen, projectSessionsOf, storySessionsOf } from "./agentLaunch.ts";
import { sessionContext, type FollowUpSection } from "./followUpContext.ts";
import {
  followUpSessionKey,
  type FollowUpSessionChoice,
} from "./followUpRequest.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import {
  launchKindName,
  launchSubject,
  sessionWorkflowName,
} from "./launchWorkflow.ts";
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

// A story's completed sessions, once each by reporting reference, from this
// machine's retained launches and the published records, ad hoc follow-ups
// included.
export function storySessions(
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
    if (isOpen(retained)) continue;
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
    sessions.set(
      key,
      retained === undefined
        ? { choice, published: record }
        : { choice, published: record, retained },
    );
  }
  return [...sessions.values()];
}

// A session as one of Intent's review scopes: keyed once by its reporting
// reference and carrying its published record's UUID when one is listed. An
// ad hoc session is named by its retained launch's title, otherwise as
// "Title unavailable" with its close time; other sessions by their workflow
// and time.
export type SessionScope = {
  readonly key: string;
  readonly label: string;
  readonly adHoc: boolean;
  readonly published?: string;
  // An ad hoc session's details for Home: its retained title and original
  // request when this machine kept its launch, and its identifier.
  readonly details?: AdHocSessionDetails;
};

export type AdHocSessionDetails = {
  readonly title: string | undefined;
  readonly identifier: string;
  readonly instruction: string | undefined;
};

function adHocDetails(
  session: FollowUpSession,
  title: string | undefined,
): AdHocSessionDetails {
  const instruction = session.retained?.request.instruction;
  return {
    title,
    identifier:
      session.published === undefined
        ? retainedSessionIdentifier(session.retained)
        : session.published.sessionId,
    instruction: instruction?.trim() ? instruction : undefined,
  };
}

// A story's sessions as Intent's review scopes, oldest first by when each
// started, as retained, otherwise when it closed, so repeated workflows are
// named apart.
export function storySessionScopes(
  records: readonly LaunchRecord[] | undefined,
  published: readonly PublishedSessionRecord[],
  sourceId: string,
  identity: string,
): readonly SessionScope[] {
  return storySessions(records, published, sourceId, identity)
    .map((session) => {
      const { choice, retained, published: record } = session;
      const time = retained?.launchedAt ?? record?.closedAt ?? "";
      const adHoc =
        (retained?.request.workflow ?? record?.workflow) === "ad-hoc";
      const kind = adHoc
        ? "Title unavailable"
        : retained === undefined
          ? sessionWorkflowName(record.workflow)
          : launchKindName(retained.request.workflow);
      const title =
        retained === undefined
          ? undefined
          : launchSubject(retained.request).title;
      const label =
        adHoc && title !== undefined
          ? title
          : `${kind} — ${new Date(time).toLocaleString()}`;
      const key = followUpSessionKey(choice);
      const details = adHoc ? { details: adHocDetails(session, title) } : {};
      const scope: SessionScope =
        record === undefined
          ? { key, label, adHoc, ...details }
          : { key, label, adHoc, published: record.sessionId, ...details };
      return { time, scope };
    })
    .toSorted((a, b) => a.time.localeCompare(b.time))
    .map(({ scope }) => scope);
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
  return `${label} · ${retainedSessionIdentifier(session.retained)}`;
}

// A retained session named by its host and that host's session id.
function retainedSessionIdentifier({
  session: { host, sessionId },
}: LaunchRecord): string {
  return `${hostName(host)} · ${sessionId}`;
}
