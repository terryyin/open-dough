// Interim Done references published through Git and served as Open Dough's
// committed origin. The facts are those of the Frontend arrangement
// (./support/frontendDoneReferences.ts).
import type { Page } from "@playwright/test";
import type { StartOrigin } from "./support/startOrigin.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import {
  doneReferenceRecords,
  doneReferenceSeeds,
  type DoneReferenceOptions,
} from "./support/frontendDoneReferences.ts";

export {
  donePathsWithSuppliersThrough,
  doneTitlesThrough,
  expiredDone,
  farDone,
  unlisted,
} from "./support/frontendDoneReferences.ts";

export function publishDoneReferences(
  origin: StartOrigin,
  options: DoneReferenceOptions = {},
) {
  return origin.publishRevision({
    ...doneReferenceSeeds(),
    doneRecords: doneReferenceRecords(Date.now(), options),
  });
}

// Publishes the Done references and serves them as Open Dough's committed
// origin; holds and substitute answers stay with the caller.
export async function serveDoneReferences(
  page: Page,
  origin: StartOrigin,
  options: DoneReferenceOptions & { follows?: boolean } = {},
) {
  return publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision: await publishDoneReferences(origin, options),
    repository: "terryyin/open-dough",
    follows: options.follows === true,
  });
}
