// The typed review of a Done capture case's kept session: its comparisons,
// their files, and the answers that explain a missing capture.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptRecords } from "../../server/launchRecordStore.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { source } from "./doneCaptureCase.ts";

const reviewRead = async (record: LaunchRecord) =>
  makeMe.aSessionReviewRead
    .ofSession(record.session.sessionId, record.session.host)
    .keeping(await keptRecords(source));

// The typed review of the kept session, at its first run or at `run`.
export async function review(record: LaunchRecord, run?: number | string) {
  const input = (await reviewRead(record)).please();
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

export async function fileText(record: LaunchRecord, file: NamedFile) {
  const read = (await reviewRead(record)).readingFile(file).please();
  return reviewedFileText(read, new AbortController().signal);
}

export async function fileDiff(record: LaunchRecord, file: NamedFile) {
  const read = (await reviewRead(record)).readingFile(file).please();
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
