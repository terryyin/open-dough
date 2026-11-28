// One read the published observation (`./publishedObservation.ts`) asks of
// the selected project, carried out until it lands or is cancelled: of its
// ref afresh, of a revision a check already found the ref naming, or, while
// the ref is unchanged, of only the progress on story branches a check found
// at other heads (`./movedBranchProgress.ts`). A cancelled read reports
// nothing further. A read that fails or is let go of before it lands leaves
// shown only what it answered itself: facts it carried from the shown
// snapshot while it was under way (`./carriedFacts.ts`) do not outlive it.

import { useState } from "react";
import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import { readMovedProgress } from "./movedBranchProgress.ts";
import type { ObservationOutcomes } from "./observationOutcomes.ts";
import type { PublishedObservationReadSource } from "./publishedObservationReadSource.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { readPublishedWork } from "./publishedWorkRead.ts";
import type { RevisionConfirmation } from "./revisionCheckRead.ts";

// Why the ref is read again: limit recovery, or launch reconciliation's
// fresh read.
export type RefAsk = "recovery" | "fresh";

type ReadRequest = {
  readonly asked: number;
  readonly revision: string | undefined;
  // Launch reconciliation's ask: only a ref check begun after it may answer.
  readonly fresh?: boolean;
  readonly movedBranches?: StoryBranchHeads;
  readonly confirmation?: RevisionConfirmation | undefined;
};

// The first read is of the ref. Each subsequent ask replaces the request so
// repeating the same read starts a new attempt.
export function useReadRequest() {
  const [request, setRequest] = useState<ReadRequest>({
    asked: 1,
    revision: undefined,
  });
  return {
    request,
    requestSnapshot: (
      revision: string | undefined,
      fresh: boolean,
      confirmation?: RevisionConfirmation,
    ) => {
      setRequest((last) => ({
        asked: last.asked + 1,
        revision,
        fresh,
        confirmation,
      }));
    },
    requestMovedProgress: (movedBranches: StoryBranchHeads) => {
      setRequest((last) => ({
        asked: last.asked + 1,
        revision: last.revision,
        movedBranches,
      }));
    },
  };
}

// What a read reports as it goes: each snapshot it shows, the first naming
// its membership; its failure, after membership or not; and, once it lands,
// whether the page's revealed state settles with it, which a read of moved
// progress leaves alone.
export type ReadReports = {
  readonly show: (work: PublishedWork, firstMembership: boolean) => void;
  readonly acceptMembership: () => void;
  readonly completeDetail: () => void;
  readonly fail: (error: unknown, afterMembership?: boolean) => void;
  readonly settle: (revealing: boolean) => void;
};

// Returns what letting go of the read before it lands asks: showing what it
// answered itself, once its signal is aborted.
export function carryOutRead(
  reads: PublishedObservationReadSource,
  { revision, fresh = false, movedBranches, confirmation }: ReadRequest,
  source: PublishedSource,
  shown: PublishedWork | undefined,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  reports: ReadReports,
): () => void {
  const landed = (revealing: boolean, found: () => void) => {
    if (signal.aborted) return;
    found();
    reports.settle(revealing);
  };
  if (movedBranches !== undefined && shown !== undefined) {
    readMovedProgress(shown, movedBranches, signal, outcomes, reads).then(
      (read) => {
        landed(false, () => {
          reports.show(read, false);
        });
      },
      (error: unknown) => {
        landed(false, () => {
          reports.fail(error);
        });
      },
    );
    return () => {};
  }
  let acceptedMembership = false;
  // The last snapshot shown, and the same with only what the read answered.
  let lastShown: PublishedWork | undefined;
  let lastAnswered: PublishedWork | undefined;
  const acceptProgress = (partial: PublishedWork, answered: PublishedWork) => {
    if (signal.aborted) return;
    const firstMembership = !acceptedMembership;
    acceptedMembership = true;
    if (firstMembership) reports.acceptMembership();
    lastShown = partial;
    lastAnswered = answered;
    reports.show(partial, firstMembership);
  };
  const showAnswered = () => {
    if (lastAnswered !== undefined && lastAnswered !== lastShown) {
      lastShown = lastAnswered;
      reports.show(lastAnswered, false);
    }
  };
  readPublishedWork(
    source,
    signal,
    outcomes,
    acceptProgress,
    revision,
    shown,
    reads,
    fresh,
    confirmation,
  ).then(
    (read) => {
      landed(true, () => {
        acceptProgress(read, read);
        reports.completeDetail();
      });
    },
    (error: unknown) => {
      landed(true, () => {
        showAnswered();
        reports.fail(error, acceptedMembership);
      });
    },
  );
  return () => {
    if (signal.aborted) showAnswered();
  };
}
