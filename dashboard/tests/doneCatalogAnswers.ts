// The done catalog as completion publishes it beside done records: rendered
// by the shared catalog module from the record files themselves, at the Git
// blob each one's text has (./listingAnswers.ts). It holds published metadata
// only; which records a reader then shows or reads is the reader's own.

import {
  catalogDoneRecords,
  doneCatalogFileName,
  renderDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { isDoneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { gitBlobSha } from "./listingAnswers.ts";

// The catalog text of the done record files directly in `directory` among
// `files`, by repository path.
export function doneCatalogOf(
  files: Readonly<Record<string, string>>,
  directory: string,
): string {
  const records = Object.entries(files).flatMap(([path, text]) => {
    const fileName = path.startsWith(`${directory}/`)
      ? path.slice(directory.length + 1)
      : "";
    return isDoneRecordFileName(fileName)
      ? [{ fileName, text, blob: gitBlobSha(text) }]
      : [];
  });
  return renderDoneCatalog(catalogDoneRecords(records));
}

// `files` with the catalog of their done records in `directory` beside them.
export function withDoneCatalog(
  files: Readonly<Record<string, string>>,
  directory: string,
): Record<string, string> {
  return {
    ...files,
    [`${directory}/${doneCatalogFileName}`]: doneCatalogOf(files, directory),
  };
}
