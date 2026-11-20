// The Board's one session placement, from saved Done and the current
// published membership. Native activity and local launch evidence never
// choose a story's column. An unfinished Backlog or Taken card holds its
// story's open sessions and its own Done sessions (keyed by identity); the
// remaining Done sessions are what Recently done lists, on a published done
// card or standing alone (`./recentlyDoneListing.ts`).
import {
  isOpen,
  projectSessionsOf,
  storySessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";

// An unfinished card's own Done sessions, oldest first, by its identity.
export type DoneOnCard = (identity: string) => readonly LaunchWithState[];

export function columnSessionsOf(
  sourceId: string,
  records: readonly LaunchWithState[] | undefined,
  unfinishedIdentities: readonly string[],
) {
  const project = projectSessionsOf(records, sourceId);
  const onCards = new Map(
    unfinishedIdentities.map((identity) => [
      identity,
      storySessionsOf(records, sourceId, identity),
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
