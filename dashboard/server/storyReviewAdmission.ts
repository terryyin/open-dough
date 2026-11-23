// Typed file admission for a review subject's comparison. Workspace review
// follows reviewWorkspaceOf; a named historical completion or landed run
// follows retained publication or launch evidence. File reads name hexadecimal
// comparison objects and literal changed paths, including a rename's old path.
// Historical reads must match that comparison's pair and file list: a story's
// through admitHistoricalReviewedFile, a session's through
// admitSessionReviewedFile. The range-read URL adapter lives in
// storyReviewRangeRequest.ts.

import { knownSource } from "./sessionAdmission.ts";
import {
  admitHistoricalReviewedFile,
  type AdmittedReviewedFile,
} from "./storyReviewHistoricalFileAdmission.ts";
import {
  missingOriginatingComparison,
  type ReviewedFileInput,
} from "./storyReviewInput.ts";
import {
  admitPublishedSessionFile,
  admitPublishedSessionPairFile,
} from "./publishedSessionReview.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { admitSessionReviewedFile } from "./storyReviewSessionFileAdmission.ts";
import { storyWorkspace } from "./storyReviewWorkspaceAdmission.ts";

// Admit the read file against its subject's comparison: a story's workspace,
// Published completion or landed run, a local session's admitted launch
// record, or a published session's fetched project source.
export async function admitReviewedFile(
  input: ReviewedFileInput,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  if ("originating" in input) {
    const { originating } = input;
    if (originating === undefined)
      throw new RefusedRequest(404, missingOriginatingComparison);
    const { baseline, tree, path, oldPath, reference, completion } = input.read;
    if (reference !== undefined || completion !== undefined)
      throw new RefusedRequest(
        409,
        "This story uses its originating session's published comparison.",
      );
    return admitPublishedSessionPairFile(
      originating.source,
      [originating.range],
      { baseline, tree, path, ...(oldPath === undefined ? {} : { oldPath }) },
      signal,
    );
  }
  if ("published" in input) {
    const { subject, ...file } = input.read;
    return admitPublishedSessionFile(
      input.published,
      subject.published,
      file,
      input.now,
      signal,
    );
  }
  if ("record" in input) {
    const { reference, ...file } = input.read;
    return admitSessionReviewedFile(input.record, reference, file, signal);
  }
  const { subject, reference, completion, ...file } = input.read;
  const { identity } = subject;
  const source = knownSource(subject.source);
  if (completion !== undefined)
    return admitHistoricalReviewedFile(
      {
        source,
        identity,
        completion,
        ...file,
      },
      signal,
    );
  if (reference !== undefined)
    return admitHistoricalReviewedFile(
      {
        source,
        identity,
        reference,
        ...file,
      },
      signal,
    );
  return {
    repository: (await storyWorkspace(source, identity)).workspace,
    ...file,
  };
}
