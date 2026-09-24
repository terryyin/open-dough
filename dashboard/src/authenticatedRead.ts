// The browser's one reader of published Git state: an ordinary same-origin
// `fetch` to the local authenticated read boundary
// (`../server/authenticatedRead.ts`) at `/__authenticated-read?source=<id>`,
// for any catalog source (`./publishedSource.ts`). An optional `revision`
// reads the backlog at a commit already resolved, and with `path` one further
// file already reachable from that revision's records, or with `path` and
// `committed=last` when that file (or a listed agent profile) was last
// committed as of that revision; `since` instead asks only whether the ref
// still names the revision shown, and with `watch` which heads story branches
// recorded there name now; `branch` asks about a story branch recorded
// at that revision (`./authenticatedBranchRead.ts`). Every read makes the
// same one request (`./authenticatedGet.ts`). No extra header or
// credential is sent; the page is served by the same Vite process that
// answers this endpoint, so the request is same-origin by construction, and the endpoint's own Origin/Host check
// (`../server/localOrigin.ts`) does the rest. There is no direct browser path
// to GitHub.
//
// The local server resolves the ref and reads the backlog (or a
// reachability-checked record) through the launching person's own `gh`
// authentication; what it hands back still crossed a process/HTTP boundary,
// so it is checked here as external input, never trusted by assertion.

import { z } from "zod";
import {
  onBranchQuery,
  type BranchHead,
  type StoryBranchHeads,
} from "./authenticatedBranchRead";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet";
import {
  readingLastCommitAt,
  readingPathAt,
  readingRefOf,
} from "./authenticatedReadRules";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";

const okSnapshot = z.object({
  revision: commitSha,
  backlog: z.string(),
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
const okCheck = z.object({
  revision: commitSha,
  changed: z.boolean(),
  branches: z
    .array(z.object({ branch: z.string().min(1), head: commitSha.nullable() }))
    .optional(),
});

export type PublishedSnapshot = {
  readonly revision: string;
  readonly backlog: string;
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

// Whether the source's ref still names the revision shown, or which commit it
// names now. While it does, the check also says which head each watched story
// branch names now, undefined when it is no longer published; it names none
// when the boundary could not list branch heads this time. Nothing of the
// backlog or its records is read.
export type RevisionCheck =
  | {
      readonly changed: false;
      readonly heads: StoryBranchHeads;
    }
  | { readonly changed: true; readonly revision: string };

// Checks the source's ref, and the heads of `watched`: story branches Taken
// entries' profiles record at the revision shown, which the local boundary
// confirms from that revision's records before answering.
export async function checkPublishedRevision(
  source: PublishedSource,
  shown: string,
  watched: readonly string[],
  signal: AbortSignal,
): Promise<RevisionCheck> {
  const reading = readingRefOf(source);
  const watching = watched
    .map((branch) => `&watch=${encodeURIComponent(branch)}`)
    .join("");
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&since=${encodeURIComponent(shown)}${watching}`,
    reading,
    signal,
  );
  const parsed = okCheck.safeParse(body);
  // Undefined when the boundary could not list branch heads for this check.
  const branches = parsed.data?.branches;
  if (
    !parsed.success ||
    parsed.data.changed !== (parsed.data.revision !== shown) ||
    (branches !== undefined &&
      (branches.length !== watched.length ||
        branches.some(({ branch }, at) => branch !== watched[at])))
  ) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while checking ${reading}.`,
    );
  }
  return parsed.data.changed
    ? { changed: true, revision: parsed.data.revision }
    : {
        changed: false,
        heads: new Map(
          (branches ?? []).map(({ branch, head }) => [
            branch,
            head ?? undefined,
          ]),
        ),
      };
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

const okProfiles = z.object({
  revision: commitSha,
  profiles: z.array(z.object({ path: z.string().min(1), text: z.string() })),
});

// A published agent profile's repository path and raw text.
export type PublishedProfile = {
  readonly path: string;
  readonly text: string;
};

// The agent profiles published beside the backlog at `revision`, as the local
// boundary found them listed there; none when the revision has no profile
// directory. What a profile says is left to the shared profile reader.
export async function readAgentProfilesAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<readonly PublishedProfile[]> {
  const reading = `the agent profiles of ${source.repository} at ${revision}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&agents=profiles`,
    reading,
    signal,
  );
  const parsed = okProfiles.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.profiles;
}
