// Interim Done references published through Git and served as Open Dough's
// committed origin. The facts are those of the Frontend arrangement
// (./support/frontendDoneReferences.ts).
import type { Page } from "@playwright/test";
import type { StartOrigin } from "./support/startOrigin.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import {
  doneReferenceRecords,
  doneReferenceSeeds,
} from "./support/frontendDoneReferences.ts";

export {
  doneTitlesThrough,
  farDone,
} from "./support/frontendDoneReferences.ts";

// Publishes the Done references and serves them as Open Dough's committed
// origin; holds and substitute answers stay with the caller.
export async function serveDoneReferences(page: Page, origin: StartOrigin) {
  return publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision: await origin.publishRevision({
      ...doneReferenceSeeds(),
      doneRecords: doneReferenceRecords(Date.now()),
    }),
    repository: "terryyin/open-dough",
  });
}
