// Recently done lists published Done stories, with retained sessions nested
// under the story their launch request names.
import type { CataloguedDoneRecord } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { storySessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import { isFollowUpSession } from "./followUpSessions.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";
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
