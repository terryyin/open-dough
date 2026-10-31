// What a requested read names as being read for failure wording on the local
// authenticated read boundary (`./performedRead.ts`): each kind's reading
// phrase before any later naming updates during the perform.

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  readingAdditionAt,
  readingBranchHeadOf,
  readingContainmentAt,
  readingLastCommitAt,
  readingPathAt,
  readingRefOf,
} from "../src/authenticatedReadRules.ts";
import { readingDoneCatalogOf } from "./doneCatalogRead.ts";
import { readingIntentLocationsOf } from "./intentLocationsRead.ts";
import { readingListedRecordsOf } from "./listedRecordsRead.ts";
import type { RequestedRead } from "./requestedRead.ts";

export function readingOf(
  source: PublishedSource,
  read: RequestedRead,
): string {
  switch (read.kind) {
    case "ref":
    case "revision-check":
      return readingRefOf(source);
    case "branch-head-at":
      return readingBranchHeadOf(read.branch, source.repository);
    case "commit-time-at":
      return readingLastCommitAt(
        read.path,
        read.onBranch?.head ?? read.revision,
      );
    case "file-at":
      return readingPathAt(read.path, read.onBranch?.head ?? read.revision);
    case "agent-profiles-at":
      return readingListedRecordsOf(source, read);
    case "done-catalog-at":
    case "done-bodies-at":
      return readingDoneCatalogOf(source, read);
    case "intent-locations-at":
      return readingIntentLocationsOf(read);
    case "addition-at":
      return readingAdditionAt(read.path, read.revision);
    case "backlog-at":
      return readingPathAt(source.backlogPath, read.revision);
    case "containment-at":
      return readingContainmentAt(read.accepted, read.revision);
  }
}
