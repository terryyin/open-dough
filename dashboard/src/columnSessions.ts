// The Board's one session placement, from saved Done and the current
// published membership. Native activity and local launch evidence never
// choose a story's column. An unfinished Backlog or Taken card holds its
// story's open sessions and its own Done sessions (keyed by identity); the
// remaining sessions can appear on their published Done cards.
import {
  isOpen,
  projectSessionsOf,
  storyOf,
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
  const project = projectSessionsOf(records, sourceId)?.filter(
    ({ request }) => storyOf(request) !== undefined,
  );
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
    forDoneCards: project?.filter((record) => !held.has(record)),
    doneOnCard,
    noneKept: project?.length === 0,
  };
}
