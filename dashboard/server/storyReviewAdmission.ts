// A story review names a known project and a work identity, exactly, never a
// path: its workspace comes from the project's kept launch records by the
// rule the card offers Review changes with (`reviewWorkspaceOf`). A file diff
// of the review also names the snapshot's baseline and tree object IDs, which
// must be hexadecimal, and the file's path within them (and its old path for
// a rename), which Git receives only as literal paths after `--`. Marking a
// snapshot reviewed is a same-origin POST naming the project, the work
// identity, and the snapshot's tree and baseline object IDs, its workspace
// resolved by the same rule.

import type { IncomingMessage } from "node:http";
import { z } from "zod";
import { workIdentitySchema } from "../src/launchRequest.ts";
import type { EstablishedContext } from "../src/launchRecord.ts";
import {
  markReviewedRequestSchema,
  objectIdSchema,
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
  readonly baseline: string;
  readonly tree: string;
  readonly path: string;
  // The path the file had at the baseline, for a rename.
  readonly oldPath?: string;
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
