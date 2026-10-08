// A story review names a known project and a work identity, exactly, never a
// path: its workspace comes from the project's kept launch records by the
// rule the card offers Review changes with (`reviewWorkspaceOf`). A file diff
// of the review also names the object IDs of the tree it compares from (as
// `baseline`: the snapshot's baseline, or the *from* tree of the changes
// since the review shown) and of the snapshot's tree, which must be
// hexadecimal, and the file's path within them (and its old path for a
// rename), which Git receives only as literal paths after `--`. Marking a
// snapshot reviewed is a same-origin POST naming the project, the work
// identity, and the snapshot's tree and baseline object IDs, its workspace
// resolved by the same rule.
// A commit range is a GET naming that same project and identity and two
// points from the snapshot's list: `fromTree`, `fromBaseline`, `tree`, and
// `baseline`, all hexadecimal object IDs. Its workspace is resolved by the
// same rule; the range read confirms the repository holds those objects.
// The Uncommitted changes item supplies the head tree as its from point and
// the snapshot tree as its to point, both on the snapshot baseline.
// Optional `integrations` is a JSON array of selected merges' already-listed
// `fromTree`, `fromBaseline`, and destination `baseline` object IDs. It
// supplies integration conflicts without accepting paths or rereading history.

import type { IncomingMessage } from "node:http";
import { z } from "zod";
import { workIdentitySchema } from "../src/launchRequest.ts";
import type { EstablishedContext } from "../src/launchRecord.ts";
import {
  markReviewedRequestSchema,
  objectIdSchema,
  reviewIntegrationSchema,
  type ReviewIntegration,
  reviewWorkspaceOf,
} from "../src/storyReview.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { projectFolder } from "./projectFolders.ts";
import { knownSource, requireExactQuery } from "./sessionAdmission.ts";
import type { AdmittedReviewMark } from "./storyReviewMarks.ts";

export interface AdmittedReview {
  readonly kind: "review";
  readonly sourceId: string;
  readonly identity: string;
  readonly established: EstablishedContext;
  // The workspace as the page shows it.
  readonly shown: string;
}

export interface AdmittedFileDiff {
  readonly kind: "review-file";
  readonly established: EstablishedContext;
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

// The workspace the named story's review reads.
async function reviewedWorkspace(
  sourceId: string | null,
  identityNamed: string | null,
) {
  const source = knownSource(sourceId);
  const identity = workIdentitySchema.safeParse(identityNamed);
  if (!identity.success)
    throw new RefusedRequest(400, "The review identity is malformed.");
  const found = reviewWorkspaceOf(
    await keptRecords(source.id),
    source.id,
    identity.data,
  );
  if (found === undefined)
    throw new RefusedRequest(
      404,
      "This story has no launch workspace to review.",
    );
  return { source, identity: identity.data, established: found.established };
}

// The workspace the story named in the query reviews.
const queriedWorkspace = (url: URL) =>
  reviewedWorkspace(
    url.searchParams.get("source"),
    url.searchParams.get("identity"),
  );

export async function reviewRequest(url: URL): Promise<AdmittedReview> {
  requireExactQuery(url, ["source", "identity"], "review");
  const { source, identity, established } = await queriedWorkspace(url);
  return {
    kind: "review",
    sourceId: source.id,
    identity,
    established,
    shown: shownStartWorkspace(projectFolder(source), established.workspace),
  };
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
  const { established } = await queriedWorkspace(url);
  const { baseline, tree, path, oldPath } = query.data;
  return {
    kind: "review-file",
    established,
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
