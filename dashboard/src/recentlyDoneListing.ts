// Recently done lists published Done stories, with retained sessions nested
// under the story their launch request names.
import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { storySessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import { isFollowUpSession } from "./followUpSessions.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";
import { reportingReferenceOf } from "./sessionListing.ts";
import { sessionKey } from "./sessionReference.ts";
import type { ReviewableSession } from "./storyReviewStates.ts";

export type Listed = {
  readonly record: CataloguedDoneRecord;
  readonly sessions: readonly LaunchWithState[];
  readonly followUps: readonly LaunchWithState[];
  readonly published: readonly PublishedSessionRecord[];
};

export function newestFirst(
  records: readonly CataloguedDoneRecord[],
  retainedSessions: readonly LaunchWithState[],
  sourceId: string,
  published: readonly PublishedSessionRecord[] = [],
): readonly Listed[] {
  return records
    .toSorted(
      (one, other) =>
        Date.parse(other.completedAt) - Date.parse(one.completedAt),
    )
    .map((record) => {
      const held = storySessionsOf(retainedSessions, sourceId, record.identity);
      return {
        record,
        published: published.filter(
          (session) => session.story === record.identity,
        ),
        sessions: held.filter((session) => !isFollowUpSession(session)),
        followUps: held.filter(isFollowUpSession),
      };
    });
}

export const holdsEntry = (
  { record, sessions, followUps }: Listed,
  held: HeldEntry,
) =>
  held.story === undefined
    ? [...sessions, ...followUps].some(
        ({ session }) => sessionKey(session) === held.session,
      )
    : record.identity === held.story;

// The published record a retained session reports to, among `published`.
export function publishedRecordOf(
  session: LaunchWithState,
  published: readonly PublishedSessionRecord[],
) {
  const reference = reportingReferenceOf(session);
  return reference === undefined
    ? undefined
    : published.find((record) => record.sessionId === reference);
}

// An entry's published records by the retained session that reports to each,
// and those no retained session reports to, listed on their own.
export function pairedPublished({ sessions, followUps, published }: Listed) {
  const retained = new Set(
    [...sessions, ...followUps].map(reportingReferenceOf),
  );
  return {
    publishedOf: (session: LaunchWithState) =>
      publishedRecordOf(session, published),
    publishedOnly: published.filter(
      (session) => !retained.has(session.sessionId),
    ),
  };
}

// A session's one review identity: the published session id when it has one
// (its launch's reporting reference, which its published record carries as
// `sessionId`), else its retained host and session id.
const reviewIdentityOf = (session: LaunchWithState) =>
  reportingReferenceOf(session) ?? sessionKey(session.session);

// A completed retained session as review counts it: at its published
// record's `closedAt` when it has one, else at its `doneAt`. Open sessions
// are not reviewable.
export const reviewableSession = (
  session: LaunchWithState,
  published?: PublishedSessionRecord,
): ReviewableSession | undefined =>
  session.doneAt === undefined
    ? undefined
    : {
        identity: reviewIdentityOf(session),
        completedAt: published?.closedAt ?? session.doneAt,
      };

export const reviewablePublished = (
  record: PublishedSessionRecord,
): ReviewableSession => ({
  identity: record.sessionId,
  completedAt: record.closedAt,
});

// An entry's reviewable sessions, once each: its completed retained sessions
// and each published-only record.
export function reviewableSessions(
  listed: Listed,
): readonly ReviewableSession[] {
  const { publishedOf, publishedOnly } = pairedPublished(listed);
  return [
    ...[...listed.sessions, ...listed.followUps].flatMap(
      (session) => reviewableSession(session, publishedOf(session)) ?? [],
    ),
    ...publishedOnly.map(reviewablePublished),
  ];
}
