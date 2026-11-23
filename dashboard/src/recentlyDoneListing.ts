// Recently done's listed entries: local and published done cards holding their
// closed sessions and closed story follow-ups, plus standalone Done sessions
// of no listed card, from the Done sessions the Board's placement leaves to
// Recently done (`./columnSessions.ts`). Card facts come from the retained
// Done attachment or the published catalog (`./recentlyDoneView.ts` reads
// the range).

import { isCurrentSessionRecord } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { projectSessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import type { DoneStory } from "./doneRecord.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import type { PublishedSessions } from "./publishedSessions.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";
import {
  publishedCloseFor,
  publishedSessionsById,
  recentLocalDoneStory,
  retainedStoryOf,
  sessionStoryAssociation,
} from "./retainedStoryMembership.ts";
import { reportingReferenceOf } from "./sessionListing.ts";
import { sessionKey } from "./sessionReference.ts";

type CardSessions = {
  readonly at: number;
  // The story's own sessions, oldest first — Follow up context and offer.
  readonly sessions: readonly LaunchWithState[];
  // Closed ad hoc follow-ups of this story, oldest first — display only.
  readonly followUps: readonly LaunchWithState[];
  readonly publishedSessions: readonly PublishedSessionRecord[];
  readonly publishedForRetained: ReadonlyMap<string, PublishedSessionRecord>;
};

type ListedCard = CardSessions &
  (
    | { readonly record: CataloguedDoneRecord }
    | { readonly localStory: DoneStory }
  );

export type Listed =
  | ListedCard
  | { readonly at: number; readonly session: LaunchWithState }
  // A session the project published a close record for, with no kept launch
  // on this machine whose reporting reference is the record's UUID: such a
  // launch (Done or live) stands for it with its native controls.
  | { readonly at: number; readonly published: PublishedSessionRecord };

function cardSessions(
  sessions: readonly LaunchWithState[],
  identity: string,
  published: ReadonlyMap<string, PublishedSessionRecord>,
  unrepresented: readonly PublishedSessionRecord[],
) {
  const own: LaunchWithState[] = [];
  const followUps: LaunchWithState[] = [];
  const publishedForRetained = new Map<string, PublishedSessionRecord>();
  for (const session of sessions) {
    const close = publishedCloseFor(session, published);
    const story = sessionStoryAssociation(session, close);
    if (story?.kind === "conflict" || story?.identity !== identity) continue;
    (story.kind === "follow-up" ? followUps : own).push(session);
    if (close !== undefined)
      publishedForRetained.set(sessionKey(session.session), close);
  }
  return {
    sessions: own,
    followUps,
    publishedSessions: unrepresented.filter(
      (record) => record.story === identity,
    ),
    publishedForRetained,
  };
}

// Sessions a listed done card holds: its own closed sessions and its closed
// story follow-ups.
const holdingsOf = (
  sessions: readonly LaunchWithState[],
  followUps: readonly LaunchWithState[],
) => [...sessions, ...followUps];

function localCards(
  sessions: readonly LaunchWithState[],
  published: readonly CataloguedDoneRecord[],
  now: Date,
): readonly DoneStory[] {
  const listed = new Set(published.map(({ identity }) => identity));
  return sessions.flatMap((session) => {
    const story = recentLocalDoneStory(retainedStoryOf(session), now);
    if (story === undefined || listed.has(story.identity)) return [];
    listed.add(story.identity);
    const { identity, title, completedAt } = story;
    return [{ identity, title, completedAt }];
  });
}

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
  now = new Date(),
): readonly Listed[] {
  const sessions = projectSessionsOf(doneSessions, sourceId) ?? [];
  const stoodFor = new Set(
    (projectSessionsOf(keptLaunches, sourceId) ?? []).map(reportingReferenceOf),
  );
  const byId = publishedSessionsById(published);
  const unrepresented = published.filter(
    (record) => !stoodFor.has(record.sessionId),
  );
  const local = localCards(sessions, records, now);
  const cards = [
    ...records.map((record) => ({
      at: Date.parse(record.completedAt),
      record,
      ...cardSessions(sessions, record.identity, byId, unrepresented),
    })),
    ...local.map((localStory) => ({
      at: Date.parse(localStory.completedAt),
      localStory,
      ...cardSessions(sessions, localStory.identity, byId, unrepresented),
    })),
  ];
  const held = new Set(
    cards.flatMap((card) => holdingsOf(card.sessions, card.followUps)),
  );
  const grouped = new Set(cards.flatMap((card) => card.publishedSessions));
  return [
    ...cards,
    ...sessions
      .filter((session) => !held.has(session))
      .toReversed()
      .map((session) => ({ at: Date.parse(session.launchedAt), session })),
    ...unrepresented
      .filter((record) => !grouped.has(record))
      .map((record) => ({
        at: Date.parse(record.closedAt),
        published: record,
      })),
  ].sort((one, other) => other.at - one.at);
}

const holds = (each: Listed, session: string) =>
  "sessions" in each
    ? holdingsOf(each.sessions, each.followUps).some(
        (held) => sessionKey(held.session) === session,
      )
    : "session" in each && sessionKey(each.session.session) === session;

export function listedStory(each: ListedCard) {
  return "record" in each ? each.record : each.localStory;
}

export function listedEntryKey(each: Listed): string {
  if ("session" in each) return sessionKey(each.session.session);
  return "published" in each
    ? `published ${each.published.sessionId}`
    : `done ${listedStory(each).identity}`;
}

// Whether `each` is, or holds, the entry holding the keyboard.
export const holdsEntry = (each: Listed, held: HeldEntry) =>
  held.story === undefined
    ? holds(each, held.session)
    : "sessions" in each && listedStory(each).identity === held.story;
