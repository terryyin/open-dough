// Performs one allowed read for the local authenticated read boundary
// (`./authenticatedRead.ts`), once the request is accepted and its catalog
// source and requested read (`./requestedRead.ts`) are known: its `gh` calls
// are tracked for the request's lifetime, and any failure is worded for this
// source and what was being read when it failed.

import type { IncomingMessage } from "node:http";
import { resolveRevisionViaGh } from "./ghRead";
import { readRepositoryFileViaGh } from "./ghContents";
import type { PinnedTexts } from "./pinnedTexts";
import type { RevisionChecks } from "./revisionChecks";
import { withTrackedGh } from "./trackedGh";
import { reportedFailure, type ReportedFailure } from "./readFailureMessage";
import {
  agentProfileDirectoryOf,
  commitTimeReachableFromRevision,
  listedAgentProfilePaths,
  pathReachableFromRevision,
} from "./reachablePaths";
import type { RequestedRead } from "./requestedRead";
import type { PublishedSource } from "../src/publishedSource";
import {
  readingLastCommitAt,
  readingPathAt,
  readingRefOf,
} from "../src/authenticatedReadRules";

// What a successful read answers, as the browser reader
// (`../src/authenticatedRead.ts`) checks it.
type PinnedFile = { readonly path: string; readonly text: string };
type Answer =
  | { readonly revision: string; readonly backlog: string }
  | ({ readonly revision: string } & PinnedFile)
  | { readonly revision: string; readonly changed: boolean }
  | {
      readonly revision: string;
      readonly path: string;
      readonly committedAt: string;
    }
  | { readonly revision: string; readonly profiles: readonly PinnedFile[] };

export type Outcome =
  | { readonly kind: "answered"; readonly answer: Answer }
  | {
      readonly kind: "refused";
      readonly status: number;
      readonly message: string;
    }
  | ({ readonly kind: "failed" } & ReportedFailure);

export type Boundary = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
};

// What a read failure names as being read when the request was made.
function readingOf(source: PublishedSource, read: RequestedRead): string {
  switch (read.kind) {
    case "ref":
    case "revision-check":
      return readingRefOf(source);
    case "commit-time-at":
      return readingLastCommitAt(read.path, read.revision);
    case "file-at":
      return readingPathAt(read.path, read.revision);
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
  { tracked, pinned, checks }: Boundary,
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
        case "commit-time-at": {
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

const unreachable: Outcome = {
  kind: "refused",
  status: 404,
  message: "That path is not reachable from this source revision.",
};

function answered(answer: Answer): Outcome {
  return { kind: "answered", answer };
}
