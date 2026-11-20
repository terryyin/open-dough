// The commit-range read's adapter: the query's exact shape becomes one typed
// admitted range. Refusals of that shape answer here; the range reader
// confirms the named objects exist.
import { z } from "zod";
import {
  objectIdSchema,
  reviewIntegrationSchema,
  type ReviewIntegration,
} from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";
import { queriedWorkspace } from "./storyReviewWorkspaceAdmission.ts";

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
