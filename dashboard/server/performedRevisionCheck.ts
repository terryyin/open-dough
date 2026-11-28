// Report the shared verified trunk and branch heads for authorized
// story-branch watches. Remember reported heads for later pinned plan reads.

import type { BranchHeads } from "./branchHeads.ts";
import { takenEntriesByBranch } from "./branchReachability.ts";
import { unrecordedBranch } from "./performedBranchRead.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import type { RequestedRead } from "./requestedRead.ts";
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
  { pinned, branches }: CheckReaders,
  source: PublishedSource,
  { since, watched }: Pick<RevisionCheckRead, "since" | "watched">,
  signal: AbortSignal,
  observe: () => AskedOriginTrunk | Promise<AskedOriginTrunk>,
): Promise<Outcome> {
  if (watched.length > 0) {
    const recorded = await takenEntriesByBranch(
      source,
      since,
      pinned.reader(source, since, signal),
      pinned.lister(source, since, signal),
    );
    if (watched.some((branch) => !recorded.has(branch)))
      return unrecordedBranch;
  }
  const { askedAt, trunk } = await observe();
  const verified = verifiedTrunk(trunk);
  const { revision, confirmedAt, unrecorded } = verified;
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
  if (watched.length === 0 || checked.changed) return answered(checked);
  const heads = new Map(
    verified.branches?.map(({ branch, head }) => [branch, head]),
  );
  const reported = watched.flatMap((branch) => {
    const head = heads.get(branch);
    if (head === undefined) return [];
    if (head !== null) {
      branches.remember(source, branch, head);
      pinned.heardNamed(source, head);
    }
    return [{ branch, head }];
  });
  return answered(
    reported.length === watched.length
      ? { ...checked, branches: reported }
      : checked,
  );
}
