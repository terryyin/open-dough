// The selected project's observation, apart from how the page presents it:
// which project is observed, its last snapshot (`./snapshotRetrieval.ts`), the
// latest attempt (`./observationAttempt.ts`), and focus kept across a
// snapshot's replacement. Reads happen on opening, on selecting a project,
// when launch reconciliation asks to read afresh, and when a scheduled
// revision check (`./revisionCheckSchedule.ts`) finds the selected ref naming
// another commit; when it finds a story branch the shown progress is read from
// at another head, only that progress is read again. Each read is carried
// out by `./requestedRead.ts`. Rate-limit and transient recovery scheduling:
// `./limitRecovery.ts`. Hide releasing a page-local recovery wait:
// `./observationRecoveryWait.ts`. What is shown (`shown`) also says whether
// every detail of it has been read.

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
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { carryOutRead, type ReadRequest } from "./requestedRead.ts";
import { limitsMetSince } from "./readingLimit.ts";
import {
  clearTransientFailure,
  recordSettledOutcomes,
  useLimitRecovery,
} from "./limitRecovery.ts";
import { useObservationRecoveryWait } from "./observationRecoveryWait.ts";
import { useSnapshotRetrieval } from "./snapshotRetrieval.ts";
import { shownSnapshotOf } from "./startupReconciliation.ts";
import { useObservationAttempt } from "./observationAttempt.ts";
import { useRevisionCheckSchedule } from "./revisionCheckSchedule.ts";
import {
  focusedWork,
  restoreSnapshotFocus,
  unlistedNotice,
  type FocusedWork,
} from "./workFocus.ts";

// No snapshot shown, so no story branch watched.
const noBranchHeads: StoryBranchHeads = new Map();

export function usePublishedObservation(initialSource: PublishedSource) {
  // The project this dashboard is currently observing. Selecting another
  // project replaces this whole, never merges into what is already shown.
  const [source, setSource] = useState<PublishedSource>(initialSource);
  const {
    retrieval,
    outcomes,
    show,
    completeDetail,
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
  // First read on open; later asks come from launch reconciliation, project
  // selection (`source` below), or a check that names another commit.
  const [readRequest, setReadRequest] = useState<ReadRequest>({
    asked: 1,
    revision: undefined,
  });
  // Whether the latest read, detail included, has finished.
  const [readSettled, setReadSettled] = useState(false);
  const { visibility, visibilityChanges, settleRevealed } = usePageVisibility();
  const heldFocus = useRef<FocusedWork | undefined>(undefined);
  const deferredFocus = useRef<FocusedWork | undefined>(undefined);
  // The snapshot shown, for a read of moved branches' progress to start from.
  const shownWork = useRef<PublishedWork | undefined>(undefined);
  shownWork.current = retrieval.work;
  const onRecoveryReleased = useCallback(() => {
    setReadSettled(true);
    cancelReading();
  }, [cancelReading]);
  const { bindRead, setRecoveryAsk } = useObservationRecoveryWait({
    visibility,
    onReleased: onRecoveryReleased,
  });
  useEffect(() => {
    const reading = new AbortController();
    const unbind = bindRead(reading);
    const limitMet = limitsMetSince();
    const askedAsOf = visibilityChanges();
    carryOutRead(
      readRequest,
      source,
      shownWork.current,
      reading.signal,
      outcomes,
      {
        show: (next, firstMembership) => {
          const held = focusedWork();
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
          recordSettledOutcomes(outcomes);
          if (revealing) settleRevealed(askedAsOf);
        },
      },
    );
    return unbind;
  }, [readRequest, source]);

  // Ref afresh, or the revision a check named. Recovery asks mark the wait
  // so hide can release that ask alone.
  const askRead = (revision: string | undefined, forRecovery = false) => {
    setRecoveryAsk(forRecovery);
    startReading();
    clearNotice();
    readAgain();
    setReadSettled(false);
    setReadRequest((last) => ({ asked: last.asked + 1, revision }));
  };

  // Only moved story-branch progress; the rest of what is shown stays.
  const askMovedProgress = (movedBranches: StoryBranchHeads) => {
    setRecoveryAsk(false);
    setReadSettled(false);
    setReadRequest((last) => ({
      asked: last.asked + 1,
      revision: last.revision,
      movedBranches,
    }));
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

  const { checksMayRun, recoversAt, blocksFreshRead } = useLimitRecovery({
    withheld,
    readSettled,
    visibility,
    readAfresh: () => {
      askRead(undefined, true);
    },
  });

  useRevisionCheckSchedule({
    source,
    shownRevision: work?.revision,
    watchedHeads,
    readSettled: checksMayRun,
    visibility,
    onChanged: askRead,
    onBranchesMoved: askMovedProgress,
    onUnchanged: () => {
      findUnchanged();
      settleRevealed();
    },
    onFailed: (error) => {
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
  // Launch reconciliation's fresh read; an in-flight read stands for it.
  // Outstanding recovery or a standing login limit is not bypassed.
  const readAfresh = () => {
    if (!reading && !blocksFreshRead) {
      askRead(undefined);
    }
  };

  // Replace the observation whole for another project: clear local recovery
  // and focus while a standing login limit remains; fresh read via `source`.
  const selectSource = (next: PublishedSource) => {
    if (next.id === source.id) {
      return;
    }
    heldFocus.current = undefined;
    deferredFocus.current = undefined;
    setRecoveryAsk(false);
    clearTransientFailure();
    setSource(next);
    askRead(undefined);
    restart();
    clear();
  };

  return {
    source,
    work,
    shown,
    attempt,
    notice,
    withheld,
    recoversAt,
    reading,
    readAfresh,
    selectSource,
  };
}
