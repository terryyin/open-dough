// A review names an exact project and reviewed-work subject (story identity or
// session), never a repository path. Workspace review follows reviewWorkspaceOf;
// a named historical completion or landed run follows retained publication or
// launch evidence. File reads name hexadecimal comparison objects and literal
// changed paths, including a rename's old path. Historical reads must match that
// comparison's pair and file list: a story's through admitHistoricalReviewedFile,
// a session's through admitSessionReviewedFile.
// Commit ranges name listed fromTree/fromBaseline and tree/baseline points;
// the range reader confirms their objects exist. Uncommitted changes compare
// the head tree with the snapshot tree on the same baseline. Optional
// integrations name selected merges' listed parent points and destination
// baselines, without accepting paths or rereading history.

import { z } from "zod";
import type { ReviewedFileRead } from "../src/reviewedFileRead.ts";
import {
  objectIdSchema,
  reviewIntegrationSchema,
  type ReviewIntegration,
} from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource, requireExactQuery } from "./sessionAdmission.ts";
import {
  admitHistoricalReviewedFile,
  type AdmittedHistoricalReviewedFile,
} from "./storyReviewHistoricalFileAdmission.ts";
import { admitSessionReviewedFile } from "./storyReviewSessionFileAdmission.ts";
import type { ReviewInput } from "./storyReviewSessionAdmission.ts";
import {
  queriedWorkspace,
  storyWorkspace,
} from "./storyReviewWorkspaceAdmission.ts";

// One admitted comparison identity for printed diff or revision file text.
type AdmittedReviewedFile = AdmittedHistoricalReviewedFile;

// The file handlers' typed input over the file read.
export type ReviewedFileInput = ReviewInput<ReviewedFileRead>;

export interface AdmittedStoryReviewRange {
  readonly kind: "story-review-range";
  readonly established: ReviewedWorkspace;
  readonly fromTree: string;
  readonly fromBaseline: string;
  readonly tree: string;
  readonly baseline: string;
  readonly integrations: readonly ReviewIntegration[];
}

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

// Admit the read file against its subject's comparison: a story's workspace,
// Published completion or landed run through today's admission path, or a
// session's kept launch records the adapter read.
export async function admitReviewedFile(
  input: ReviewedFileInput,
): Promise<AdmittedReviewedFile> {
  const { subject, reference, completion, ...file } = input.read;
  if ("kept" in input) {
    if (completion !== undefined)
      throw new RefusedRequest(
        400,
        "The published comparison identity is malformed.",
      );
    return admitSessionReviewedFile(
      input.read.subject,
      reference,
      file,
      input.kept,
    );
  }
  const { identity } = input.read.subject;
  const source = knownSource(subject.source);
  if (completion !== undefined)
    return admitHistoricalReviewedFile({
      source,
      identity,
      completion,
      ...file,
    });
  if (reference !== undefined)
    return admitHistoricalReviewedFile({
      source,
      identity,
      reference,
      ...file,
    });
  return {
    repository: (await storyWorkspace(source, identity)).workspace,
    ...file,
  };
}
