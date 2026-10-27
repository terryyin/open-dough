// One authoritative retained-record read supplies both historical choices and
// the shared workspace opening rule.
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import {
  preferredReviewRun,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { queriedRun } from "./storyReviewRunAdmission.ts";
import { resolvedWorkspace } from "./storyReviewWorkspaceAdmission.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { projectFolder } from "./projectFolders.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";
import type { PublishedSource } from "../src/publishedSource.ts";

interface AdmittedWorkspaceReview {
  readonly kind: "story-review";
  readonly sourceId: string;
  readonly identity: string;
  readonly established: ReviewedWorkspace;
  // The workspace as the page shows it.
  readonly shown: string;
  readonly fallback?: ReviewLandedRun;
  readonly runs: readonly ReviewLandedRun[];
  readonly publishedFallback?: {
    readonly source: PublishedSource;
    readonly identity: string;
  };
}

export type AdmittedStoryReview =
  | AdmittedWorkspaceReview
  | {
      readonly kind: "story-review";
      readonly published: PublishedSource;
      readonly identity: string;
      readonly runs: readonly ReviewLandedRun[];
    }
  // Several worktrees hold the story's claim: the review reads none and says
  // why.
  | {
      readonly kind: "story-review";
      readonly explanation: string;
      readonly runs: readonly ReviewLandedRun[];
    }
  | {
      readonly kind: "story-review";
      readonly run: ReviewLandedRun;
      readonly runs: readonly ReviewLandedRun[];
      readonly publishedFallback?: {
        readonly source: PublishedSource;
        readonly identity: string;
      };
    };

export async function storyReviewRequest(
  url: URL,
): Promise<AdmittedStoryReview> {
  requireExactQuery(
    url,
    [
      "source",
      "identity",
      ...(url.searchParams.has("reference") ? ["reference"] : []),
      ...(url.searchParams.has("run") ? ["run"] : []),
      ...(url.searchParams.has("completed") ? ["completed"] : []),
    ],
    "review",
  );
  const completed = url.searchParams.get("completed");
  if (completed !== null && completed !== "true")
    throw new RefusedRequest(400, "The completed review request is malformed.");
  const found = await queriedRun(url);
  if (url.searchParams.has("reference") && url.searchParams.has("run"))
    throw new RefusedRequest(400, "The review names two run identities.");
  if (found.run !== undefined)
    return { kind: "story-review", run: found.run, runs: found.runs };
  const fallback = preferredReviewRun(
    found.runs,
    ({ record }) => record.landing,
  );
  const { source, identity } = found;
  const resolved = await resolvedWorkspace(source, identity, found.records);
  const readable =
    resolved?.kind === "workspace" &&
    directoryState(resolved.established.workspace).kind === "available";
  if (!readable && fallback !== undefined)
    return {
      kind: "story-review",
      run: fallback,
      runs: found.runs,
      ...(completed === "true"
        ? { publishedFallback: { source, identity } }
        : {}),
    };
  if (
    completed === "true" &&
    (resolved === undefined || resolved.kind === "ambiguous")
  )
    return {
      kind: "story-review",
      published: source,
      identity,
      runs: found.runs,
    };
  if (resolved === undefined)
    throw new RefusedRequest(
      404,
      "This story has no launch workspace to review.",
    );
  if (resolved.kind === "ambiguous")
    return {
      kind: "story-review",
      explanation: resolved.explanation,
      runs: found.runs,
    };
  return {
    kind: "story-review",
    sourceId: source.id,
    identity,
    established: resolved.established,
    shown: shownStartWorkspace(
      projectFolder(source),
      resolved.established.workspace,
    ),
    runs: found.runs,
    ...(completed === "true"
      ? { publishedFallback: { source, identity } }
      : {}),
    ...(fallback === undefined ? {} : { fallback }),
  };
}
