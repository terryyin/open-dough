// Performs one allowed read for the local authenticated read boundary
// (`./authenticatedRead.ts`), once the request is accepted and its catalog
// source and requested read (`./requestedRead.ts`) are known: its `gh` calls
// are tracked for the request's lifetime, and any failure is worded for this
// source and what was being read when it failed. Failure naming is in
// `./readingRequestedRead.ts`, and what a read comes to is `./readOutcome.ts`.

import type { IncomingMessage } from "node:http";
import type { AvatarImages } from "./avatarImages.ts";
import type { BranchHeads } from "./branchHeads.ts";
import {
  performBranchHeadRead,
  performOnBranch,
} from "./performedBranchRead.ts";
import { performPinnedFileRead } from "./performedPinnedFileRead.ts";
import { performVerifiedTrunkRead } from "./performedRefRead.ts";
import { performHttpRevisionCheck } from "./performedRevisionCheck.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import type { RevisionChecks } from "./revisionChecks.ts";
import type { SharedVerifiedOriginTrunk } from "./sharedVerifiedOriginTrunk.ts";
import { withTrackedGh } from "./trackedGh.ts";
import {
  contextForAdmittedRead,
  withReadDiagnosticContext,
} from "./readDiagnostics.ts";
import { performContainmentRead } from "./containmentRead.ts";
import { reportedFailure } from "./readFailureMessage.ts";
import { performListedRecordsRead } from "./listedRecordsRead.ts";
import { performAdditionRead } from "./additionRead.ts";
import { performPublishedSessionsRead } from "./publishedSessionsRead.ts";
import { performDoneCatalogRead } from "./doneCatalogRead.ts";
import { performIntentLocationsRead } from "./intentLocationsRead.ts";
import { performIntentCandidatesRead } from "./intentCandidatesRead.ts";
import { performIntentCiComparisonRead } from "./intentCiComparisonRead.ts";
import { performIntentCiHistoryRead } from "./intentCiHistoryRead.ts";
import { performIntentCiProofRead } from "./intentCiProofRead.ts";
import { performIntentCiStatusRead } from "./intentCiStatusRead.ts";
import { performProjectBrowseRead } from "./projectBrowseRead.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { readingOf } from "./readingRequestedRead.ts";
import type { RequestedRead } from "./requestedRead.ts";
import type { PublishedSource } from "../src/publishedSource.ts";

export type Boundary = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
  readonly trunks: SharedVerifiedOriginTrunk;
  readonly branches: BranchHeads;
  readonly avatars: AvatarImages;
};

// Performs one allowed read with its `gh` calls tracked, and words any
// failure for this source and what was being read when it failed.
export async function perform(
  req: IncomingMessage,
  { tracked, pinned, checks, branches, trunks }: Boundary,
  source: PublishedSource,
  read: RequestedRead,
): Promise<Outcome> {
  let reading = readingOf(source, read);
  let readTarget: "backlog" | undefined =
    read.kind === "file-at" && read.path === source.backlogPath
      ? "backlog"
      : undefined;
  const naming = (now: string) => {
    reading = now;
  };
  try {
    return await withReadDiagnosticContext(
      contextForAdmittedRead(source.id, read),
      () =>
        withTrackedGh(req, tracked, async (signal) => {
          // The backlog at a resolved commit: one this process already read there
          // is answered from the memo, which keeps it for the reachability checks
          // of that revision's later detail reads. It is read at the revision
          // itself; only those detail reads at a revision the ref names next are
          // compared with the last one answered here (`./pinnedTexts.ts`).
          const backlogAt = async (revision: string) => {
            readTarget = "backlog";
            const backlog = await pinned.reader(
              source,
              revision,
              signal,
            )(source.backlogPath);
            pinned.answeredBacklog(source, revision);
            return backlog;
          };
          switch (read.kind) {
            case "revision-check":
              return await performHttpRevisionCheck(
                { pinned, checks, branches, trunks },
                source,
                read,
                signal,
              );
            case "backlog-at":
              return answered({
                revision: read.revision,
                backlog: await backlogAt(read.revision),
              });
            case "agent-profiles-at":
              return await performListedRecordsRead(
                pinned,
                source,
                read,
                signal,
                naming,
              );
            case "done-catalog-at":
            case "done-bodies-at":
              return await performDoneCatalogRead(
                pinned,
                source,
                read,
                signal,
                naming,
              );
            case "intent-locations-at":
              return await performIntentLocationsRead(
                pinned,
                source,
                read,
                signal,
                naming,
              );
            case "intent-candidates-at":
              return await performIntentCandidatesRead(
                pinned,
                source,
                read,
                signal,
                naming,
              );
            case "intent-ci-status":
              return await performIntentCiStatusRead(source, read, signal);
            case "intent-ci-proof":
              return await performIntentCiProofRead(
                source,
                read,
                signal,
                (asked) => executionCheckout(asked).path,
              );
            case "intent-ci-comparison":
              return await performIntentCiComparisonRead(source, read, signal);
            case "intent-ci-history":
              return await performIntentCiHistoryRead(source, read, {
                signal,
                localRepository: executionCheckout(source).path,
              });
            case "project-tree-at":
            case "project-file-at":
              return await performProjectBrowseRead(source, read, signal);
            case "published-sessions-at":
              return await performPublishedSessionsRead(
                source,
                read,
                pinned.lister(source, read.revision, signal),
                pinned.blobReader(source, read.revision, signal),
              );
            case "addition-at":
              return await performAdditionRead(pinned, source, read, signal);
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
            case "file-at":
              if (read.onBranch !== undefined) {
                return await performOnBranch(
                  { pinned, branches },
                  source,
                  read,
                  read.onBranch,
                  signal,
                );
              }
              return await performPinnedFileRead(pinned, source, read, signal);
            case "ref":
              return await performVerifiedTrunkRead(
                trunks,
                pinned,
                source,
                signal,
                { fresh: read.fresh },
              );
          }
        }),
    );
  } catch (error) {
    return {
      kind: "failed",
      ...reportedFailure(error, source, reading, readTarget),
    };
  }
}
