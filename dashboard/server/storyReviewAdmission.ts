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
import type { EstablishedContext } from "../src/launchRecord.ts";
import {
  markReviewedRequestSchema,
  objectIdSchema,
  reviewIntegrationSchema,
  type ReviewIntegration,
} from "../src/storyReview.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";
import type { AdmittedReviewMark } from "./storyReviewMarks.ts";

export interface AdmittedFileDiff {
  readonly kind: "review-file";
  readonly established: EstablishedContext;
  readonly repository?: string;
  // The tree the file diff compares from.
  readonly baseline: string;
  readonly tree: string;
  readonly path: string;
  // The path the file had at the baseline, for a rename.
  readonly oldPath?: string;
}

export interface AdmittedReviewRange {
  readonly kind: "review-range";
  readonly established: EstablishedContext;
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

export async function rangeRequest(url: URL): Promise<AdmittedReviewRange> {
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
  return { kind: "review-range", established, ...query.data };
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
  let established: EstablishedContext;
  let repository: string | undefined;
  if (url.searchParams.has("reference")) {
    ({ established, repository } = await reviewedRunFile(url, {
      baseline,
      tree,
      path,
      ...(oldPath === undefined ? {} : { oldPath }),
    }));
  } else {
    ({ established } = await queriedWorkspace(url));
  }
  return {
    kind: "review-file",
    established,
    ...(repository === undefined ? {} : { repository }),
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
}

export async function markReviewedRequest(
  req: IncomingMessage,
): Promise<AdmittedReviewMark> {
  const parsed = markReviewedRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success)
    throw new RefusedRequest(400, "The review mark request is malformed.");
  const { source, identity, established } = await reviewedWorkspace(
    parsed.data.source,
    parsed.data.identity,
  );
  return {
    kind: "review-mark",
    sourceId: source.id,
    identity,
    established,
    tree: parsed.data.tree,
    baseline: parsed.data.baseline,
  };
}

export { reviewRequest, type AdmittedReview } from "./storyReviewRequest.ts";
