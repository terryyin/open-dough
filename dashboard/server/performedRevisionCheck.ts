// Performs a revision check for the local authenticated read boundary
// (`./authenticatedRead.ts`), inside `./performedRead.ts`'s tracked `gh`
// lifetime and failure wording: whether the source's ref still names the
// revision shown, and which head each watched story branch names now, from
// one conditional listing of every published branch head
// (`./revisionChecks.ts`). A branch is watched only when a Taken entry's
// profile records it at the revision shown (`./branchReachability.ts`); each
// head found for it is remembered as resolved (`./branchHeads.ts`), so the
// page may read that branch's plan there without resolving it again.

import type { BranchHeads } from "./branchHeads";
import { branchRecordedAtRevision } from "./branchReachability";
import { unrecordedBranch } from "./performedBranchRead";
import type { PinnedTexts } from "./pinnedTexts";
import { answered, type Outcome } from "./readOutcome";
import type { RequestedRead } from "./requestedRead";
import type { RevisionChecks } from "./revisionChecks";
import type { PublishedSource } from "../src/publishedSource";

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
  return answered({
    revision,
    changed: revision !== since,
    branches: watched.map((branch) => {
      const head = heads.get(branch);
      if (head !== undefined) {
        branches.remember(source, branch, head);
      }
      return { branch, head: head ?? null };
    }),
  });
}
