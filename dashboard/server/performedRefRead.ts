// The Board's cold open (`./performedRead.ts`). One shared verified-trunk
// check (`./sharedVerifiedOriginTrunk.ts`) answers the backlog it read, which
// that check has already pinned. A trunk it could not verify fails the read
// as unavailable; an explicit refusal is thrown by the check itself.

import type { PublishedSource } from "../src/publishedSource.ts";
import { GhFailure, type UnavailableTrunkPart } from "./ghFailure.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import type {
  AskedOriginTrunk,
  OriginTrunkDemand,
  SharedVerifiedOriginTrunk,
} from "./sharedVerifiedOriginTrunk.ts";
import type { VerifiedOriginTrunk } from "./verifiedOriginTrunk.ts";

export async function performVerifiedTrunkRead(
  trunks: SharedVerifiedOriginTrunk,
  pinned: PinnedTexts,
  source: PublishedSource,
  signal: AbortSignal,
  demand: OriginTrunkDemand,
): Promise<Outcome> {
  const demanded = await trunks.demand(source, pinned, signal, demand);
  if (demanded.kind === "departed") {
    signal.throwIfAborted();
    throw signal.reason;
  }
  if (demanded.kind === "unanswered") {
    throw new GhFailure({ kind: "timed-out" });
  }
  return admit(pinned, source, demanded.value);
}

function admit(
  pinned: PinnedTexts,
  source: PublishedSource,
  { askedAt, trunk }: AskedOriginTrunk,
): Outcome {
  if (trunk.kind === "verified") {
    const { revision, backlog } = trunk;
    // This backlog is the revision a later trunk is compared with.
    pinned.answeredBacklog(source, revision);
    return answered({ revision, backlog, askedAt });
  }
  throw new GhFailure({
    kind: "unavailable",
    part: unavailablePart[trunk.kind],
  });
}

// A fetched commit other than the probed one is origin moving or failing
// mid-read, so it is reported as origin unavailable.
const unavailablePart: Record<
  Exclude<VerifiedOriginTrunk["kind"], "verified">,
  UnavailableTrunkPart
> = {
  unavailable: "origin",
  rejected: "origin",
  "missing-trunk": "trunk",
  "unreadable-backlog": "backlog",
};
