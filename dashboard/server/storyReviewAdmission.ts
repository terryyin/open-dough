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
  belongsOnPublishedStory,
  type AdmittedReviewedFile,
} from "./storyReviewHistoricalFileAdmission.ts";
import type { ReviewedFileInput } from "./storyReviewInput.ts";
import { admitPublishedSessionFile } from "./publishedSessionReview.ts";
import { admitSessionReviewedFile } from "./storyReviewSessionFileAdmission.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { publishedTakenReview } from "./storyReviewPublishedTaken.ts";
import { storyWorkspace } from "./storyReviewWorkspaceAdmission.ts";

// Admit the read file against its subject's comparison: a story's workspace,
// Published completion or landed run, a local session's admitted launch
// record, or a published session's fetched project source.
export async function admitReviewedFile(
  input: ReviewedFileInput,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
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
  const { subject, reference, completion, publishedHead, ...file } = input.read;
  const { identity } = subject;
  const source = knownSource(subject.source);
  if (publishedHead !== undefined) {
    if (reference !== undefined || completion !== undefined)
      throw new RefusedRequest(
        400,
        "The file names multiple review comparisons.",
      );
    const review = await publishedTakenReview(
      source,
      identity,
      signal,
      publishedHead,
    );
    if (
      review?.kind !== "published-taken" ||
      !belongsOnPublishedStory(review, file)
    )
      throw new RefusedRequest(
        409,
        review?.kind === "unavailable"
          ? review.explanation
          : "The file or comparison does not belong to this published branch head.",
      );
    return { repository: executionCheckout(source).path, ...file };
  }
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
