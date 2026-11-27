// Recently done lists published Done stories, with retained sessions nested
// under the story their launch request names.
import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { storySessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import { isFollowUpSession } from "./followUpSessions.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";
import { reportingReferenceOf } from "./sessionListing.ts";
import { sessionKey } from "./sessionReference.ts";

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

// An entry's published records by the retained session that reports to each,
// and those no retained session reports to, listed on their own.
export function pairedPublished({ sessions, followUps, published }: Listed) {
  const retained = new Set(
    [...sessions, ...followUps].map(reportingReferenceOf),
  );
  const byReference = new Map(
    published.map((session) => [session.sessionId, session]),
  );
  return {
    publishedOf: (session: LaunchWithState) => {
      const reference = reportingReferenceOf(session);
      return reference === undefined ? undefined : byReference.get(reference);
    },
    publishedOnly: published.filter(
      (session) => !retained.has(session.sessionId),
    ),
  };
}

// When each of an entry's reviewable sessions completed, once each: a
// completed retained session at its published record's `closedAt` when it has
// one, else its `doneAt`, and each published-only record at its `closedAt`.
// Open sessions have none.
export function reviewableCompletions(listed: Listed): readonly string[] {
  const { publishedOf, publishedOnly } = pairedPublished(listed);
  return [
    ...[...listed.sessions, ...listed.followUps].flatMap((session) =>
      session.doneAt === undefined
        ? []
        : [publishedOf(session)?.closedAt ?? session.doneAt],
    ),
    ...publishedOnly.map((session) => session.closedAt),
  ];
}
