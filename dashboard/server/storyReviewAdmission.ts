// Admit files only from their named story comparison or recorded session pair.

import { knownSource } from "./sessionAdmission.ts";
import {
  admitHistoricalReviewedFile,
  belongsOnPublishedStory,
  type AdmittedReviewedFile,
} from "./storyReviewHistoricalFileAdmission.ts";
import type { ReviewedFileInput } from "./storyReviewInput.ts";
import { admitPublishedSessionFile } from "./publishedSessionReview.ts";
import { admitSessionReviewedFile } from "./storyReviewSessionFileAdmission.ts";
import { reviewRepositoryPath } from "./reviewRepository.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { publishedTakenReview } from "./storyReviewPublishedTaken.ts";

// Admit the read file against its subject's comparison: a story's
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
    return admitSessionReviewedFile(
      input.source,
      input.record,
      reference,
      file,
      signal,
    );
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
      review.kind !== "published-taken" ||
      !belongsOnPublishedStory(review, file)
    )
      throw new RefusedRequest(
        409,
        review.kind === "unavailable"
          ? review.explanation
          : "The file or comparison does not belong to this published head.",
      );
    return { repository: reviewRepositoryPath(source), ...file };
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
  throw new RefusedRequest(400, "The file must name a published comparison.");
}
