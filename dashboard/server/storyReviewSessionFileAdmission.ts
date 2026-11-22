// A done session's file read matches its kept result: the landed run its
// launch reference names, or the exact retained pair and literal file list of
// its branch result or kept commits.
import { establishedPlace } from "../src/establishedPlace.ts";
import { branchResultAtDone } from "../src/sessionBranchResult.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  retainedBranchPairFiles,
  retainedCommitPairFiles,
} from "./retainedReviewPair.ts";
import {
  admissionBound,
  admitLandedRun,
  belongsOnRetainedPair,
  notOnCapturedRun,
  throwIfRequestAborted,
  type AdmittedReviewedFile,
  type HistoricalReviewedFileFields,
} from "./storyReviewHistoricalFileAdmission.ts";
import { keptSessionPair } from "./storyReviewSessionCommits.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";

// Admit a file against the session's landed run (by its launch reference) or
// its kept comparison pair.
export async function admitSessionReviewedFile(
  record: LaunchRecord,
  reference: string | undefined,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  return reference === undefined
    ? admitKeptPairFile(record, file, signal)
    : admitSessionLandedRun(record, reference, file, signal);
}

async function admitSessionLandedRun(
  record: LaunchRecord,
  reference: string,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const established = establishedPlace(record);
  if (established === undefined && record.landing === undefined)
    throw new RefusedRequest(
      404,
      "This session has no launch workspace to review.",
    );
  const owned =
    record.request.reporting?.reference === reference ||
    record.landing?.reference === reference;
  if (!owned) throw notOnCapturedRun();
  return admitLandedRun({ record, established }, file, signal);
}

// Admit a file against the exact retained pair of a Done session.
async function admitKeptPairFile(
  record: LaunchRecord,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const branch = branchResultAtDone(record);
  const matchingBranch =
    branch?.base === file.baseline && branch.revision === file.tree
      ? branch
      : undefined;
  const pair = matchingBranch ?? keptSessionPair(record, file);
  const bound = admissionBound(signal);
  const read =
    pair &&
    (matchingBranch === undefined
      ? await retainedCommitPairFiles(pair, bound)
      : await retainedBranchPairFiles(matchingBranch, bound));
  throwIfRequestAborted(signal);
  if (
    !pair ||
    !read ||
    "missing" in read ||
    "attributionGap" in read ||
    !belongsOnRetainedPair(read.files, file)
  )
    throw new RefusedRequest(
      409,
      branch === undefined
        ? "The file or comparison does not belong to this session's kept commits."
        : "The file or comparison does not belong to this session's branch result.",
    );
  return { repository: pair.repository, ...file };
}
