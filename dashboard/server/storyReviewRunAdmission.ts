// Resolve historical choices from retained launch identity, never caller paths.
import { z } from "zod";
import { workIdentitySchema } from "../src/launchRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  reviewLandedRunsOf,
  reviewRunKey,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";
import { directoryState } from "./sessionWorkspace.ts";

// Source and story identity named on a review URL, never a repository path.
export function queriedReviewIdentity(url: URL) {
  const source = knownSource(url.searchParams.get("source"));
  const identity = workIdentitySchema.safeParse(
    url.searchParams.get("identity"),
  );
  if (!identity.success)
    throw new RefusedRequest(400, "The review identity is malformed.");
  return { source, identity: identity.data };
}

// Landed runs for this source and story from retained records.
export async function reviewedLandedRuns(
  source: PublishedSource,
  identity: string,
) {
  const records = await keptRecords(source.id);
  const runs = reviewLandedRunsOf(
    records,
    source.id,
    identity,
    (workspace) => directoryState(workspace).kind === "missing",
  );
  return { records, runs };
}

// A launch reference must be a UUID naming one of these retained landed runs.
export function reviewedLandedRunByReference(
  runs: readonly ReviewLandedRun[],
  reference: string,
): ReviewLandedRun {
  if (!z.uuid().safeParse(reference).success)
    throw new RefusedRequest(400, "The review launch reference is malformed.");
  const run = runs.find(
    ({ record }) => record.request.reporting?.reference === reference,
  );
  if (run === undefined)
    throw new RefusedRequest(
      404,
      "This story has no landed run with that reference.",
    );
  return run;
}

// A named run is admitted only from this source and story's retained records.
export async function queriedRun(url: URL) {
  const { source, identity } = queriedReviewIdentity(url);
  const { records, runs } = await reviewedLandedRuns(source, identity);
  const reference = url.searchParams.get("reference");
  const key = url.searchParams.get("run");
  if (key !== null) {
    const run = runs.find(({ record }) => reviewRunKey(record) === key);
    if (run === undefined)
      throw new RefusedRequest(
        404,
        "This story has no landed run with that identity.",
      );
    return { source, identity, records, runs, run };
  }
  if (reference !== null) {
    const run = reviewedLandedRunByReference(runs, reference);
    return { source, identity, records, runs, run };
  }
  return { source, identity, records, runs };
}
