// One authoritative retained-record read supplies both historical choices and
// the shared workspace opening rule. The review names either a story identity
// or an ad hoc session through one admission path.
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import {
  preferredReviewRun,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { establishedPlace } from "../src/establishedPlace.ts";
import { launchSubject } from "../src/launchWorkflow.ts";
import { queriedRun } from "./storyReviewRunAdmission.ts";
import {
  keptSessionRun,
  type KeptSessionRun,
} from "./storyReviewSessionCommits.ts";
import { resolvedWorkspace } from "./storyReviewWorkspaceAdmission.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { projectFolder } from "./projectFolders.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  queriedReviewedSessionSubject,
  reviewedWorkSubjectQuery,
} from "./reviewedWorkSubjectAdmission.ts";
import { namedKeptSession, requireExactQuery } from "./sessionAdmission.ts";
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
  // A Default main session's kept commits (`../src/sessionCommits.ts`).
  | {
      readonly kind: "story-review";
      readonly sessionRun: KeptSessionRun;
      readonly runs: readonly ReviewLandedRun[];
    }
  // An ad hoc session kept without a landing: explain before the landed reader,
  // including default launches that established no place.
  | {
      readonly kind: "story-review";
      readonly landingUnavailable: string;
      readonly runs: readonly ReviewLandedRun[];
    };

async function sessionReviewRequest(url: URL): Promise<AdmittedStoryReview> {
  const named = url.searchParams.get("run");
  requireExactQuery(
    url,
    ["source", "host", "session", ...(named === null ? [] : ["run"])],
    "review",
  );
  const { source, host, session } = queriedReviewedSessionSubject(url);
  const record = await namedKeptSession(source, {
    host,
    sessionId: session,
  });
  if (launchSubject(record.request).identity !== undefined)
    throw new RefusedRequest(
      400,
      "This session belongs to a story launch and is reviewed by its story.",
    );
  if (record.landing === undefined) {
    const sessionRun = keptSessionRun(record, named);
    if (sessionRun !== undefined)
      return { kind: "story-review", sessionRun, runs: [] };
    return {
      kind: "story-review",
      landingUnavailable: "This session's changes were not captured.",
      runs: [],
    };
  }
  const established = establishedPlace(record);
  if (established === undefined)
    throw new RefusedRequest(
      404,
      "This session has no launch workspace to review.",
    );
  return {
    kind: "story-review",
    run: { record, established },
    runs: [],
  };
}

async function identityReviewRequest(url: URL): Promise<AdmittedStoryReview> {
  requireExactQuery(
    url,
    [
      "source",
      "identity",
      ...(url.searchParams.has("reference") ? ["reference"] : []),
      ...(url.searchParams.has("run") ? ["run"] : []),
      ...(url.searchParams.has("completed") ? ["completed"] : []),
      ...(url.searchParams.has("historical") ? ["historical"] : []),
    ],
    "review",
  );
  const completed = url.searchParams.get("completed");
  if (completed !== null && completed !== "true")
    throw new RefusedRequest(400, "The completed review request is malformed.");
  const historical = url.searchParams.get("historical");
  if (historical !== null && (historical !== "true" || completed !== "true"))
    throw new RefusedRequest(
      400,
      "The historical review request is malformed.",
    );
  const found = await queriedRun(url);
  if (url.searchParams.has("reference") && url.searchParams.has("run"))
    throw new RefusedRequest(400, "The review names two run identities.");
  if (found.run !== undefined)
    return { kind: "story-review", run: found.run, runs: found.runs };
  if (historical === "true")
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

export async function storyReviewRequest(
  url: URL,
): Promise<AdmittedStoryReview> {
  const subject = reviewedWorkSubjectQuery(url);
  if (subject.kind === "session") return sessionReviewRequest(url);
  return identityReviewRequest(url);
}
