import { isOpen, projectSessionsOf, storySessionsOf } from "./agentLaunch.ts";
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

// A story's completed session as retained on this machine, published, or both.
export type StorySession = {
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

// A story's completed sessions, once each by reporting reference, from this
// machine's retained launches and the published records, ad hoc follow-ups
// included.
export function storySessions(
  records: readonly LaunchRecord[] | undefined,
  published: readonly PublishedSessionRecord[],
  sourceId: string,
  identity: string,
): readonly StorySession[] {
  const sessions = new Map<string, StorySession>();
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
        ? retainedSessionReference(retained)
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
  session: StorySession,
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

// A retained session's reference on its host.
export function retainedSessionReference({
  session: { host, sessionId },
}: LaunchRecord): SessionReference {
  return { host, sessionId };
}

// A retained session named by its host and that host's session id.
export function retainedSessionIdentifier({
  session: { host, sessionId },
}: LaunchRecord): string {
  return `${hostName(host)} · ${sessionId}`;
}
