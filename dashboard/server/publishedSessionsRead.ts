// The published-session listing read for the local authenticated read
// boundary (`./requestedRead.ts`): with `sessions=published` and a pinned
// revision, every session close record the configured project published
// beside its backlog, read from that project's fetched Git at the revision.
// A revision the checkout lacks is first fetched with the project's trunk.
// Records are read a few at a time through `mapPool` at the listed-records
// concurrency (`./listedRecordsRead.ts`). Each record is validated against
// the one record contract (`../src/publishedSessionRecord.ts`) and must sit
// at the path the producer names for its UUID; any other file there is
// skipped. The performed read (`./performedRead.ts`) answers it here.

import {
  publishedSessionsRead,
  readingPathAt,
} from "../src/authenticatedReadRules.ts";
import { mapPool } from "../src/boundedPool.ts";
import { fetchUnlessCommitPresent } from "./gitTargetFetch.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { listedReadConcurrency } from "./listedRecordsRead.ts";
import { parsePinnedListing } from "./listedReadParameters.ts";
import {
  publishedRecordAt,
  type PublishedSessionSource,
} from "./publishedSessionReview.ts";
import { sessionRecordDirectoryOf } from "./recordsBesideBacklog.ts";
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

// Every valid session record listed at the source's revision, in path order;
// a revision the checkout lacks is first fetched with the project's trunk `ref`.
export async function performPublishedSessionsRead(
  source: PublishedSessionSource & { readonly ref: string },
  signal: AbortSignal,
): Promise<Outcome> {
  const directory = sessionRecordDirectoryOf(source);
  const call = {
    cwd: source.repository,
    signal,
    maxBuffer: defaultGitOutputLimit,
  };
  const trunk = { remote: "origin", target: source.ref };
  await fetchUnlessCommitPresent(source.revision, trunk, call);
  const { stdout } = await runGit(
    ["ls-tree", "--name-only", source.revision, `${directory}/`],
    call,
  );
  const listed = stdout
    .split("\n")
    .filter((path) => path.endsWith(".json"))
    .sort();
  const records = await mapPool(listed, listedReadConcurrency, (path) =>
    publishedRecordAt(source, path, signal),
  );
  return answered({
    revision: source.revision,
    sessions: records.filter((record) => record !== undefined),
  });
}
