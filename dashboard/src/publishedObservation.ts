// The selected project's observation, apart from how the page presents it:
// which project is observed, its last snapshot (`./snapshotRetrieval.ts`), the
// latest attempt (`./observationAttempt.ts`), and focus kept across a
// snapshot's replacement. Reads happen on opening, on selecting a project,
// when launch reconciliation asks to read afresh, and when a scheduled
// revision check (`./revisionCheckSchedule.ts`) finds the selected ref naming
// another commit; when it finds a story branch the shown progress is read from
// at another head, only that progress is read again. Each read is carried
// out by `./requestedRead.ts`. What GitHub's rate limit withheld is read
// again once it ends (`./limitRecovery.ts`). What is shown, as launch
// reconciliation sees it (`shown`), also says whether every detail of it has
// been read.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import { watchedBranchHeads } from "./progressSource.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { carryOutRead, type ReadRequest } from "./requestedRead.ts";
import { limitsMetSince } from "./readingLimit.ts";
import { useLimitRecovery } from "./limitRecovery.ts";
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
    acceptMembership,
    fail,
    findUnchanged,
    restart,
  } = useObservationAttempt();
  // Opening the page asks for the first read; launch reconciliation may ask
  // for another. Selecting a different project also starts a fresh read,
  // through the `source` dependency below. Otherwise a read is asked only when
  // a revision check finds the ref naming another commit, and it reads exactly
  // that commit.
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
  useEffect(() => {
    const reading = new AbortController();
    // Whether the limit met any of this read: what it asked was then
    // withheld.
    const limitMet = limitsMetSince();
    const askedAsOf = visibilityChanges();
    carryOutRead(readRequest, source, shownWork.current, reading.signal, {
      show: (next, firstMembership) => {
        const held = focusedWork();
        heldFocus.current = held;
        show(next, firstMembership ? unlistedNotice(held, next) : undefined);
      },
      acceptMembership,
      completeDetail,
      fail,
      settle: (revealing) => {
        if (limitMet()) withhold();
        setReadSettled(true);
        if (revealing) settleRevealed(askedAsOf);
      },
    });
    return () => {
      reading.abort();
    };
  }, [readRequest, source]);

  // Asks for a read of the selected project: of its ref afresh, or of the
  // revision a check found it naming. What is shown stays until it lands.
  const askRead = (revision: string | undefined) => {
    startReading();
    clearNotice();
    readAgain();
    setReadSettled(false);
    setReadRequest((last) => ({ asked: last.asked + 1, revision }));
  };

  // Reads only the progress on these moved story branches; the rest of what
  // is shown stays, and no check is asked until it lands.
  const askMovedProgress = (movedBranches: StoryBranchHeads) => {
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

  const { checksMayRun } = useLimitRecovery({
    withheld,
    readSettled,
    visibility,
    readAfresh: () => {
      askRead(undefined);
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
  // Launch reconciliation's fresh read of the ref; one already under way
  // stands for it.
  const readAfresh = () => {
    if (!reading) {
      askRead(undefined);
    }
  };

  // Selecting a project replaces the observation whole: the previous
  // project's snapshot, failure, and held focus are cleared rather than kept
  // under the new label, and a fresh read starts through the `source`
  // dependency above. Work identities are meaningful within one project and
  // never carry focus into another.
  const selectSource = (next: PublishedSource) => {
    if (next.id === source.id) {
      return;
    }
    heldFocus.current = undefined;
    deferredFocus.current = undefined;
    setSource(next);
    // A revision found for the previous project names nothing here.
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
    reading,
    readAfresh,
    selectSource,
  };
}
