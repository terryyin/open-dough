// Report the shared verified trunk and the interim REST heads for authorized
// story-branch watches. Remember reported heads for later pinned plan reads.

import type { BranchHeads } from "./branchHeads.ts";
import { branchRecordedAtRevision } from "./branchReachability.ts";
import { unrecordedBranch } from "./performedBranchRead.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import type { RequestedRead } from "./requestedRead.ts";
import type { RevisionChecks } from "./revisionChecks.ts";
import type {
  AskedOriginTrunk,
  SharedVerifiedOriginTrunk,
} from "./sharedVerifiedOriginTrunk.ts";
import { demandVerifiedTrunk, verifiedTrunk } from "./performedRefRead.ts";
import { requireCoreReadsAllowed } from "./ghRead.ts";
import { readingRefOf } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";

type CheckReaders = {
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
  readonly branches: BranchHeads;
};

type RevisionCheckRead = Extract<RequestedRead, { kind: "revision-check" }>;

export function performHttpRevisionCheck(
  readers: CheckReaders & { readonly trunks: SharedVerifiedOriginTrunk },
  source: PublishedSource,
  read: RevisionCheckRead,
  signal: AbortSignal,
): Promise<Outcome> {
  return performRevisionCheck(readers, source, read, signal, async () => {
    await requireCoreReadsAllowed(signal);
    return demandVerifiedTrunk(readers.trunks, readers.pinned, source, signal, {
      fresh: read.fresh,
    });
  });
}

export async function performRevisionCheck(
  { pinned, checks, branches }: CheckReaders,
  source: PublishedSource,
  { since, watched }: Pick<RevisionCheckRead, "since" | "watched">,
  signal: AbortSignal,
  observe: () => AskedOriginTrunk | Promise<AskedOriginTrunk>,
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
  const { askedAt, trunk } = await observe();
  const { revision, confirmedAt, unrecorded } = verifiedTrunk(trunk);
  if (unrecorded) {
    return {
      kind: "failed",
      message: `The check of ${readingRefOf(source)} could not be saved.`,
      retryAfterSeconds: undefined,
      recovery: undefined,
    };
  }
  const checked = {
    revision,
    changed: revision !== since,
    confirmedAt,
    askedAt,
  };
  const heads =
    watched.length > 0 ? await checks.watchedHeads(source, signal) : undefined;
  if (heads === undefined) {
    return answered(checked);
  }
  return answered({
    ...checked,
    branches: watched.map((branch) => {
      const head = heads.get(branch);
      if (head !== undefined) {
        branches.remember(source, branch, head);
        pinned.heardNamed(source, head);
      }
      return { branch, head: head ?? null };
    }),
  });
}
