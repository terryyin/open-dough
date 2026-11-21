// The typed review of a Done case's session among the kept records: its
// comparisons, their files, and the answers that explain a missing capture.
// Cases compose their Done records; a case whose topic is the store passes
// what the store keeps.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { changeSessionRecord } from "../../server/launchRecordStore.ts";
import {
  anEstablishedSession,
  minutesAgo,
  source,
  type Checkout,
} from "./doneCaptureCase.ts";

type Kept = readonly LaunchRecord[];

// A Done session established in the checkout at `revision` (its base by
// default) that kept these runs of its commits there.
export const aDoneSession = (
  checkout: Checkout,
  runs: { base: string; revision: string }[],
  revision = checkout.base,
) =>
  anEstablishedSession(checkout, { revision })
    .keptSessionCommits({ repository: checkout.integration, runs })
    .markedDone()
    .please();

// The launch marked Done at `doneAt` with the branch result its Git captures
// then.
export async function aDoneBranch(
  launch: typeof makeMe.aLaunchRecord,
  { doneAt = minutesAgo(10) }: { doneAt?: string } = {},
): Promise<LaunchRecord> {
  const { result } = await captureBranchResult(launch.please(), doneAt);
  return launch.branchResultFrom(result).markedDoneAt(doneAt).please();
}

// The kept record of `record`'s session, now Done at `doneAt` with the branch
// result its Git captures then, as the landing handlers read it.
export const keptAsDone = (record: LaunchRecord, doneAt = minutesAgo(10)) =>
  changeSessionRecord(source, record.session, async (kept) => {
    const { result } = await captureBranchResult(kept, doneAt);
    return { ...kept, branchResult: result, doneAt };
  });

// The kept record of `record`'s session, now Done at `doneAt` after its
// branch was retired, so that Done's branch read failed.
export const keptAsDoneAfterRetirement = (
  record: LaunchRecord,
  doneAt = minutesAgo(10),
) =>
  changeSessionRecord(source, record.session, (kept) => ({
    ...kept,
    doneAt,
    branchResultFailedAt: doneAt,
  }));

const reviewRead = (kept: Kept, record: LaunchRecord) =>
  makeMe.aSessionReviewRead
    .ofSession(record.session.sessionId, record.session.host)
    .keeping([...kept]);

// The typed review of the session, at its first run or at `run`.
export async function review(
  kept: Kept,
  record: LaunchRecord,
  run?: number | string,
) {
  const read = reviewRead(kept, record);
  if (run !== undefined) read.selectingRun(`${run}`);
  return storyReview(read.please(), new AbortController().signal);
}

// A file of one comparison; a landed run's read also names its reference.
type NamedFile = {
  baseline: string;
  tree: string;
  path: string;
  oldPath?: string;
  reference?: string;
};

export async function fileText(
  kept: Kept,
  record: LaunchRecord,
  file: NamedFile,
) {
  const read = reviewRead(kept, record).readingFile(file).please();
  return reviewedFileText(read, new AbortController().signal);
}

export async function fileDiff(
  kept: Kept,
  record: LaunchRecord,
  file: NamedFile,
) {
  const read = reviewRead(kept, record).readingFile(file).please();
  return reviewedFileDiff(read, new AbortController().signal);
}

export const notCaptured = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session's changes were not captured.",
};

export const noCommits = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session made no commits in the Default main checkout.",
};
