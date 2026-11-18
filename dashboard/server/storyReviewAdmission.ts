// A review names an exact project and reviewed-work subject (story identity or
// session), never a repository path. Workspace review follows reviewWorkspaceOf;
// a named historical completion or landed run follows retained publication or
// launch evidence. File reads name hexadecimal comparison objects and literal
// changed paths, including a rename's old path. Historical reads must match that
// comparison's pair and file list through admitHistoricalReviewedFile.
// Commit ranges name listed fromTree/fromBaseline and tree/baseline points;
// the range reader confirms their objects exist. Uncommitted changes compare
// the head tree with the snapshot tree on the same baseline. Optional
// integrations name selected merges' listed parent points and destination
// baselines, without accepting paths or rereading history.

import { queriedWorkspace } from "./storyReviewWorkspaceAdmission.ts";
import { z } from "zod";
import {
  objectIdSchema,
  reviewedPathSchema,
  reviewIntegrationSchema,
  type ReviewIntegration,
} from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";
import {
  admitHistoricalReviewedFile,
  admitSessionComparisonFile,
} from "./storyReviewHistoricalFileAdmission.ts";
import { queriedReviewIdentity } from "./storyReviewRunAdmission.ts";
import {
  queriedReviewedSessionSubject,
  reviewedWorkSubjectQuery,
} from "./reviewedWorkSubjectAdmission.ts";

// One admitted comparison identity for printed diff or revision file text.
export interface AdmittedReviewedFile {
  readonly kind: "story-review-file" | "story-review-file-text";
  readonly repository: string;
  // The tree the comparison reads from.
  readonly baseline: string;
  readonly tree: string;
  readonly path: string;
  // The path the file had at the baseline, for a rename.
  readonly oldPath?: string;
}

export interface AdmittedStoryReviewRange {
  readonly kind: "story-review-range";
  readonly established: ReviewedWorkspace;
  readonly fromTree: string;
  readonly fromBaseline: string;
  readonly tree: string;
  readonly baseline: string;
  readonly integrations: readonly ReviewIntegration[];
}

const reviewedFileQuerySchema = z.object({
  baseline: objectIdSchema,
  tree: objectIdSchema,
  path: reviewedPathSchema,
  oldPath: reviewedPathSchema.optional(),
});

const rangeQuerySchema = z.object({
  fromTree: objectIdSchema,
  fromBaseline: objectIdSchema,
  tree: objectIdSchema,
  baseline: objectIdSchema,
  integrations: z.array(reviewIntegrationSchema),
});

export async function rangeRequest(
  url: URL,
): Promise<AdmittedStoryReviewRange> {
  requireExactQuery(
    url,
    [
      "source",
      "identity",
      "fromTree",
      "fromBaseline",
      "tree",
      "baseline",
      ...(url.searchParams.has("integrations") ? ["integrations"] : []),
    ],
    "commit range",
  );
  let integrations: unknown = [];
  try {
    const named = url.searchParams.get("integrations");
    if (named !== null) {
      integrations = JSON.parse(named) as unknown;
    }
  } catch {
    throw new RefusedRequest(
      400,
      "The commit range names malformed integrations.",
    );
  }
  const query = rangeQuerySchema.safeParse({
    ...Object.fromEntries(url.searchParams),
    integrations,
  });
  if (!query.success)
    throw new RefusedRequest(400, "The commit range names a malformed object.");
  const established = await queriedWorkspace(url);
  return { kind: "story-review-range", established, ...query.data };
}

async function admitReviewedFile(
  url: URL,
  kind: AdmittedReviewedFile["kind"],
  label: "file diff" | "file text",
): Promise<AdmittedReviewedFile> {
  const subject = reviewedWorkSubjectQuery(url);
  requireExactQuery(
    url,
    [
      ...subject.keys,
      "baseline",
      "tree",
      "path",
      ...(url.searchParams.has("reference") ? ["reference"] : []),
      ...(url.searchParams.has("completion") ? ["completion"] : []),
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
  if (url.searchParams.has("completion")) {
    const named = objectIdSchema.safeParse(url.searchParams.get("completion"));
    if (!named.success || url.searchParams.has("reference"))
      throw new RefusedRequest(
        400,
        "The published comparison identity is malformed.",
      );
    const { source, identity } = queriedReviewIdentity(url);
    const admitted = await admitHistoricalReviewedFile({
      source,
      identity,
      completion: named.data,
      ...file,
    });
    return { kind, ...admitted };
  }
  if (url.searchParams.has("reference")) {
    const named =
      subject.kind === "session"
        ? queriedReviewedSessionSubject(url)
        : queriedReviewIdentity(url);
    const admitted = await admitHistoricalReviewedFile({
      ...named,
      reference: url.searchParams.get("reference") ?? "",
      ...file,
    });
    return { kind, ...admitted };
  }
  if (subject.kind === "session")
    return {
      kind,
      ...(await admitSessionComparisonFile(
        queriedReviewedSessionSubject(url),
        file,
      )),
    };
  return {
    kind,
    repository: (await queriedWorkspace(url)).workspace,
    ...file,
  };
}

export async function fileDiffRequest(url: URL): Promise<AdmittedReviewedFile> {
  return admitReviewedFile(url, "story-review-file", "file diff");
}

export async function fileTextRequest(url: URL): Promise<AdmittedReviewedFile> {
  return admitReviewedFile(url, "story-review-file-text", "file text");
}

export {
  storyReviewRequest,
  type AdmittedStoryReview,
} from "./storyReviewRequest.ts";
