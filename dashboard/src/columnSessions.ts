// The Board's one session placement, from saved Done and the current
// published membership. Native activity and local launch evidence never
// choose a published story's column. An unfinished Backlog or Taken card
// holds its story's open launches and attached Done sessions; the
// remaining Done sessions are what Recently done lists, on a published done
// card or standing alone (`./recentlyDoneListing.ts`).
import {
  isOpen,
  projectSessionsOf,
  storyOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import {
  publishedCloseFor,
  sessionStoryAssociation,
} from "./retainedStoryMembership.ts";

// An unfinished card's own Done sessions, oldest first, by its identity.
export type DoneOnCard = (identity: string) => readonly LaunchWithState[];

export function columnSessionsOf(
  sourceId: string,
  records: readonly LaunchWithState[] | undefined,
  unfinishedIdentities: readonly string[],
  published: ReadonlyMap<string, PublishedSessionRecord> = new Map(),
) {
  const project = projectSessionsOf(records, sourceId);
  const onCards = new Map(
    unfinishedIdentities.map((identity) => [
      identity,
      project?.filter((record) => {
        if (isOpen(record)) return storyOf(record.request) === identity;
        const membership = sessionStoryAssociation(
          record,
          publishedCloseFor(record, published),
        );
        return (
          membership?.kind !== "conflict" && membership?.identity === identity
        );
      }) ?? [],
    ]),
  );
  const held = new Set([...onCards.values()].flat());
  const doneOnCard: DoneOnCard = (identity) =>
    (onCards.get(identity) ?? []).filter((record) => !isOpen(record));
  return {
    taken: project
      ?.filter((record) => isOpen(record) && !held.has(record))
      .toReversed()
      .toSorted((a, b) => Date.parse(b.launchedAt) - Date.parse(a.launchedAt)),
    // Done sessions of no unfinished card, for Recently done.
    done: project?.filter((record) => !isOpen(record) && !held.has(record)),
    doneOnCard,
    noneKept: project?.length === 0,
  };
}
