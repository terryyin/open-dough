// Project Intent's whole-project reading: its chosen view with the followed
// locations (`./useShownIntentLocations.tsx`) paired with the project tree
// (`./useProjectTreeRead.tsx`) at the revision whose locations are shown. The
// pair advances to a revision only once both its locations have settled and
// its tree is read; until then the last read pair stays shown with its own revision,
// marked as updating in the revision notice, and a failed tree read is that
// notice's failed update with its Retry (`./IntentRevisionNotice.tsx`).
// Story pages have no project reading, so their browser follows the
// locations alone.

import { useEffect, useState } from "react";
import type { ModeChoice } from "./pageIntentMode.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";
import {
  firstProjectTree,
  useProjectTreeRead,
  type ProjectTree,
} from "./useProjectTreeRead.tsx";

export type ProjectReading = ModeChoice & { readonly tree: ProjectTree };

// The last revision whose locations and tree were both read.
type ReadPair = {
  readonly revision: string;
  readonly paths: readonly string[];
  readonly shown: ShownIntentLocations;
};

const readTree = (paths: readonly string[]): ProjectTree => ({
  paths,
  lead: undefined,
  unread: false,
});

export function useProjectReading(
  source: PublishedSource,
  followed: ShownIntentLocations,
  // Project Intent's view choice, undefined on story pages.
  choice: ModeChoice | undefined,
): {
  readonly shown: ShownIntentLocations;
  readonly project: ProjectReading | undefined;
} {
  const { follow, shownRevision } = followed;
  // The tree is read at the revision whose locations are shown, so it follows
  // the reading once that revision's locations have answered.
  const { current, retry } = useProjectTreeRead(
    source,
    choice === undefined ? undefined : shownRevision,
  );
  // The shown locations' revision with its tree read: the pair to show.
  const arrived =
    followed.reading !== true &&
    current !== undefined &&
    current.revision === shownRevision &&
    "paths" in current
      ? current.paths
      : undefined;
  const [pair, setPair] = useState<ReadPair | undefined>(undefined);
  useEffect(() => {
    if (shownRevision === undefined || arrived === undefined) return;
    if (pair?.revision === shownRevision && pair.paths === arrived) return;
    setPair({ revision: shownRevision, paths: arrived, shown: followed });
  }, [shownRevision, arrived, pair, followed]);

  if (choice === undefined) return { shown: followed, project: undefined };
  if (arrived !== undefined)
    return { shown: followed, project: { ...choice, tree: readTree(arrived) } };
  const held = pair;
  const reading = follow?.reading ?? shownRevision;
  // Settled locations the browser cannot list replace the reading at once.
  const unlisted =
    followed.reading !== true &&
    shownRevision === reading &&
    followed.locations === undefined;
  if (held === undefined || unlisted)
    return {
      shown: followed,
      project: { ...choice, tree: firstProjectTree(current, retry) },
    };
  // The held reading's failed update with its Retry: its locations' read,
  // else the tree read of the revision it moves to.
  const failed =
    follow?.failedUpdate !== undefined
      ? { update: follow.failedUpdate, retry: follow.retryLocations }
      : current !== undefined &&
          "failed" in current &&
          held.revision !== reading
        ? { update: current, retry }
        : undefined;
  const base = held.revision === shownRevision ? followed : held.shown;
  return {
    shown: {
      ...base,
      notice: follow?.noticeFor({
        revision: held.revision,
        updating: held.revision !== reading && failed === undefined,
        failedUpdate: failed?.update,
        onRetry: failed?.retry ?? retry,
      }),
    },
    project: { ...choice, tree: readTree(held.paths) },
  };
}
