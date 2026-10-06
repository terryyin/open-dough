// Performs one allowed read for the local authenticated read boundary
// (`./authenticatedRead.ts`), once the request is accepted and its catalog
// source and requested read (`./requestedRead.ts`) are known: its `gh` calls
// are tracked for the request's lifetime, and any failure is worded for this
// source and what was being read when it failed. Reads on a story branch are
// performed in `./performedBranchRead.ts`, revision checks in
// `./performedRevisionCheck.ts`, the records listed beside the backlog in
// `./listedRecordsRead.ts`, containment in `./containmentRead.ts`; what
// a read comes to is `./readOutcome.ts`.

import type { IncomingMessage } from "node:http";
import type { AvatarImages } from "./avatarImages.ts";
import type { BranchHeads } from "./branchHeads.ts";
import { resolveRevisionViaGh } from "./ghRevision.ts";
import { readRepositoryFileViaGh } from "./ghContents.ts";
import type { ProfileAddition } from "./ghProfileAddition.ts";
import {
  performBranchHeadRead,
  performOnBranch,
} from "./performedBranchRead.ts";
import { performRevisionCheck } from "./performedRevisionCheck.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import type { RevisionChecks } from "./revisionChecks.ts";
import { withTrackedGh } from "./trackedGh.ts";
import { performContainmentRead } from "./containmentRead.ts";
import { reportedFailure } from "./readFailureMessage.ts";
import {
  performListedRecordsRead,
  readingListedRecordsOf,
} from "./listedRecordsRead.ts";
import { answered, unreachable, type Outcome } from "./readOutcome.ts";
import {
  isListedAgentProfile,
  pathReachableFromRevision,
} from "./reachablePaths.ts";
import type { RequestedRead } from "./requestedRead.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  readingAdditionAt,
  readingBranchHeadOf,
  readingContainmentAt,
  readingLastCommitAt,
  readingPathAt,
  readingRefOf,
} from "../src/authenticatedReadRules.ts";

export type Boundary = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
  readonly branches: BranchHeads;
  readonly avatars: AvatarImages;
};

// Which commit added a profile's current allocation, asked only about a
// profile the revision's directory listing names, as when profiles themselves
// are read; undefined when it does not. The avatar read (`./avatarRead.ts`)
// finds its account the same way.
export async function listedProfileAddition(
  pinned: PinnedTexts,
  source: PublishedSource,
  { revision, path }: { readonly revision: string; readonly path: string },
  signal: AbortSignal,
): Promise<ProfileAddition | undefined> {
  const listed = await isListedAgentProfile(
    source,
    path,
    pinned.lister(source, revision, signal),
  );
  return listed
    ? await pinned.adder(source, revision, signal)(path)
    : undefined;
}

// What a read failure names as being read when the request was made.
function readingOf(source: PublishedSource, read: RequestedRead): string {
  switch (read.kind) {
    case "ref":
    case "revision-check":
      return readingRefOf(source);
    case "branch-head-at":
      return readingBranchHeadOf(read.branch, source.repository);
    case "commit-time-at":
      return readingLastCommitAt(
        read.path,
        read.onBranch?.head ?? read.revision,
      );
    case "file-at":
      return readingPathAt(read.path, read.onBranch?.head ?? read.revision);
    case "agent-profiles-at":
    case "done-records-at":
      return readingListedRecordsOf(source, read);
    case "addition-at":
      return readingAdditionAt(read.path, read.revision);
    case "backlog-at":
      return readingPathAt(source.backlogPath, read.revision);
    case "containment-at":
      return readingContainmentAt(read.accepted, read.revision);
  }
}

// Performs one allowed read with its `gh` calls tracked, and words any
// failure for this source and what was being read when it failed.
export async function perform(
  req: IncomingMessage,
  { tracked, pinned, checks, branches }: Boundary,
  source: PublishedSource,
  read: RequestedRead,
): Promise<Outcome> {
  let reading = readingOf(source, read);
  try {
    return await withTrackedGh(req, tracked, async (signal) => {
      switch (read.kind) {
        case "revision-check":
          return await performRevisionCheck(
            { pinned, checks, branches },
            source,
            read,
            signal,
          );
        case "backlog-at":
          return answered({
            revision: read.revision,
            backlog: await pinned.reader(
              source,
              read.revision,
              signal,
            )(source.backlogPath),
          });
        case "agent-profiles-at":
        case "done-records-at":
          return await performListedRecordsRead(
            pinned,
            source,
            read,
            signal,
            (now) => {
              reading = now;
            },
          );
        case "addition-at": {
          const added = await listedProfileAddition(
            pinned,
            source,
            read,
            signal,
          );
          if (added === undefined) {
            return unreachable;
          }
          // The avatar source stays here: the page asks for the image
          // through `./avatarRead.ts`, never from GitHub itself.
          return answered({
            revision: read.revision,
            path: read.path,
            added: added && {
              commit: added.commit,
              committerName: added.committerName,
              committedAt: added.committedAt,
              login: added.login,
            },
          });
        }
        case "containment-at":
          return await performContainmentRead(source, read, signal);
        case "branch-head-at":
          return await performBranchHeadRead(
            { pinned, branches },
            source,
            read,
            signal,
          );
        case "commit-time-at":
        case "file-at": {
          if (read.onBranch !== undefined) {
            return await performOnBranch(
              { pinned, branches },
              source,
              read,
              read.onBranch,
              signal,
            );
          }
          const { revision, path } = read;
          const readPinned = pinned.reader(source, revision, signal);
          if (
            !(await pathReachableFromRevision(
              source,
              revision,
              path,
              readPinned,
            ))
          ) {
            return unreachable;
          }
          return read.kind === "file-at"
            ? answered({ revision, path, text: await readPinned(path) })
            : answered({
                revision,
                path,
                committedAt: await pinned.committer(
                  source,
                  revision,
                  signal,
                )(path),
              });
        }
        case "ref": {
          // When the ref was asked, by this server's clock, as launch
          // attempts settle by it.
          const askedAt = new Date().toISOString();
          const revision = await resolveRevisionViaGh(
            source.repository,
            source.ref,
            signal,
          );
          reading = readingPathAt(source.backlogPath, revision);
          // The membership read always asks for the backlog afresh, and
          // leaves it for the reachability checks of this revision's later
          // detail reads.
          const backlog = await readRepositoryFileViaGh(
            source.repository,
            source.backlogPath,
            revision,
            signal,
          );
          pinned.remember(source, revision, source.backlogPath, backlog);
          return answered({ revision, backlog, askedAt });
        }
      }
    });
  } catch (error) {
    return { kind: "failed", ...reportedFailure(error, source, reading) };
  }
}
