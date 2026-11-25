// Recently done's listed entries: published done cards holding their own
// closed sessions and closed story follow-ups, plus standalone Done sessions
// of no listed card, from the Done sessions the Board's placement leaves to
// Recently done (`./columnSessions.ts`). Membership is derived from the retained launch request and the
// published done catalog (`./recentlyDoneView.ts` reads the range).

import { isCurrentSessionRecord } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  projectSessionsOf,
  storySessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import type { PublishedSessions } from "./publishedSessions.ts";
import { isFollowUpSession } from "./followUpSessions.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";
import { reportingReferenceOf } from "./sessionListing.ts";
import { sessionKey } from "./sessionReference.ts";

export type Listed =
  | {
      readonly at: number;
      readonly record: CataloguedDoneRecord;
      // The story's own sessions, oldest first — Follow up context and offer.
      readonly sessions: readonly LaunchWithState[];
      // Closed ad hoc follow-ups of this story, oldest first — display only.
      readonly followUps: readonly LaunchWithState[];
    }
  | { readonly at: number; readonly session: LaunchWithState }
  // A session the project published a close record for, with no kept launch
  // on this machine whose reporting reference is the record's UUID: such a
  // launch (Done or live) stands for it with its native controls.
  | { readonly at: number; readonly published: PublishedSessionRecord };

// Closed ad hoc launches whose saved follow-up names this project story.
function closedStoryFollowUpsOf(
  doneSessions: readonly LaunchWithState[],
  sourceId: string,
  identity: string,
): readonly LaunchWithState[] {
  return (projectSessionsOf(doneSessions, sourceId) ?? []).filter((record) => {
    if (
      record.request.workflow !== "ad-hoc" ||
      record.request.storyIdentity !== undefined
    )
      return false;
    const followUp = record.request.followUp;
    return (
      followUp !== undefined &&
      "story" in followUp &&
      followUp.story.identity === identity
    );
  });
}

// Sessions a listed done card holds: its own closed sessions and its closed
// story follow-ups.
const holdingsOf = (
  sessions: readonly LaunchWithState[],
  followUps: readonly LaunchWithState[],
) => [...sessions, ...followUps];

// The published sessions Recently done lists: those of a listed answer still
// current at `now`. An unavailable listing is a gap in the column's problems,
// never an empty set; an expired record is simply absent.
export const currentPublishedSessions = (
  publishedSessions: PublishedSessions | undefined,
  now: Date,
) =>
  publishedSessions?.status === "listed"
    ? publishedSessions.sessions.filter((record) =>
        isCurrentSessionRecord(record, now),
      )
    : [];

// Done stories by completion, each holding its sessions and closed follow-ups,
// and the sessions of no listed done story by launch, newest first; sessions
// launched at one moment keep their newest-first order. Published session
// records whose UUID matches any kept launch's reporting reference (Done or
// still live) are omitted; the rest stand by their close time.
export function newestFirst(
  records: readonly CataloguedDoneRecord[],
  doneSessions: readonly LaunchWithState[],
  sourceId: string,
  keptLaunches: readonly LaunchWithState[],
  published: readonly PublishedSessionRecord[] = [],
): readonly Listed[] {
  const cards = records.map((record) => {
    const held = storySessionsOf(doneSessions, sourceId, record.identity);
    return {
      at: Date.parse(record.completedAt),
      record,
      sessions: held.filter((session) => !isFollowUpSession(session)),
      followUps: [
        ...held.filter(isFollowUpSession),
        ...closedStoryFollowUpsOf(doneSessions, sourceId, record.identity),
      ],
    };
  });
  const stoodFor = new Set(keptLaunches.map(reportingReferenceOf));
  const held = new Set(
    cards.flatMap((card) => holdingsOf(card.sessions, card.followUps)),
  );
  return [
    ...cards,
    ...doneSessions
      .filter((session) => !held.has(session))
      .toReversed()
      .map((session) => ({ at: Date.parse(session.launchedAt), session })),
    ...published
      .filter((record) => !stoodFor.has(record.sessionId))
      .map((record) => ({
        at: Date.parse(record.closedAt),
        published: record,
      })),
  ].sort((one, other) => other.at - one.at);
}

const holds = (each: Listed, session: string) =>
  "record" in each
    ? holdingsOf(each.sessions, each.followUps).some(
        (held) => sessionKey(held.session) === session,
      )
    : "session" in each && sessionKey(each.session.session) === session;

// Whether `each` is, or holds, the entry holding the keyboard.
export const holdsEntry = (each: Listed, held: HeldEntry) =>
  held.story === undefined
    ? holds(each, held.session)
    : "record" in each && each.record.identity === held.story;
