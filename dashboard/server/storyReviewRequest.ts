// One authoritative retained-record read supplies both historical choices and
// the unchanged latest-workspace opening rule.
import { reviewWorkspaceOf } from "../src/storyReview.ts";
import type { EstablishedContext } from "../src/launchRecord.ts";
import {
  preferredReviewRun,
  type ReviewOneShotRun,
} from "../src/storyReviewOneShot.ts";
import { queriedRun } from "./storyReviewRunAdmission.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { projectFolder } from "./projectFolders.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";

interface AdmittedWorkspaceReview {
  readonly kind: "review";
  readonly sourceId: string;
  readonly identity: string;
  readonly established: EstablishedContext;
  // The workspace as the page shows it.
  readonly shown: string;
  readonly fallback?: ReviewOneShotRun;
  readonly runs: readonly ReviewOneShotRun[];
}

export type AdmittedReview =
  | AdmittedWorkspaceReview
  | {
      readonly kind: "review";
      readonly run: ReviewOneShotRun;
      readonly runs: readonly ReviewOneShotRun[];
    };

export async function reviewRequest(url: URL): Promise<AdmittedReview> {
  requireExactQuery(
    url,
    [
      "source",
      "identity",
      ...(url.searchParams.has("reference") ? ["reference"] : []),
      ...(url.searchParams.has("run") ? ["run"] : []),
    ],
    "review",
  );
  const found = await queriedRun(url);
  if (url.searchParams.has("reference") && url.searchParams.has("run"))
    throw new RefusedRequest(400, "The review names two run identities.");
  if (found.run !== undefined)
    return { kind: "review", run: found.run, runs: found.runs };
  const fallback = preferredReviewRun(
    found.runs,
    ({ record }) => record.landing,
  );
  const workspace = reviewWorkspaceOf(
    found.records,
    found.source.id,
    found.identity,
  );
  if (
    workspace === undefined ||
    directoryState(workspace.established.workspace).kind !== "available"
  ) {
    if (fallback !== undefined)
      return { kind: "review", run: fallback, runs: found.runs };
  }
  if (workspace === undefined)
    throw new RefusedRequest(
      404,
      "This story has no launch workspace to review.",
    );
  const { source, identity } = found;
  const { established } = workspace;
  return {
    kind: "review",
    sourceId: source.id,
    identity,
    established,
    shown: shownStartWorkspace(projectFolder(source), established.workspace),
    runs: found.runs,
    ...(fallback === undefined ? {} : { fallback }),
  };
}
