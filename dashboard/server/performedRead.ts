// Performs one allowed read for the local authenticated read boundary
// (`./authenticatedRead.ts`), once the request is accepted and its catalog
// source and requested read (`./requestedRead.ts`) are known: its `gh` calls
// are tracked for the request's lifetime, and any failure is worded for this
// source and what was being read when it failed. Reads on a story branch are
// performed in `./performedBranchRead.ts`; what a read comes to is
// `./readOutcome.ts`.

import type { IncomingMessage } from "node:http";
import type { BranchHeads } from "./branchHeads";
import { resolveRevisionViaGh } from "./ghRevision";
import { readRepositoryFileViaGh } from "./ghContents";
import { performBranchHeadRead, performOnBranch } from "./performedBranchRead";
import type { PinnedTexts } from "./pinnedTexts";
import type { RevisionChecks } from "./revisionChecks";
import { withTrackedGh } from "./trackedGh";
import { reportedFailure } from "./readFailureMessage";
import {
  answered,
  unreachable,
  type Outcome,
  type PinnedFile,
} from "./readOutcome";
import {
  agentProfileDirectoryOf,
  commitTimeReachableFromRevision,
  listedAgentProfilePaths,
  pathReachableFromRevision,
} from "./reachablePaths";
import type { RequestedRead } from "./requestedRead";
import type { PublishedSource } from "../src/publishedSource";
import {
  readingBranchHeadOf,
  readingLastCommitAt,
  readingPathAt,
  readingRefOf,
} from "../src/authenticatedReadRules";

export type Boundary = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
  readonly branches: BranchHeads;
};

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
      return readingPathAt(agentProfileDirectoryOf(source), read.revision);
    case "backlog-at":
      return readingPathAt(source.backlogPath, read.revision);
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
        case "revision-check": {
          const revision = await checks.check(source, signal);
          return answered({ revision, changed: revision !== read.since });
        }
        case "backlog-at":
          return answered({
            revision: read.revision,
            backlog: await pinned.reader(
              source,
              read.revision,
              signal,
            )(source.backlogPath),
          });
        case "agent-profiles-at": {
          const listPinned = pinned.lister(source, read.revision, signal);
          const readPinned = pinned.reader(source, read.revision, signal);
          const profiles: PinnedFile[] = [];
          const paths = await listedAgentProfilePaths(source, listPinned);
          for (const path of paths) {
            reading = readingPathAt(path, read.revision);
            profiles.push({ path, text: await readPinned(path) });
          }
          return answered({ revision: read.revision, profiles });
        }
        case "branch-head-at":
          return await performBranchHeadRead(
            { pinned, branches },
            source,
            read,
            signal,
          );
        case "commit-time-at": {
          if (read.onBranch !== undefined) {
            return await performOnBranch(
              { pinned, branches },
              source,
              read,
              read.onBranch,
              signal,
            );
          }
          const reachable = await commitTimeReachableFromRevision(
            source,
            read.revision,
            read.path,
            pinned.reader(source, read.revision, signal),
            pinned.lister(source, read.revision, signal),
          );
          if (!reachable) {
            return unreachable;
          }
          return answered({
            revision: read.revision,
            path: read.path,
            committedAt: await pinned.committer(
              source,
              read.revision,
              signal,
            )(read.path),
          });
        }
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
          const readPinned = pinned.reader(source, read.revision, signal);
          const reachable = await pathReachableFromRevision(
            source,
            read.revision,
            read.path,
            readPinned,
          );
          if (!reachable) {
            return unreachable;
          }
          return answered({
            revision: read.revision,
            path: read.path,
            text: await readPinned(read.path),
          });
        }
        case "ref": {
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
          return answered({ revision, backlog });
        }
      }
    });
  } catch (error) {
    return { kind: "failed", ...reportedFailure(error, source, reading) };
  }
}
