// Performs one allowed read on a story branch for the local authenticated
// read boundary (`./authenticatedRead.ts`), inside `./performedRead.ts`'s
// tracked `gh` lifetime and failure wording: which commit a recorded branch
// names now, or a file or its last commit at a head already resolved. The
// pinned revision's records decide whether the branch and path may be read at
// all (`./branchReachability.ts`); a head is readable only when this boundary
// resolved that branch to it (`./branchHeads.ts`).

import type { BranchHeads } from "./branchHeads";
import { isNotFound } from "./ghRead";
import type { PinnedTexts } from "./pinnedTexts";
import {
  branchPlanReachableFromRevision,
  branchRecordedAtRevision,
} from "./branchReachability";
import { answered, unreachable, type Outcome } from "./readOutcome";
import type { OnBranch, RequestedRead } from "./requestedRead";
import type { PublishedSource } from "../src/publishedSource";

type BranchReaders = {
  readonly pinned: PinnedTexts;
  readonly branches: BranchHeads;
};

// Which commit a branch a Taken entry's profile records at the pinned
// revision names now; a null head when it is no longer published.
export async function performBranchHeadRead(
  { pinned, branches }: BranchReaders,
  source: PublishedSource,
  read: Extract<RequestedRead, { kind: "branch-head-at" }>,
  signal: AbortSignal,
): Promise<Outcome> {
  const recorded = await branchRecordedAtRevision(
    source,
    read.revision,
    read.branch,
    pinned.reader(source, read.revision, signal),
    pinned.lister(source, read.revision, signal),
  );
  if (!recorded) {
    return unrecordedBranch;
  }
  const head = await branches.resolve(source, read.branch, signal);
  return answered({
    revision: read.revision,
    branch: read.branch,
    head: head ?? null,
  });
}

// A file or its last commit at a story branch head. A plan the head does not
// have is answered as missing there, never looked for anywhere else.
export async function performOnBranch(
  { pinned, branches }: BranchReaders,
  source: PublishedSource,
  read: Extract<RequestedRead, { kind: "file-at" | "commit-time-at" }>,
  { branch, head }: OnBranch,
  signal: AbortSignal,
): Promise<Outcome> {
  const reachable = await branchPlanReachableFromRevision(
    source,
    read.revision,
    branch,
    read.path,
    pinned.reader(source, read.revision, signal),
    pinned.lister(source, read.revision, signal),
  );
  if (!reachable) {
    return unreachable;
  }
  if (!branches.resolved(source, branch, head)) {
    return unresolvedHead;
  }
  if (read.kind === "commit-time-at") {
    return answered({
      revision: head,
      path: read.path,
      committedAt: await pinned.committer(source, head, signal)(read.path),
    });
  }
  let text: string | null;
  try {
    text = await pinned.reader(source, head, signal)(read.path);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    text = null;
  }
  return answered({ revision: head, path: read.path, text });
}

const unrecordedBranch: Outcome = {
  kind: "refused",
  status: 404,
  message:
    "That branch is not recorded by a Taken entry's agent profile at this source revision.",
};

const unresolvedHead: Outcome = {
  kind: "refused",
  status: 409,
  message: "That branch head was not resolved by this read boundary.",
};
