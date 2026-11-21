// The published-session listing read for the local authenticated read
// boundary (`./requestedRead.ts`): with `sessions=published` and a pinned
// revision, every session close record the configured project published
// beside its backlog, listed through `listedSessionRecords`
// (`./recordsBesideBacklog.ts`) and read through the same pinned GitHub path
// as listed records and the done catalog (`./pinnedTexts.ts`). Records are
// read a few at a time through `mapPool` at the listed-records concurrency
// (`./listedRecordsRead.ts`). Each record is validated against the one
// record contract (`../src/publishedSessionRecord.ts`) and must sit at the
// path the producer names for its UUID; any other file there is skipped. A
// revision that lists no session directory (GitHub's 404) answers an empty
// listing. The performed read (`./performedRead.ts`) answers it here.

import {
  publishedSessionsRead,
  readingPathAt,
} from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { mapPool } from "../src/boundedPool.ts";
import { listedReadConcurrency } from "./listedRecordsRead.ts";
import { parsePinnedListing } from "./listedReadParameters.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { publishedRecordFromText } from "./publishedSessionReview.ts";
import {
  listedSessionRecords,
  sessionRecordDirectoryOf,
} from "./recordsBesideBacklog.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import type { RefusedParameters } from "./refusedParameters.ts";

export type PublishedSessionsRead = {
  readonly kind: "published-sessions-at";
  readonly revision: string;
};

// The published-session listing a request names, undefined when it names none.
export function parsePublishedSessionsRead(
  params: URLSearchParams,
): PublishedSessionsRead | RefusedParameters | undefined {
  const read = parsePinnedListing(params, {
    ...publishedSessionsRead,
    refusal: "A published session read names only a pinned revision.",
  });
  return read && "revision" in read
    ? { kind: "published-sessions-at", revision: read.revision }
    : read;
}

export function readingPublishedSessionsOf(
  backlogPath: string,
  { revision }: PublishedSessionsRead,
): string {
  return readingPathAt(sessionRecordDirectoryOf({ backlogPath }), revision);
}

// Every valid session record listed at the source's revision through pinned
// GitHub listing and blob reads, in path order.
export async function performPublishedSessionsRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  { revision }: PublishedSessionsRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const listed = await listedSessionRecords(
    source,
    pinned.lister(source, revision, signal),
  );
  const readBlob = pinned.blobReader(source, revision, signal);
  const records = await mapPool(listed, listedReadConcurrency, async (file) =>
    publishedRecordFromText(source, file.path, await readBlob(file)),
  );
  return answered({
    revision,
    sessions: records.filter((record) => record !== undefined),
  });
}
