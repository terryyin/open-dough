// Performs a revision check for the local authenticated read boundary
// (`./authenticatedRead.ts`), inside `./performedRead.ts`'s tracked `gh`
// lifetime and failure wording: whether the source's ref still names the
// revision shown, and which head each watched story branch names now, from
// one conditional listing of every published branch head
// (`./revisionChecks.ts`). A branch is watched only when a Taken entry's
// profile records it at the revision shown (`./branchReachability.ts`); each
// head found for it is remembered as resolved (`./branchHeads.ts`), so the
// page may read that branch's plan there without resolving it again. A check
// whose listing could not say answers the ref alone, naming no branch head.

import type { BranchHeads } from "./branchHeads.ts";
import { branchRecordedAtRevision } from "./branchReachability.ts";
import { unrecordedBranch } from "./performedBranchRead.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import type { RequestedRead } from "./requestedRead.ts";
import type { RevisionChecks } from "./revisionChecks.ts";
import type { PublishedSource } from "../src/publishedSource.ts";

type CheckReaders = {
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
  readonly branches: BranchHeads;
};

export async function performRevisionCheck(
  { pinned, checks, branches }: CheckReaders,
  source: PublishedSource,
  { since, watched }: Extract<RequestedRead, { kind: "revision-check" }>,
  signal: AbortSignal,
): Promise<Outcome> {
  for (const branch of watched) {
    const recorded = await branchRecordedAtRevision(
      source,
      since,
      branch,
      pinned.reader(source, since, signal),
      pinned.lister(source, since, signal),
    );
    if (!recorded) {
      return unrecordedBranch;
    }
  }
  const { revision, heads } = await checks.check(source, signal);
  const checked = { revision, changed: revision !== since };
  if (heads === undefined) {
    return answered(checked);
  }
  return answered({
    ...checked,
    branches: watched.map((branch) => {
      const head = heads.get(branch);
      if (head !== undefined) {
        branches.remember(source, branch, head);
      }
      return { branch, head: head ?? null };
    }),
  });
}
