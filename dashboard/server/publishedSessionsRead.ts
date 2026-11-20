// The published-session listing read for the local authenticated read
// boundary (`./requestedRead.ts`): with `sessions=published` and a pinned
// revision, every session close record the configured project published
// beside its backlog, read from that project's fetched Git at the revision.
// Each record is validated against the one record contract
// (`../src/publishedSessionRecord.ts`) and must sit at the path the producer
// names for its UUID; any other file there is skipped. The performed read
// (`./performedRead.ts`) answers it here.

import { posix } from "node:path";
import { sessionRecordPath } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  publishedSessionsRead,
  readingPathAt,
} from "../src/authenticatedReadRules.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { parsePinnedListing } from "./listedReadParameters.ts";
import {
  publishedRecordAt,
  type PublishedSessionSource,
} from "./publishedSessionReview.ts";
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

// The directory the producer publishes every session's record in, beside the
// backlog: the directory of any one session's record path.
const sessionDirectoryOf = (backlogPath: string) =>
  posix.dirname(
    sessionRecordPath("00000000-0000-0000-0000-000000000000", backlogPath),
  );

export function readingPublishedSessionsOf(
  backlogPath: string,
  { revision }: PublishedSessionsRead,
): string {
  return readingPathAt(sessionDirectoryOf(backlogPath), revision);
}

// Every valid session record listed at the source's revision, in path order.
export async function performPublishedSessionsRead(
  source: PublishedSessionSource,
  signal: AbortSignal,
): Promise<Outcome> {
  const directory = sessionDirectoryOf(source.backlogPath);
  const { stdout } = await runGit(
    ["ls-tree", "--name-only", source.revision, `${directory}/`],
    { cwd: source.repository, signal, maxBuffer: defaultGitOutputLimit },
  );
  const listed = stdout
    .split("\n")
    .filter((path) => path.endsWith(".json"))
    .sort();
  const records = await Promise.all(
    listed.map((path) => publishedRecordAt(source, path, signal)),
  );
  return answered({
    revision: source.revision,
    sessions: records.filter((record) => record !== undefined),
  });
}
