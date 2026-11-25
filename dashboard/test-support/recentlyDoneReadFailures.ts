// Publications of the Recently done stories (./recentlyDoneRecords.ts) whose
// catalog or records cannot be read: no catalog, a catalog that omits a record
// added beside it, a catalog read that fails, and malformed records beside the
// readable ones. Each publishes files of its own, so its commit lands at its own
// revision and a journey can publish one after another without the local
// boundary having remembered it. The stories spec states the problem each
// publication produces.
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

const futureFormat = "SEED-050#future-format";
const misnamed = "SEED-051#misnamed";
const recordFile = (identity: string) => basename(doneRecordPath(identity));

export const doneStoryReadFailures = {
  unansweredCatalog: (now: number) =>
    doneStoryPublication(doneStoryRevisionFacts(now), [catalogFile]),
  // Done records published without a catalog, as a writer from before catalogs
  // would leave them.
  withoutCatalog: (now: number) =>
    doneStoryPublication({
      ...doneStoryRevisionFacts(now),
      remove: [catalogFile],
    }),
  // The story done last week stands beside a catalog of the other records, as
  // a merge outside the backlog's Git adapters would leave it.
  staleCatalog: (now: number) => {
    const catalog = doneStories.published(now).files[catalogFile];
    if (catalog === undefined) throw new Error(`publishes no ${catalogFile}`);
    return doneStoryPublication({
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
      return doneStoryPublication({
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
