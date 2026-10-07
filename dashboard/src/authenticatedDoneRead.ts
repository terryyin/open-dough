// The done records published beside the backlog, read through the local
// authenticated read boundary (`../server/authenticatedRead.ts`) at a
// revision already resolved. The done catalog (`done=catalog`) says which
// records there are, in completion order, once the boundary found it agrees
// with the record files the revision lists, or names the gap that keeps it
// from being trusted; only records that catalog lists are then read, by file
// name (`done=bodies`). Until Recently done reads that way, it still reads
// every record file the revision lists (`done=records`), as the agent
// profiles are read (`./authenticatedProfileRead.ts`). How the catalog and
// each record are spelled is left to the shared done modules
// (`./doneStories.ts`).

import { z } from "zod";
import {
  parseDoneCatalog,
  type DoneCatalog as PublishedDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  authenticatedGet,
  commitSha,
  publishedFile,
  unexpectedAnswer,
  type PublishedFile,
} from "./authenticatedGet.ts";
import type { PublishedSource } from "./publishedSource.ts";

const okDoneRecords = z.object({
  revision: commitSha,
  records: z.array(publishedFile),
});

const okDoneCatalog = z.union([
  z.object({ revision: commitSha, catalog: z.string() }),
  z.object({ revision: commitSha, gap: z.string().min(1) }),
]);

const sourceAt = (source: PublishedSource, revision: string) =>
  `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}`;

// The done records published at `revision`, by repository path and raw text
// (none when the revision has no done-record directory). Recently done's
// reading of every record, until it reads only those its entries need.
export async function readDoneRecordsAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<readonly PublishedFile[]> {
  const reading = `the done records of ${source.repository} at ${revision}`;
  const body = await authenticatedGet(
    `${sourceAt(source, revision)}&done=records`,
    reading,
    signal,
  );
  const parsed = okDoneRecords.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.records;
}

// The done catalog at a revision, newest completion first; or the gap that
// keeps its records from being known there.
export type DoneCatalog =
  | ({ readonly status: "catalogued" } & PublishedDoneCatalog)
  | { readonly status: "gap"; readonly problem: string };

// The done catalog published at `revision`, as the shared catalog module
// reads it. A revision with no done record has an empty catalog.
export async function readDoneCatalogAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<DoneCatalog> {
  const reading = `the done catalog of ${source.repository} at ${revision}`;
  const body = await authenticatedGet(
    `${sourceAt(source, revision)}&done=catalog`,
    reading,
    signal,
  );
  const parsed = okDoneCatalog.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  if ("gap" in parsed.data) {
    return { status: "gap", problem: parsed.data.gap };
  }
  const read = parseDoneCatalog(parsed.data.catalog);
  if (!read.ok) {
    throw unexpectedAnswer(reading);
  }
  return { status: "catalogued", ...read.catalog };
}

// The texts of the done records `files` names, each a file name the catalog
// at `revision` lists, in the order named.
export async function readDoneRecordBodiesAt(
  source: PublishedSource,
  revision: string,
  files: readonly string[],
  signal: AbortSignal,
): Promise<readonly PublishedFile[]> {
  const reading = `${String(files.length)} done records of ${source.repository} at ${revision}`;
  const named = files.map((file) => `&file=${encodeURIComponent(file)}`);
  const body = await authenticatedGet(
    `${sourceAt(source, revision)}&done=bodies${named.join("")}`,
    reading,
    signal,
  );
  const parsed = okDoneRecords.safeParse(body);
  const unique = [...new Set(files)];
  if (
    !parsed.success ||
    parsed.data.revision !== revision ||
    parsed.data.records.length !== unique.length ||
    parsed.data.records.some(
      ({ path }, index) => path.split("/").pop() !== unique[index],
    )
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.records;
}
