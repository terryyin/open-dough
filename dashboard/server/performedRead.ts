// Performs one allowed read for the local authenticated read boundary
// (`./authenticatedRead.ts`), once the request is accepted and its catalog
// source and requested read (`./requestedRead.ts`) are known: its `gh` calls
// are tracked for the request's lifetime, and any failure is worded for this
// source and what was being read when it failed. Reads on a story branch are
// performed in `./performedBranchRead.ts`, revision checks in
// `./performedRevisionCheck.ts`; what a read comes to is
// `./readOutcome.ts`.

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
import { reportedFailure } from "./readFailureMessage.ts";
import {
  answered,
  unreachable,
  type Outcome,
  type PinnedFile,
} from "./readOutcome.ts";
import {
  agentProfileDirectoryOf,
  agentSettingsTextAt,
  isListedAgentProfile,
  listedAgentProfilePaths,
  pathReachableFromRevision,
} from "./reachablePaths.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { RequestedRead } from "./requestedRead.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  readingAdditionAt,
  readingBranchHeadOf,
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
      return readingPathAt(agentProfileDirectoryOf(source), read.revision);
    case "addition-at":
      return readingAdditionAt(read.path, read.revision);
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
        case "agent-profiles-at": {
          const listPinned = pinned.lister(source, read.revision, signal);
          const readPinned = pinned.reader(source, read.revision, signal);
          const profiles: PinnedFile[] = [];
          const paths = await listedAgentProfilePaths(source, listPinned);
          for (const path of paths) {
            reading = readingPathAt(path, read.revision);
            profiles.push({ path, text: await readPinned(path) });
          }
          reading = readingPathAt(agentSettingsPath, read.revision);
          const settings = await agentSettingsTextAt(readPinned);
          return answered({ revision: read.revision, profiles, settings });
        }
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
          const reachable = await pathReachableFromRevision(
            source,
            read.revision,
            read.path,
            pinned.reader(source, read.revision, signal),
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
