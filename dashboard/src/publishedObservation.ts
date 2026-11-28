// The selected project, last snapshot, latest attempt, and retained focus.
// Reads happen on opening, selecting a project, Refresh, launch
// reconciliation's fresh ask, and a scheduled revision check
// (`./revisionCheckSchedule.ts`) finding the selected ref naming another
// commit, or only moved story-branch progress. Each read is carried out by
// `./requestedRead.ts`. Rate-limit and transient recovery scheduling:
// `./limitRecovery.ts`; hide releasing a recovery wait:
// `./observationRecoveryWait.ts`. `shown` says if every detail was read.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import { watchedBranchHeads } from "./progressSource.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import type { PublishedObservationReadSource } from "./publishedObservationReadSource.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { carryOutRead, useReadRequest, type RefAsk } from "./requestedRead.ts";
import type { RevisionConfirmation } from "./revisionCheckRead.ts";
import { limitsMetSince } from "./readingLimit.ts";
import { recordSettledOutcomes, useLimitRecovery } from "./limitRecovery.ts";
import { useTransientRecoverySchedule } from "./transientRecovery.ts";
import { useObservationRecoveryWait } from "./observationRecoveryWait.ts";
import { useSnapshotRetrieval } from "./snapshotRetrieval.ts";
import { shownSnapshotOf } from "./startupReconciliation.ts";
import { useObservationAttempt } from "./observationAttempt.ts";
import { useObservedRevisionDelivery } from "./observedRevisionDelivery.ts";
import {
  focusedStoryCard,
  restoreSnapshotFocus,
  unlistedNotice,
  type FocusedStoryCard,
} from "./storyCardFocus.ts";

