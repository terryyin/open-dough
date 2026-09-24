// Following the story branches a shown snapshot reads progress from, between
// reads of trunk: which of them a revision check found at another head, and
// the progress of only the entries on those, read again at the heads found
// (`./progressSource.ts`) with their clocks restarted from commit times there
// (`./sliceClockStart.ts`). Every other entry, and the snapshot's revision and
// retrieval time, stay as shown.

import type { StoryBranchHeads } from "./authenticatedBranchRead";
import { withProgressSources } from "./progressSource";
import type { PublishedWork } from "./publishedWork";
import { withSliceClocks } from "./sliceClockStart";
import { withinReadWait } from "./readWaitBound";

// The watched branches whose head the check found differs from the one shown,
// each with the head found: undefined when it is no longer published.
export function movedBranches(
  shown: StoryBranchHeads,
  checked: StoryBranchHeads,
): StoryBranchHeads {
  return new Map(
    [...checked].filter(
      ([branch, head]) => shown.has(branch) && shown.get(branch) !== head,
    ),
  );
}

// Reads the progress of the entries on `moved` branches again, within the
// shared read wait bound; an entry whose read fails or is given up shows that
// gap, as on any read.
export async function readMovedProgress(
  work: PublishedWork,
  moved: StoryBranchHeads,
  signal: AbortSignal,
): Promise<PublishedWork> {
  return withinReadWait(signal, async (untilEither) => {
    const resourced = await withProgressSources(work, untilEither, moved);
    const reread = resourced.taken.filter(
      (entry) => !work.taken.includes(entry),
    );
    const clocked = await withSliceClocks(
      { ...resourced, taken: reread },
      untilEither,
    );
    signal.throwIfAborted();
    return {
      ...resourced,
      taken: resourced.taken.map(
        (entry) =>
          clocked.taken.find(({ identity }) => identity === entry.identity) ??
          entry,
      ),
    };
  });
}
