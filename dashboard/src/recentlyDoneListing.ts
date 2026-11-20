// Recently done's listed entries: published done cards holding their own
// closed sessions and closed story follow-ups, plus standalone Done sessions
// of no listed card. An unfinished Backlog or Taken card takes that story's
// own Done sessions first (`./StoryCardDoneSessions.tsx`), so listing skips
// them. Membership is derived from the retained launch request and the
// published done catalog (`./recentlyDoneView.ts` reads the range).

import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  launchSubject,
  projectSessionsOf,
  storySessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";
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
  | { readonly at: number; readonly session: LaunchWithState };

// Closed ad hoc launches whose saved follow-up names this project story.
function closedStoryFollowUpsOf(
  doneSessions: readonly LaunchWithState[],
  sourceId: string,
  identity: string,
): readonly LaunchWithState[] {
  return (projectSessionsOf(doneSessions, sourceId) ?? []).filter((record) => {
    if (record.request.workflow !== "ad-hoc") return false;
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

// Whether an unfinished Backlog or Taken card in this project already holds
// this session. Identities are unique only within a project.
const heldByUnfinished = (
  session: LaunchWithState,
  unfinished: ReadonlySet<string>,
  sourceId: string,
) => {
  if (session.request.source !== sourceId) return false;
  const { identity } = launchSubject(session.request);
  return identity !== undefined && unfinished.has(identity);
};

// Done stories by completion, each holding its sessions and closed follow-ups,
// and the sessions of no listed done story by launch, newest first; sessions
// launched at one moment keep their newest-first order. Pass unfinished
// Backlog/Taken identities so those stories' own Done sessions stay on their
// open cards instead of nesting here or standing alone.
export function newestFirst(
  records: readonly CataloguedDoneRecord[],
  doneSessions: readonly LaunchWithState[],
  sourceId: string,
  unfinishedIdentities: readonly string[] = [],
): readonly Listed[] {
  const unfinished = new Set(unfinishedIdentities);
  const cards = records.map((record) => ({
    at: Date.parse(record.completedAt),
    record,
    sessions: unfinished.has(record.identity)
      ? []
      : storySessionsOf(doneSessions, sourceId, record.identity),
    followUps: closedStoryFollowUpsOf(doneSessions, sourceId, record.identity),
  }));
  const held = new Set(
    cards.flatMap((card) => holdingsOf(card.sessions, card.followUps)),
  );
  return [
    ...cards,
    ...doneSessions
      .filter(
        (session) =>
          !held.has(session) &&
          !heldByUnfinished(session, unfinished, sourceId),
      )
      .toReversed()
      .map((session) => ({ at: Date.parse(session.launchedAt), session })),
  ].sort((one, other) => other.at - one.at);
}

const holds = (each: Listed, session: string) =>
  "record" in each
    ? holdingsOf(each.sessions, each.followUps).some(
        (held) => sessionKey(held.session) === session,
      )
    : sessionKey(each.session.session) === session;

// Whether `each` is, or holds, the entry holding the keyboard.
export const holdsEntry = (each: Listed, held: HeldEntry) =>
  held.story === undefined
    ? holds(each, held.session)
    : "record" in each && each.record.identity === held.story;
