// One read the published observation (`./publishedObservation.ts`) asks of
// the selected project, carried out until it lands or is cancelled: of its
// ref afresh, of a revision a check already found the ref naming, or, while
// the ref is unchanged, of only the progress on story branches a check found
// at other heads (`./movedBranchProgress.ts`). A cancelled read reports
// nothing further.

import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import { readMovedProgress } from "./movedBranchProgress.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { readPublishedWork } from "./publishedWorkRead.ts";

export type ReadRequest = {
  readonly asked: number;
  readonly revision: string | undefined;
  readonly movedBranches?: StoryBranchHeads;
};

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

export function carryOutRead(
  { revision, movedBranches }: ReadRequest,
  source: PublishedSource,
  shown: PublishedWork | undefined,
  signal: AbortSignal,
  reports: ReadReports,
) {
  const landed = (revealing: boolean, found: () => void) => {
    if (signal.aborted) return;
    found();
    reports.settle(revealing);
  };
  if (movedBranches !== undefined && shown !== undefined) {
    readMovedProgress(shown, movedBranches, signal).then(
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
    return;
  }
  let acceptedMembership = false;
  const acceptProgress = (partial: PublishedWork) => {
    if (signal.aborted) return;
    const firstMembership = !acceptedMembership;
    acceptedMembership = true;
    if (firstMembership) reports.acceptMembership();
    reports.show(partial, firstMembership);
  };
  readPublishedWork(source, signal, acceptProgress, revision).then(
    (read) => {
      landed(true, () => {
        acceptProgress(read);
        reports.completeDetail();
      });
    },
    (error: unknown) => {
      landed(true, () => {
        reports.fail(error, acceptedMembership);
      });
    },
  );
}
