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
import type { SessionBranchEntry } from "../../src/sessionBranchResult.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import {
  anEstablishedSession,
  minutesAgo,
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
// then; a declared branch's record carries its `branchEntry`.
export async function aDoneBranch(
  launch: typeof makeMe.aLaunchRecord,
  {
    doneAt = minutesAgo(10),
    branchEntry,
  }: { doneAt?: string; branchEntry?: SessionBranchEntry } = {},
): Promise<LaunchRecord> {
  const entered = (record: LaunchRecord) =>
    branchEntry === undefined ? record : { ...record, branchEntry };
  const { result } = await captureBranchResult(
    entered(launch.please()),
    doneAt,
  );
  return entered(launch.branchResultFrom(result).markedDoneAt(doneAt).please());
}

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
  const input = reviewRead(kept, record).please();
  const read =
    run === undefined
      ? input
      : { ...input, read: { ...input.read, run: `${run}` } };
  return storyReview(read, new AbortController().signal);
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
