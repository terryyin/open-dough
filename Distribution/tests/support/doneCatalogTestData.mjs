// @ts-check
// A work's catalog of done records (dashboard/src/doneStories.ts) with the
// page's typed read answering the records' bodies
// (dashboard/src/doneRecordReadSource.ts). Node-free, so pageMakeMe.mjs
// exposes it to mounted cases.
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

/** @typedef {import("./doneRecordTestData.mjs").DoneRecord} DoneRecord */
/** @typedef {Extract<import("../../../dashboard/src/doneStories.ts").DoneStories, { status: "catalogued" }>} CataloguedDone */
/** @typedef {import("../../../dashboard/src/doneRecordReadSource.ts").DoneRecordReadSource} DoneRecordReadSource */

export class DoneCatalogBuilder {
  /** @type {DoneRecord[]} */
  #records = [];

  /** @param {readonly DoneRecord[]} records the records the catalog names */
  holding(records) {
    this.#records = [...records];
    return this;
  }

  /** @returns {{ done: CataloguedDone, doneReads: DoneRecordReadSource }} */
  please() {
    /** @type {Map<string, string>} */
    const bodies = new Map();
    const records = this.#records.map((record, index) => {
      const fileName = doneRecordFileName(record.identity);
      bodies.set(fileName, renderDoneRecord(record));
      return {
        identity: record.identity,
        completedAt: record.completedAt,
        fileName,
        blob: (index + 1).toString(16).padStart(40, "0"),
      };
    });
    return {
      done: {
        status: "catalogued",
        revision: "d".repeat(40),
        records,
        unreadable: [],
      },
      doneReads: {
        readBodies: (...[, , files]) =>
          Promise.resolve(
            files.map((path) => {
              const text = bodies.get(path);
              if (text === undefined)
                throw new Error(`No Done record for ${path}.`);
              return { path, text };
            }),
          ),
      },
    };
  }
}