const noBranchHeads: StoryBranchHeads = new Map();
export function usePublishedObservation(
  initialSource: PublishedSource | undefined,
  reads: PublishedObservationReadSource,
) {
  const schedule = useTransientRecoverySchedule();
  // The project this dashboard is currently observing. Selecting another
  // project replaces this whole, never merges into what is already shown.
  const [source, setSource] = useState(initialSource);
  const {
    retrieval,
    outcomes,
    show,
    completeDetail,
    confirm,
    withhold,
    readAgain,
    clearNotice,
    clear,
  } = useSnapshotRetrieval();
  const {
    attempt,
    startReading,
    cancelReading,
    acceptMembership,
    fail,
    findUnchanged,
    restart,
  } = useObservationAttempt();
  const { request, requestSnapshot, requestMovedProgress } = useReadRequest();
  // Whether the latest read, detail included, has finished.
  const [readSettled, setReadSettled] = useState(false);
  const { visibility, visibilityChanges, settleRevealed } = usePageVisibility();
  const heldFocus = useRef<FocusedStoryCard | undefined>(undefined);
  const deferredFocus = useRef<FocusedStoryCard | undefined>(undefined);
  // The snapshot shown, for a read of moved branches' progress to start from.
  const shownWork = useRef<PublishedWork | undefined>(undefined);
  shownWork.current = retrieval.work;
  // Letting go of the current read leaves shown only what it answered.
  const letGoOfRead = useRef<() => void>(() => {});
  const onRecoveryReleased = useCallback(() => {
    letGoOfRead.current();
    setReadSettled(true);
    cancelReading();
  }, [cancelReading]);
  const { bindRead, setRecoveryAsk } = useObservationRecoveryWait({
    visibility,
    onReleased: onRecoveryReleased,
  });
  useEffect(() => {
    if (source === undefined) return;
    const reading = new AbortController();
    const unbind = bindRead(reading);
    const limitMet = limitsMetSince();
    const askedAsOf = visibilityChanges();
    letGoOfRead.current = carryOutRead(
      reads,
      request,
      source,
      shownWork.current,
      reading.signal,
      outcomes,
      {
        show: (next, firstMembership) => {
          const held = focusedStoryCard();
          heldFocus.current = held;
          // New membership replaces the retrieval whole; same-revision
          // recovery keeps shown facts while unanswered detail is asked again.
          const replacing =
            firstMembership &&
            (shownWork.current === undefined ||
              shownWork.current.revision !== next.revision);
          show(next, replacing ? unlistedNotice(held, next) : undefined);
        },
        acceptMembership,
        completeDetail,
        fail: (error, afterMembership = false) => {
          setRecoveryAsk(false);
          fail(error, afterMembership);
        },
        settle: (revealing) => {
          setRecoveryAsk(false);
          if (limitMet()) withhold();
          setReadSettled(true);
          recordSettledOutcomes(outcomes, schedule);
          if (revealing) settleRevealed(askedAsOf);
        },
      },
    );
    return unbind;
  }, [request, source, schedule]);

  // Ref afresh, or the revision a check named. Recovery asks mark the wait
  // so hide can release that ask alone; a fresh ask outwaits a settled check.
  const askRead = (
    revision: string | undefined,
    why?: RefAsk,
    confirmation?: RevisionConfirmation,
  ) => {
    setRecoveryAsk(why === "recovery");
    startReading();
    clearNotice();
    readAgain();
    setReadSettled(false);
    requestSnapshot(revision, why === "fresh", confirmation);
  };

  // Only moved story-branch progress; the rest of what is shown stays.
  const askMovedProgress = (movedBranches: StoryBranchHeads) => {
    setRecoveryAsk(false);
    setReadSettled(false);
    requestMovedProgress(movedBranches);
  };

  const { work, notice, complete, withheld } = retrieval;
  const shown = useMemo(
    () => work && shownSnapshotOf(work, complete),
    [work, complete],
  );
  const watchedHeads = useMemo(
    () => (work === undefined ? noBranchHeads : watchedBranchHeads(work)),
    [work],
  );

  const { checksMayRun, recoversAt, blocksFreshRead, limitedUntil } =
    useLimitRecovery({
      withheld,
      readSettled,
      visibility,
      readAfresh: () => {
        askRead(undefined, "recovery");
      },
    });

  const connection = useObservedRevisionDelivery({
    checkRevision: reads.checkRevision,
    subscribeRevision: reads.subscribeRevision,
    source,
    shownRevision: work?.revision,
    watchedHeads,
    readSettled: checksMayRun,
    visibility,
    onChanged: (revision, confirmation) => {
      askRead(revision, undefined, confirmation);
    },
    onBranchesMoved: askMovedProgress,
    onUnchanged: (confirmation) => {
      if (confirmation !== undefined && work !== undefined)
        confirm(work.revision, confirmation);
      findUnchanged();
      settleRevealed();
    },
    onFailed: (error: unknown) => {
      fail(error);
      settleRevealed();
    },
  });

  useLayoutEffect(() => {
    deferredFocus.current = restoreSnapshotFocus(
      heldFocus.current,
      deferredFocus.current,
      work,
    );
    heldFocus.current = undefined;
  }, [work]);

  const reading = attempt.status === "reading";
  // Launch reconciliation's fresh ask, or Refresh; an in-flight read stands
  // for either.
  const readAfresh = (by?: "refresh") => {
    if (!reading && !blocksFreshRead(by)) askRead(undefined, "fresh");
  };

  // Replace the observation whole for another project: clear local recovery
  // and focus while a standing login limit remains; fresh read via `source`.
  const selectSource = (next: PublishedSource | undefined) => {
    if (next?.id === source?.id) return;
    heldFocus.current = undefined;
    deferredFocus.current = undefined;
    setRecoveryAsk(false);
    schedule.clearAll();
    setSource(next);
    if (next !== undefined) askRead(undefined);
    else setReadSettled(false);
    restart();
    clear();
  };

  return {
    connection,
    source,
    work,
    shown,
    attempt,
    notice,
    withheld,
    recoversAt,
    limitedUntil,
    visibility,
    reading,
    readAfresh,
    selectSource,
  };
}
