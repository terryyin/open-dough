// Session placement uses saved Done and the current published membership.
// Native activity and local launch evidence never choose a story's column.
import {
  storyCardSessionsOf,
  isOpen,
  projectSessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";

export function columnSessionsOf(
  sourceId: string,
  records: readonly LaunchWithState[] | undefined,
  activeStoryIdentities: readonly string[],
) {
  const project = projectSessionsOf(records, sourceId);
  const held = new Set(
    activeStoryIdentities.flatMap((identity) =>
      storyCardSessionsOf(records, sourceId, identity),
    ),
  );
  return {
    taken: project
      ?.filter((record) => isOpen(record) && !held.has(record))
      .toReversed()
      .toSorted((a, b) => Date.parse(b.launchedAt) - Date.parse(a.launchedAt)),
    done: project?.filter((record) => !isOpen(record)),
    noneKept: project?.length === 0,
  };
}
