// One authoritative retained-record read supplies both historical choices and
// the shared workspace opening rule. A typed review read names either a story
// identity or an ad hoc session; the kept records admit it through one path.
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import {
  preferredReviewRun,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { namedReviewRun } from "./storyReviewRunAdmission.ts";
import { resolvedWorkspace } from "./storyReviewWorkspaceAdmission.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { projectFolder } from "./projectFolders.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  admittedSessionReview,
  type AdmittedSessionReview,
} from "./storyReviewSessionAdmission.ts";
import type { KeptStoryReviewInput } from "./storyReviewInput.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewedStorySubject } from "../src/reviewedWorkSubject.ts";
import type { StoryReviewRead } from "../src/storyReviewRead.ts";

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

export type KeptStoryReview =
  | AdmittedWorkspaceReview
  | {
      readonly kind: "story-review";
      readonly historical: PublishedSource;
      readonly identity: string;
      readonly runs: readonly ReviewLandedRun[];
    }
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
    }
  | AdmittedSessionReview;

async function admittedIdentityReview(
  read: StoryReviewRead & { readonly subject: ReviewedStorySubject },
): Promise<KeptStoryReview> {
  const { completed, historical } = read;
  const found = await namedReviewRun(
    read.subject.source,
    read.subject.identity,
    read,
  );
  if (found.run !== undefined)
    return { kind: "story-review", run: found.run, runs: found.runs };
  if (historical === true)
    return {
      kind: "story-review",
      historical: found.source,
      identity: found.identity,
      runs: found.runs,
    };
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
      ...(completed === true
        ? { publishedFallback: { source, identity } }
        : {}),
    };
  if (
    completed === true &&
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
    ...(completed === true ? { publishedFallback: { source, identity } } : {}),
    ...(fallback === undefined ? {} : { fallback }),
  };
}

// Admits a typed review read against the kept records; a session read
// against its kept session state.
export async function keptStoryReview(
  input: KeptStoryReviewInput,
): Promise<KeptStoryReview> {
  if ("kept" in input)
    return admittedSessionReview(
      input.read.subject,
      input.read.run,
      input.kept,
    );
  return admittedIdentityReview(input.read);
}
