// @ts-check
// The done catalog a revision publishes, rebuilt from the record files beside
// its backlog as the product's `rebuildDoneCatalog` does, without disk or Git.
import { doneRecordFilesOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs";
import {
  catalogDoneRecords,
  doneCatalogPath,
  renderDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";

export const doneDirectory = ".planning/done/";
export const catalogFile = `.planning/${doneCatalogPath}`;

// The catalog of the record files among `files`, read by the product's rule,
// or none when no record file remains.
/** @param {Readonly<Record<string, string | Buffer>>} files */
export function doneCatalogOf(files) {
  const records = doneRecordFilesOf(
    Object.entries(files)
      .filter(([path]) => path.startsWith(doneDirectory))
      .map(([path, content]) => ({
        fileName: path.slice(doneDirectory.length),
        bytes: Buffer.isBuffer(content) ? content : Buffer.from(content),
      })),
  );
  return records.length === 0
    ? undefined
    : renderDoneCatalog(catalogDoneRecords(records));
}
