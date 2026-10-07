// Reads of the done catalog published beside the backlog at a pinned
// revision, and of the done records it lists, for the local authenticated
// read boundary (`./authenticatedRead.ts`): the catalog (`done=catalog`), or
// the named records' texts (`done=bodies` with one `file` per record). Each
// names only a pinned revision and is refused here before any `gh` call
// otherwise.
//
// The catalog is trusted only once it describes exactly the record files the
// revision's own listing of their directory names, at their listed blobs
// (the shared catalog module under `src/skills/dough-product-backlog/scripts/`
// decides how it is spelled and when it agrees). A revision that lists no
// record file has an empty catalog. Records listed without a catalog that
// agrees with them are a gap in what the catalog says, answered as such:
// never as no records, and never by reading every record instead. A record
// is read only when that agreeing catalog lists it at the revision, a few at
// once, each only while no earlier read has kept its blob
// (`./listedRecordsRead.ts`); any other name is refused without being read.

import {
  doneRecordsPerRead,
  readingPathAt,
} from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  doneCatalogFileName,
  doneCatalogMismatch,
  parseDoneCatalog,
  renderDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { isDoneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { listedReadParameters, readListedTexts } from "./listedRecordsRead.ts";
import type { ListedPath, PinnedTexts } from "./pinnedTexts.ts";
import {
  doneCatalogPathOf,
  doneRecordDirectoryOf,
} from "./recordsBesideBacklog.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";

export type DoneCatalogRead =
  | { readonly kind: "done-catalog-at"; readonly revision: string }
  | {
      readonly kind: "done-bodies-at";
      readonly revision: string;
      // Record file names, as the catalog lists them, each once.
      readonly files: readonly string[];
    };

const catalogRefusal = "A done catalog read names only a pinned revision.";
const doneRefusal =
  "A done read names the done catalog or the catalogued record files.";
const bodiesRefusal =
  "A done record read names only a pinned revision and the catalogued record files.";

// The done catalog read a request names, undefined when it names none. Done
// records are read only through the catalog: any other `done` read is
// refused.
export function parseDoneCatalogRead(
  params: URLSearchParams,
): DoneCatalogRead | RefusedParameters | undefined {
  const done = params.get("done");
  if (done === null) return undefined;
  if (done !== "catalog" && done !== "bodies") return refused(doneRefusal);
  const files = params.getAll("file");
  const others = [
    "path",
    "since",
    "committed",
    ...listedReadParameters.filter((name) => name !== "done"),
  ];
  if (
    params.getAll("done").length !== 1 ||
    others.some((name) => params.get(name) !== null)
  ) {
    return refused(done === "catalog" ? catalogRefusal : bodiesRefusal);
  }
  if (done === "catalog" && files.length > 0) return refused(catalogRefusal);
  if (done === "bodies") {
    if (files.length === 0 || !files.every(isDoneRecordFileName)) {
      return refused(bodiesRefusal);
    }
    if (files.length > doneRecordsPerRead) {
      return refused("A done record read names too many records.");
    }
  }
  const revision = params.get("revision");
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  return done === "catalog"
    ? { kind: "done-catalog-at", revision }
    : { kind: "done-bodies-at", revision, files: [...new Set(files)] };
}

// What a done catalog read names as being read before any file is.
export function readingDoneCatalogOf(
  source: PublishedSource,
  { revision }: DoneCatalogRead,
): string {
  return readingPathAt(doneRecordDirectoryOf(source), revision);
}

type Catalogued = { readonly fileName: string; readonly blob: string };

type AgreedCatalog =
  | {
      readonly agreed: true;
      readonly text: string;
      // Every record file the catalog lists, readable or not.
      readonly catalogued: readonly Catalogued[];
    }
  | { readonly agreed: false; readonly gap: string };

// The catalog at the revision, by its published text, once it describes
// exactly the record files listed beside it; or why it does not.
async function agreedCatalogAt(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<AgreedCatalog> {
  const directory = doneRecordDirectoryOf(source);
  const listing = await pinned.lister(source, revision, signal)(directory);
  const records = listing
    .filter(({ name }) => isDoneRecordFileName(name))
    .map(({ name, sha }) => ({ fileName: name, blob: sha }));
  if (records.length === 0) {
    return {
      agreed: true,
      text: renderDoneCatalog({ records: [], unreadable: [] }),
      catalogued: [],
    };
  }
  const listed = listing.find(({ name }) => name === doneCatalogFileName);
  if (listed === undefined) {
    return {
      agreed: false,
      gap: `done catalog is not published beside the ${String(records.length)} done records`,
    };
  }
  const path = doneCatalogPathOf(source);
  naming(readingPathAt(path, revision));
  const text = await pinned.blobReader(
    source,
    revision,
    signal,
  )({ path, sha: listed.sha });
  const parsed = parseDoneCatalog(text);
  if (!parsed.ok) return { agreed: false, gap: parsed.error };
  const mismatch = doneCatalogMismatch(parsed.catalog, records);
  if (mismatch !== undefined) return { agreed: false, gap: mismatch };
  const { records: readable, unreadable } = parsed.catalog;
  return { agreed: true, text, catalogued: [...readable, ...unreadable] };
}

// Performs one done catalog read: the catalog's text, or its gap; or the
// texts of the named records, refused unless the agreeing catalog lists
// every one of them.
export async function performDoneCatalogRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  read: DoneCatalogRead,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<Outcome> {
  const { revision } = read;
  const catalog = await agreedCatalogAt(
    pinned,
    source,
    revision,
    signal,
    naming,
  );
  if (read.kind === "done-catalog-at") {
    return answered(
      catalog.agreed
        ? { revision, catalog: catalog.text }
        : { revision, gap: catalog.gap },
    );
  }
  if (!catalog.agreed) {
    return refusedRecords(
      `The done catalog at this revision lists no record to read: ${catalog.gap}.`,
    );
  }
  const catalogued = new Map(
    catalog.catalogued.map(({ fileName, blob }) => [fileName, blob]),
  );
  if (!read.files.every((file) => catalogued.has(file))) {
    return refusedRecords(
      "That done record is not listed by the done catalog at this revision.",
    );
  }
  const directory = doneRecordDirectoryOf(source);
  const named: ListedPath[] = read.files.map((file) => ({
    path: `${directory}/${file}`,
    sha: catalogued.get(file) ?? "",
  }));
  return answered({
    revision,
    records: await readListedTexts(
      pinned,
      source,
      revision,
      named,
      signal,
      naming,
    ),
  });
}

function refusedRecords(
  message: string,
): Extract<Outcome, { readonly kind: "refused" }> {
  return { kind: "refused", status: 404, message };
}
