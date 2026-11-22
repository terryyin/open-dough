// The file diff and file text reads' adapter: the query's exact shape becomes
// one typed read. Refusals of that shape answer here; the kept records and
// repository decide the rest in the handlers (`./storyReviewFileResponse.ts`).
import { z } from "zod";
import type {
  PublishedSessionFileRead,
  ReviewedFileRead,
  SessionFileRead,
} from "../src/reviewedFileRead.ts";
import type { ReviewedStorySubject } from "../src/reviewedWorkSubject.ts";
import {
  objectIdSchema,
  reviewedPathSchema,
} from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  queriedPublishedSessionSubject,
  queriedSessionSubject,
  queriedStorySubject,
  reviewedWorkSubjectQuery,
} from "./reviewedWorkSubjectAdmission.ts";
import { requireExactQuery } from "./sessionAdmission.ts";

export interface AdmittedReviewedFileRead {
  readonly kind: "story-review-file" | "story-review-file-text";
  readonly read:
    | (ReviewedFileRead & { readonly subject: ReviewedStorySubject })
    | SessionFileRead
    | PublishedSessionFileRead;
}

const reviewedFileQuerySchema = z.object({
  baseline: objectIdSchema,
  tree: objectIdSchema,
  path: reviewedPathSchema,
  oldPath: reviewedPathSchema.optional(),
});

function reviewedFileRead(
  url: URL,
  label: "file diff" | "file text",
):
  | (ReviewedFileRead & { readonly subject: ReviewedStorySubject })
  | SessionFileRead
  | PublishedSessionFileRead {
  const subject = reviewedWorkSubjectQuery(url);
  const reference = url.searchParams.get("reference");
  const completion = url.searchParams.get("completion");
  requireExactQuery(
    url,
    [
      ...subject.keys,
      "baseline",
      "tree",
      "path",
      ...(reference === null ? [] : ["reference"]),
      ...(completion === null ? [] : ["completion"]),
      ...(url.searchParams.has("oldPath") ? ["oldPath"] : []),
    ],
    label,
  );
  const query = reviewedFileQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!query.success)
    throw new RefusedRequest(
      400,
      `The ${label} names a malformed object or path.`,
    );
  const { baseline, tree, path, oldPath } = query.data;
  const file = {
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
  // A published session names its pair alone, never a run or completion.
  if (subject.kind === "published") {
    if (reference !== null || completion !== null)
      throw new RefusedRequest(400, `The ${label} request is malformed.`);
    return { subject: queriedPublishedSessionSubject(url), ...file };
  }
  if (
    completion !== null &&
    (!objectIdSchema.safeParse(completion).success || reference !== null)
  )
    throw new RefusedRequest(
      400,
      "The published comparison identity is malformed.",
    );
  // A Published completion names a story, whichever subject keys came with it.
  if (completion !== null || subject.kind === "story")
    return {
      subject: queriedStorySubject(url),
      ...(reference === null ? {} : { reference }),
      ...(completion === null ? {} : { completion }),
      ...file,
    };
  const session = queriedSessionSubject(url);
  if (reference !== null && !z.uuid().safeParse(reference).success)
    throw new RefusedRequest(400, "The review launch reference is malformed.");
  const sessionFile: SessionFileRead = {
    subject: session,
    ...(reference === null ? {} : { reference }),
    ...file,
  };
  return sessionFile;
}

export function fileDiffRequest(url: URL): AdmittedReviewedFileRead {
  return {
    kind: "story-review-file",
    read: reviewedFileRead(url, "file diff"),
  };
}

export function fileTextRequest(url: URL): AdmittedReviewedFileRead {
  return {
    kind: "story-review-file-text",
    read: reviewedFileRead(url, "file text"),
  };
}
