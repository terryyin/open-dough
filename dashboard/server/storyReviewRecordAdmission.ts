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
import { executionCheckout } from "./executionCheckout.ts";
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
}

export type KeptStoryReview =
  | AdmittedWorkspaceReview
  | {
      readonly kind: "story-review";
      readonly completed: PublishedSource;
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
    }
  | AdmittedSessionReview;

async function admittedIdentityReview(
  read: StoryReviewRead & { readonly subject: ReviewedStorySubject },
): Promise<KeptStoryReview> {
  const found = await namedReviewRun(
    read.subject.source,
    read.subject.identity,
    read,
  );
  if (found.run !== undefined)
    return { kind: "story-review", run: found.run, runs: found.runs };
  const { source, identity, runs } = found;
  if (read.completed === true)
    return {
      kind: "story-review",
      completed: source,
      identity,
      runs,
    };
  const fallback = preferredReviewRun(runs, ({ record }) => record.landing);
  const resolved = await resolvedWorkspace(source, identity, found.records);
  const readable =
    resolved?.kind === "workspace" &&
    directoryState(resolved.established.workspace).kind === "available";
  if (!readable && fallback !== undefined)
    return { kind: "story-review", run: fallback, runs };
  if (resolved === undefined)
    throw new RefusedRequest(
      404,
      "This story has no launch workspace to review.",
    );
  if (resolved.kind === "ambiguous")
    return {
      kind: "story-review",
      explanation: resolved.explanation,
      runs,
    };
  return {
    kind: "story-review",
    sourceId: source.id,
    identity,
    established: resolved.established,
    shown: shownStartWorkspace(
      executionCheckout(source),
      resolved.established.workspace,
    ),
    runs,
    ...(fallback === undefined ? {} : { fallback }),
  };
}

// Admit a story read or select a comparison from the admitted session record.
export async function keptStoryReview(
  input: KeptStoryReviewInput,
): Promise<KeptStoryReview> {
  if ("record" in input)
    return admittedSessionReview(input.record, input.read.run);
  return admittedIdentityReview(input.read);
}
