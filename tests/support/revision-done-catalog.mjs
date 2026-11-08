// @ts-check
// The done catalog a revision publishes, rebuilt from the record files beside
// its backlog as the product's `rebuildDoneCatalog` does, without disk or Git.
import { createHash } from "node:crypto";
import {
  catalogDoneRecords,
  doneCatalogPath,
  renderDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { isDoneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

export const doneDirectory = ".planning/done/";
export const catalogFile = `.planning/${doneCatalogPath}`;

// The Git blob hash a published listing names for `bytes`.
/** @param {Buffer} bytes */
const gitBlobHash = (bytes) =>
  createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");

// The catalog of the record files among `files`, in name order, or none when
// no record file remains.
/** @param {Readonly<Record<string, string | Buffer>>} files */
export function doneCatalogOf(files) {
  const records = Object.entries(files)
    .filter(([path]) => path.startsWith(doneDirectory))
    .map(([path, content]) => ({
      fileName: path.slice(doneDirectory.length),
      bytes: Buffer.isBuffer(content) ? content : Buffer.from(content),
    }))
    .filter(({ fileName }) => isDoneRecordFileName(fileName))
    .sort((a, b) => (a.fileName < b.fileName ? -1 : 1))
    .map(({ fileName, bytes }) => ({
      fileName,
      text: bytes.toString("utf8"),
      blob: gitBlobHash(bytes),
    }));
  return records.length === 0
    ? undefined
    : renderDoneCatalog(catalogDoneRecords(records));
}
