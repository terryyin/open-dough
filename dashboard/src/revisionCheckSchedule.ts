// When the published observation (`./publishedObservation.ts`) asks whether
// the selected project's ref still names the shown snapshot's revision, and
// whether the story branches its progress is read from still name the heads
// shown.
//
// While a snapshot is shown, the page is visible, and no read is under
// way, ask at a steady pace whether the selected project's ref still names
// its revision; a page seen again asks once at once. A failed check or read
// keeps that pace rather than retrying at once, and a rate limit's directed
// wait postpones the next check further, hidden or not. An unchanged answer
// leaves the snapshot, its retrieval time, and its detail exactly as they
// are; a changed one reads the newly named commit. While the ref is
// unchanged, a watched branch found at another head, or no longer published,
// has only the progress read from it read again (`./movedBranchProgress.ts`);
// any other branch moving asks nothing further. Any new read, a project
// switch, or hiding the page cancels a pending or outstanding check, and
// its late answer is ignored.

import { useEffect, useState } from "react";
import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import { checkPublishedRevision } from "./authenticatedRead.ts";
import { movedBranches } from "./movedBranchProgress.ts";
import type { Visibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";

// How long a shown snapshot waits before asking whether the selected
// project's `main` still names its revision: often enough that newly
// published work appears within 30 seconds, including the read itself.
export const checkIntervalMs = 15_000;

type ScheduledChecks = {
  readonly source: PublishedSource;
  readonly shownRevision: string | undefined;
  // The story branches the shown progress is read from, with the heads shown.
  readonly watchedHeads: StoryBranchHeads;
  // Whether the latest read, detail included, has finished. Checks wait for
  // it, so a check and a read never overlap.
  readonly readSettled: boolean;
  readonly visibility: Visibility;
  // The page-clock time before which no check may be asked, because GitHub's
  // rate limit said so; zero when nothing directs a wait.
  readonly checksResumeAt: number;
  // The ref names another commit, which the caller reads.
  readonly onChanged: (revision: string) => void;
  // The shown snapshot is still what the ref names.
  readonly onUnchanged: () => void;
  // These watched branches name other heads, which the caller reads.
  readonly onBranchesMoved: (moved: StoryBranchHeads) => void;
  readonly onFailed: (error: unknown) => void;
};

export function useRevisionCheckSchedule({
  source,
  shownRevision,
  watchedHeads,
  readSettled,
  visibility,
  checksResumeAt,
  onChanged,
  onUnchanged,
  onBranchesMoved,
  onFailed,
}: ScheduledChecks): void {
  // The watched branches and heads as one value, so an unchanged watch keeps
  // the schedule as it is.
  const watchKey = JSON.stringify([...watchedHeads]);
  // Each settled check that asked for no read schedules the next one.
  const [checksSettled, setChecksSettled] = useState(0);
  useEffect(() => {
    if (
      !readSettled ||
      shownRevision === undefined ||
      visibility === "hidden"
    ) {
      return;
    }
    const checking = new AbortController();
    const waiting = setTimeout(
      () => {
        checkPublishedRevision(
          source,
          shownRevision,
          [...watchedHeads.keys()],
          checking.signal,
        ).then(
          (check) => {
            if (checking.signal.aborted) {
              return;
            }
            if (check.changed) {
              onChanged(check.revision);
              return;
            }
            onUnchanged();
            const moved = movedBranches(watchedHeads, check.heads);
            if (moved.size > 0) {
              onBranchesMoved(moved);
              return;
            }
            setChecksSettled((settled) => settled + 1);
          },
          (error: unknown) => {
            if (checking.signal.aborted) {
              return;
            }
            onFailed(error);
            setChecksSettled((settled) => settled + 1);
          },
        );
      },
      Math.max(
        visibility === "revealed" ? 0 : checkIntervalMs,
        checksResumeAt - Date.now(),
      ),
    );
    return () => {
      clearTimeout(waiting);
      checking.abort();
    };
  }, [
    checksResumeAt,
    checksSettled,
    readSettled,
    shownRevision,
    source,
    visibility,
    watchKey,
  ]);
}
