// How many listed sessions need attention, work or hold unread reports, by
// the same reading each of their entries shows (`./sessionShown.ts`), and the
// words the story card, the Sessions toggle and the sidebar say them in.

import {
  readsWorking,
  sessionShown,
  type ReadableSession,
} from "./sessionShown.ts";

// How many of the listed sessions need attention, by the same reading each
// of their entries shows.
export function attentionCount(sessions: readonly ReadableSession[]): number {
  return sessions.filter((session) => sessionShown(session).needsAttention)
    .length;
}

// Open sessions that read working and are not marked done.
export function workingCount(sessions: readonly ReadableSession[]): number {
  return sessions.filter(
    (session) => session.doneAt === undefined && readsWorking(session),
  ).length;
}

// Story card and banner Sessions badge: how many need attention, or nothing.
export function attentionSummary(
  sessions: readonly ReadableSession[],
): string | undefined {
  return unlessNone(attentionCount(sessions), attentionWords);
}

// Closed Sessions toggle badge: how many are working, or nothing.
export function workingSummary(
  sessions: readonly ReadableSession[],
): string | undefined {
  return unlessNone(workingCount(sessions), workingWords);
}

export function attentionWords(count: number): string {
  return countedWords(
    count,
    "session needs attention",
    "sessions need attention",
  );
}

export function workingWords(count: number): string {
  return countedWords(count, "session working", "sessions working");
}

// How many open sessions do not need attention, in words, zero included.
export function activeSessionsWords(count: number): string {
  return countedWords(count, "active session", "active sessions");
}

// What a story's card says of its listed sessions' unread reports, apart
// from how many need attention: how many hold one, or nothing when none do.
export function unreadReportSummary(
  sessions: readonly ReadableSession[],
): string | undefined {
  return unlessNone(
    sessions.filter(
      (session) => sessionShown(session).unreadReport !== undefined,
    ).length,
    (count) => countedWords(count, "unread report", "unread reports"),
  );
}

// A count and what it counts, singular for one.
function countedWords(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

// A count's words, or nothing when it is zero.
function unlessNone(
  count: number,
  words: (count: number) => string,
): string | undefined {
  return count === 0 ? undefined : words(count);
}
