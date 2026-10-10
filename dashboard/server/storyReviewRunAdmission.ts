// Resolve historical choices from retained launch identity, never caller paths.
import { z } from "zod";
import { workIdentitySchema } from "../src/launchRequest.ts";
import {
  reviewLandedRunsOf,
  reviewRunKey,
} from "../src/storyReviewLandedRun.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";
import { directoryState } from "./sessionWorkspace.ts";
import type { AdmittedFileDiff } from "./storyReviewAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
// A named run is admitted only from this source and story's retained records.
export async function queriedRun(url: URL) {
  const source = knownSource(url.searchParams.get("source"));
  const identity = workIdentitySchema.safeParse(
    url.searchParams.get("identity"),
  );
  if (!identity.success)
    throw new RefusedRequest(400, "The review identity is malformed.");
  const records = await keptRecords(source.id);
  const runs = reviewLandedRunsOf(
    records,
    source.id,
    identity.data,
    (workspace) => directoryState(workspace).kind === "missing",
  );
  const reference = url.searchParams.get("reference");
  const key = url.searchParams.get("run");
  if (key !== null) {
    const run = runs.find(({ record }) => reviewRunKey(record) === key);
    if (run === undefined)
      throw new RefusedRequest(
        404,
        "This story has no landed run with that identity.",
      );
    return { source, identity: identity.data, records, runs, run };
  }
  if (reference !== null) {
    if (!z.uuid().safeParse(reference).success)
      throw new RefusedRequest(
        400,
        "The review launch reference is malformed.",
      );
    const run = runs.find(
      ({ record }) => record.request.reporting?.reference === reference,
    );
    if (run === undefined)
      throw new RefusedRequest(
        404,
        "This story has no landed run with that reference.",
      );
    return { source, identity: identity.data, records, runs, run };
  }
  return { source, identity: identity.data, records, runs };
}

// A historical file must belong to this run's fixed pair and literal file list.
export async function reviewedRunFile(
  url: URL,
  {
    baseline,
    tree,
    path,
    oldPath,
  }: Pick<AdmittedFileDiff, "baseline" | "tree" | "path" | "oldPath">,
) {
  const { run } = await queriedRun(url);
  if (run === undefined) throw new RefusedRequest(404, "No landed run.");
  const review = await landedStoryReview(run, AbortSignal.timeout(30_000));
  if (review.kind !== "landed")
    throw new RefusedRequest(
      409,
      review.kind === "landing-unavailable"
        ? review.explanation
        : "The captured comparison is unavailable.",
    );
  if (
    baseline !== review.baseline ||
    tree !== review.tree ||
    !review.files.some(
      (file) =>
        file.path === path &&
        (file.kind === "renamed"
          ? file.oldPath === oldPath
          : oldPath === undefined),
    )
  )
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this captured run.",
    );
  return {
    established: run.established,
    repository: run.record.landing?.repository,
  };
}
