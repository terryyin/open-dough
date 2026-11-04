// The browser's one reader of published Git state: an ordinary same-origin
// `fetch` to the local authenticated read boundary
// (`../server/authenticatedRead.ts`) at `/__authenticated-read?source=<id>`,
// for any catalog source (`./publishedSource.ts`). An optional `revision`
// reads the backlog at a commit already resolved, and with `path` one further
// file already reachable from that revision's records, or with `path` and
// `committed=last` when that file was last committed as of that revision;
// revision checks and streams (`since` / `at`) live in
// `./revisionCheckRead.ts`; `agents=profiles` and `committed=added` read the
// published agent profiles (`./authenticatedProfileRead.ts`), and
// `done=catalog` and `done=bodies` the published done catalog and the
// records it lists (`./authenticatedDoneRead.ts`); `intent=locations` the
// Intent locations configured in project settings
// (`./authenticatedIntentRead.ts`); Test Optimization Candidates
// (`./authenticatedIntentCandidatesRead.ts`); `branch` asks about a story
// branch recorded at that revision (`./authenticatedBranchRead.ts`). Every
// read makes the same one request (`./authenticatedGet.ts`). No extra header or
// credential is sent; the page is served by the same Vite process that
// answers this endpoint, so the request is same-origin by construction, and
// the endpoint's own Origin/Host check (`../server/localOrigin.ts`) does the
// rest. There is no direct browser path to GitHub.
//
// The local server resolves the ref and reads the backlog (or a
// reachability-checked record) through the launching person's own `gh`
// authentication; what it hands back still crossed a process/HTTP boundary,
// so it is checked here as external input, never trusted by assertion.

import { z } from "zod";
import { onBranchQuery, type BranchHead } from "./authenticatedBranchRead.ts";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import {
  readingLastCommitAt,
  readingPathAt,
  readingRefOf,
} from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";

const okSnapshot = z.object({
  revision: commitSha,
  backlog: z.string(),
  askedAt: z.iso.datetime().optional(),
});
const okFile = z.object({
  revision: commitSha,
  path: z.string().min(1),
  text: z.string(),
});
const okCommitTime = z.object({
  revision: commitSha,
  path: z.string().min(1),
  committedAt: z.iso.datetime({ offset: true }),
});

// When the read resolved the ref itself, `askedAt` is when the local server
// asked for it, by that server's clock.
export type PublishedSnapshot = {
  readonly revision: string;
  readonly backlog: string;
  readonly askedAt?: string | undefined;
};

// Resolves the source's ref to one commit and reads its backlog at that
// commit, both on the local server. Given a revision already resolved, reads
// the backlog at exactly that commit instead of resolving the ref again.
export async function readPublishedSnapshot(
  source: PublishedSource,
  signal: AbortSignal,
  revision?: string,
): Promise<PublishedSnapshot> {
  const reading =
    revision === undefined
      ? readingRefOf(source)
      : readingPathAt(source.backlogPath, revision);
  const pinnedTo =
    revision === undefined ? "" : `&revision=${encodeURIComponent(revision)}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}${pinnedTo}`,
    reading,
    signal,
  );
  const parsed = okSnapshot.safeParse(body);
  if (!parsed.success) {
    throw unexpectedAnswer(reading);
  }
  if (revision !== undefined && parsed.data.revision !== revision) {
    throw new ReadProblem(
      `The local authenticated read answered for a different revision while reading ${reading}.`,
    );
  }
  return parsed.data;
}

export async function readRepositoryFileAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const reading = readingPathAt(repositoryPath, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&path=${encodeURIComponent(repositoryPath)}`,
    reading,
    signal,
  );
  const parsed = okFile.safeParse(body);
  if (!parsed.success) {
    throw unexpectedAnswer(reading);
  }
  if (
    parsed.data.path !== repositoryPath ||
    parsed.data.revision !== revision
  ) {
    throw new ReadProblem(
      `The local authenticated read answered for a different path or revision while reading ${reading}.`,
    );
  }
  return parsed.data.text;
}

// When `repositoryPath` was last committed as of `revision`, or, on a
// recorded branch, as of the head resolved for it: the committer date of the
// newest commit that changed it in that history.
export async function readLastCommitTimeAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
  onBranch?: BranchHead,
): Promise<Date> {
  const readAt = onBranch?.head ?? revision;
  const reading = readingLastCommitAt(repositoryPath, readAt);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}${onBranchQuery(onBranch)}&path=${encodeURIComponent(repositoryPath)}&committed=last`,
    reading,
    signal,
  );
  const parsed = okCommitTime.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.path !== repositoryPath ||
    parsed.data.revision !== readAt
  ) {
    throw unexpectedAnswer(reading);
  }
  return new Date(parsed.data.committedAt);
}
