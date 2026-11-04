// When the published observation (`./publishedObservation.ts`) asks whether
// the selected project's ref still names the shown snapshot's revision, and
// whether the story branches its progress is read from still name the heads
// shown.
//
// This module is the recurring-check delivery: while a snapshot is shown, the
// page is visible, and no read is under way, ask at a steady pace whether the
// selected project's ref still names its revision; a page seen again asks once
// at once. A failed check or read keeps that pace rather than retrying at once,
// and while the page's record of GitHub's rate limit stands (`./readingLimit.ts`)
// no check is asked before its time, hidden, seen again, or not. Reaction to
// each answer — changed, unchanged, moved branches, failure, or limit — lives
// in `./revisionAnswer.ts`, shared with a later stream delivery. Any new read,
// a project switch, or hiding the page cancels a pending or outstanding check,
// and its late answer is ignored.

import { useEffect, useState } from "react";
import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import { checkPublishedRevision } from "./authenticatedRead.ts";
import type { Visibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useLimitedUntil } from "./readingLimit.ts";
import {
  reactToRevisionCheck,
  reactToRevisionCheckFailure,
  type RevisionAnswerHandlers,
} from "./revisionAnswer.ts";
import type { RevisionDelivery } from "./revisionStreamSlot.ts";

// How long a shown snapshot waits before asking whether the selected
// project's `main` still names its revision: often enough that newly
// published work appears within 30 seconds, including the read itself.
export const checkIntervalMs = 15_000;

type ScheduledChecks = RevisionAnswerHandlers & {
  readonly source: PublishedSource;
  readonly shownRevision: string | undefined;
  // The story branches the shown progress is read from, with the heads shown.
  readonly watchedHeads: StoryBranchHeads;
  // Whether the latest read, detail included, has finished. Checks wait for
  // it, so a check and a read never overlap.
  readonly readSettled: boolean;
  readonly visibility: Visibility;
  // Observation's chosen delivery; only `"check"` asks here.
  readonly delivery?: RevisionDelivery;
};

export function useRevisionCheckSchedule({
  source,
  shownRevision,
  watchedHeads,
  readSettled,
  visibility,
  delivery = "check",
  onChanged,
  onUnchanged,
  onBranchesMoved,
  onFailed,
}: ScheduledChecks): void {
  // The page-clock time before which no check may be asked. While a check is
  // outstanding the schedule keeps the time it was asked under, so the limit
  // that check's own answer sets never cancels it; once it settles, the next
  // check obeys the latest time.
  const limitedUntil = useLimitedUntil();
  const [askedUnder, setAskedUnder] = useState<number | undefined>();
  const checksResumeAt = askedUnder ?? limitedUntil;
  // The watched branches and heads as one value, so an unchanged watch keeps
  // the schedule as it is.
  const watchKey = JSON.stringify([...watchedHeads]);
  // Each settled check that asked for no read schedules the next one.
  const [checksSettled, setChecksSettled] = useState(0);
  useEffect(() => {
    if (
      delivery !== "check" ||
      !readSettled ||
      shownRevision === undefined ||
      visibility === "hidden"
    ) {
      return;
    }
    const checking = new AbortController();
    const handlers = { onChanged, onUnchanged, onBranchesMoved, onFailed };
    const waiting = setTimeout(
      () => {
        setAskedUnder(checksResumeAt);
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
            if (
              reactToRevisionCheck(check, watchedHeads, handlers) === "continue"
            ) {
              setChecksSettled((settled) => settled + 1);
            }
          },
          (error: unknown) => {
            if (checking.signal.aborted) {
              return;
            }
            if (reactToRevisionCheckFailure(error, handlers) === "continue") {
              setChecksSettled((settled) => settled + 1);
            }
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
      setAskedUnder(undefined);
    };
  }, [
    checksResumeAt,
    checksSettled,
    delivery,
    readSettled,
    shownRevision,
    source,
    visibility,
    watchKey,
  ]);
}
