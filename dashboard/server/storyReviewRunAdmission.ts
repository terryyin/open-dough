// Resolve historical choices from retained launch identity, never caller paths.
import { z } from "zod";
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

// A reference must name a launch or its captured landing among these runs.
export function reviewedLandedRunByReference(
  runs: readonly ReviewLandedRun[],
  reference: string,
): ReviewLandedRun {
  if (!z.uuid().safeParse(reference).success)
    throw new RefusedRequest(400, "The review launch reference is malformed.");
  const run = runs.find(
    ({ record }) =>
      record.landing?.reference === reference ||
      record.request.reporting?.reference === reference,
  );
  if (run === undefined)
    throw new RefusedRequest(
      404,
      "This story has no landed run with that reference.",
    );
  return run;
}

// A named run is admitted only from this source and story's retained records.
export async function namedReviewRun(
  sourceId: string,
  identity: string,
  named: { readonly run?: string; readonly reference?: string },
) {
  const source = knownSource(sourceId);
  const { records, runs } = await reviewedLandedRuns(source, identity);
  if (named.run !== undefined) {
    const run = runs.find(({ record }) => reviewRunKey(record) === named.run);
    if (run === undefined)
      throw new RefusedRequest(
        404,
        "This story has no landed run with that identity.",
      );
    return { source, identity, records, runs, run };
  }
  if (named.reference !== undefined) {
    const run = reviewedLandedRunByReference(runs, named.reference);
    return { source, identity, records, runs, run };
  }
  return { source, identity, records, runs };
}
