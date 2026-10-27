// A review names an exact project and work identity, never a repository path.
// Workspace review follows reviewWorkspaceOf; a named historical run follows
// its retained launch. File reads name hexadecimal comparison objects and
// literal changed paths, including a rename's old path. Historical reads must
// match that run's captured pair and file list.
// Marking is a same-origin POST of the workspace snapshot's tree and baseline.
// Commit ranges name listed fromTree/fromBaseline and tree/baseline points;
// the range reader confirms their objects exist. Uncommitted changes compare
// the head tree with the snapshot tree on the same baseline. Optional
// integrations name selected merges' listed parent points and destination
// baselines, without accepting paths or rereading history.

import {
  reviewedWorkspace,
  queriedWorkspace,
} from "./storyReviewWorkspaceAdmission.ts";
import { reviewedRunFile } from "./storyReviewRunAdmission.ts";
import type { IncomingMessage } from "node:http";
import { z } from "zod";
import {
  markReviewedRequestSchema,
  objectIdSchema,
  reviewIntegrationSchema,
  type ReviewIntegration,
} from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";
import type { AdmittedStoryReviewMark } from "./storyReviewMarks.ts";
import { queriedRun } from "./storyReviewRunAdmission.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";
import { projectFolder } from "./projectFolders.ts";

export interface AdmittedFileDiff {
  readonly kind: "story-review-file";
  readonly repository: string;
  // The tree the file diff compares from.
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

const reviewedPathSchema = z
  .string()
  .min(1)
  .refine((path) => !path.includes("\0"));

const fileDiffQuerySchema = z.object({
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
  const { established } = await queriedWorkspace(url);
  return { kind: "story-review-range", established, ...query.data };
}

export async function fileDiffRequest(url: URL): Promise<AdmittedFileDiff> {
  requireExactQuery(
    url,
    [
      "source",
      "identity",
      "baseline",
      "tree",
      "path",
      ...(url.searchParams.has("reference") ? ["reference"] : []),
      ...(url.searchParams.has("completion") ? ["completion"] : []),
      ...(url.searchParams.has("oldPath") ? ["oldPath"] : []),
    ],
    "file diff",
  );
  const query = fileDiffQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!query.success)
    throw new RefusedRequest(
      400,
      "The file diff names a malformed object or path.",
    );
  const { baseline, tree, path, oldPath } = query.data;
  let repository: string;
  if (url.searchParams.has("completion")) {
    const named = objectIdSchema.safeParse(url.searchParams.get("completion"));
    if (!named.success || url.searchParams.has("reference"))
      throw new RefusedRequest(
        400,
        "The published comparison identity is malformed.",
      );
    const { source, identity } = await queriedRun(url);
    const review = await publishedStoryReview(
      source,
      identity,
      AbortSignal.timeout(30_000),
      named.data,
    );
    if (review?.kind !== "published")
      throw new RefusedRequest(
        409,
        review?.kind === "unavailable"
          ? review.explanation
          : "Published comparison unavailable.",
      );
    if (
      named.data !== review.completion ||
      tree !== review.tree ||
      !review.files.some(
        (file) =>
          file.path === path &&
          (file.includesTrunkFrom ?? review.baseline) === baseline &&
          (file.kind === "renamed"
            ? file.oldPath === oldPath
            : oldPath === undefined),
      )
    )
      throw new RefusedRequest(
        409,
        "The file or comparison does not belong to this published completion.",
      );
    repository = projectFolder(source).path;
  } else if (url.searchParams.has("reference")) {
    const run = await reviewedRunFile(url, {
      baseline,
      tree,
      path,
      ...(oldPath === undefined ? {} : { oldPath }),
    });
    repository = run.repository ?? run.established.workspace;
  } else {
    repository = (await queriedWorkspace(url)).established.workspace;
  }
  return {
    kind: "story-review-file",
    repository,
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
}

export async function markReviewedRequest(
  req: IncomingMessage,
): Promise<AdmittedStoryReviewMark> {
  const parsed = markReviewedRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success)
    throw new RefusedRequest(400, "The review mark request is malformed.");
  const { source, identity, established } = await reviewedWorkspace(
    parsed.data.source,
    parsed.data.identity,
  );
  return {
    kind: "story-review-mark",
    sourceId: source.id,
    identity,
    established,
    tree: parsed.data.tree,
    baseline: parsed.data.baseline,
  };
}

export {
  storyReviewRequest,
  type AdmittedStoryReview,
} from "./storyReviewRequest.ts";
