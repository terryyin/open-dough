// Publications of the Recently done stories (./recentlyDoneRecords.ts) whose
// catalog or records cannot be read: no catalog, a catalog that omits a record
// added beside it, a catalog read that fails, and malformed records beside the
// readable ones. Each uses its own revision, so a journey can publish one after
// another and the local boundary has not remembered it. The stories spec states
// the problem each publication produces.
import { basename } from "node:path";
import { catalogFile } from "../../Distribution/tests/support/revision-done-catalog.mjs";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  at,
  doneRecordAt,
  doneStories,
  doneStoryPublication,
  doneStoryRevisionFacts,
  placed,
  recentlyDoneNestingRecords,
} from "./recentlyDoneRecords.ts";

// Another revision, whose reads the local boundary has not yet remembered.
const otherRevision = "d1".repeat(20);
// Done records published without a catalog, as a writer from before catalogs
// would leave them.
const uncataloguedRevision = "d3".repeat(20);
// A catalog published before the story done last week's record was added
// beside it, as a merge outside the backlog's Git adapters would leave it.
const staleCatalogRevision = "d5".repeat(20);
// Malformed records beside the readable ones.
const malformedRevision = "d2".repeat(20);

const futureFormat = "SEED-050#future-format";
const misnamed = "SEED-051#misnamed";
const recordFile = (identity: string) => basename(doneRecordPath(identity));

export const doneStoryReadFailures = {
  unansweredCatalog: (now: number) =>
    doneStoryPublication(otherRevision, doneStoryRevisionFacts(now), [
      catalogFile,
    ]),
  withoutCatalog: (now: number) =>
    doneStoryPublication(uncataloguedRevision, {
      ...doneStoryRevisionFacts(now),
      remove: [catalogFile],
    }),
  // The story done last week stands beside a catalog of the other records.
  staleCatalog: (now: number) => {
    const catalog = doneStories.published(now).files[catalogFile];
    if (catalog === undefined) throw new Error(`publishes no ${catalogFile}`);
    return doneStoryPublication(staleCatalogRevision, {
      doneRecords: recentlyDoneNestingRecords(now),
      files: {
        ...doneStoryRevisionFacts(now).files,
        [catalogFile]: catalog,
      },
    });
  },
  malformed: {
    futureFile: recordFile(futureFormat),
    misnamedFile: recordFile(misnamed),
    published: (now: number) => {
      const { doneRecords = [], files = {} } = doneStoryRevisionFacts(now);
      return doneStoryPublication(malformedRevision, {
        doneRecords,
        files: {
          ...files,
          [doneRecordAt(futureFormat)]: `${JSON.stringify({
            schemaVersion: 2,
            identity: futureFormat,
            title: "Written in a later format",
            completedAt: at(now, placed.executedDone),
          })}\n`,
          [doneRecordAt(misnamed)]: renderDoneRecord({
            identity: "SEED-052#named-inside",
            title: "Named for another identity",
            completedAt: at(now, placed.executedDone),
            developer: doneStories.executed.developer,
          }),
        },
      });
    },
  },
};
