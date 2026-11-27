// The Board's cold open (`./performedRead.ts`). One shared verified-trunk
// check (`./sharedVerifiedOriginTrunk.ts`) answers the backlog it read, which
// that check has already pinned; a trunk it could not verify fails the read.

import type { PublishedSource } from "../src/publishedSource.ts";
import { GhFailure } from "./ghFailure.ts";
import { observeProjectRevision } from "./observedSessionLandings.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import type {
  AskedOriginTrunk,
  SharedVerifiedOriginTrunk,
} from "./sharedVerifiedOriginTrunk.ts";

export async function performVerifiedTrunkRead(
  trunks: SharedVerifiedOriginTrunk,
  pinned: PinnedTexts,
  source: PublishedSource,
  signal: AbortSignal,
): Promise<Outcome> {
  const demanded = await trunks.demand(source, pinned, signal);
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
    observeProjectRevision(pinned, source, revision);
    // This backlog is the revision a later trunk is compared with.
    pinned.answeredBacklog(source, revision);
    return answered({ revision, backlog, askedAt });
  }
  if (trunk.kind === "missing-trunk") {
    throw new GhFailure({ kind: "no-commit" });
  }
  throw new GhFailure({ kind: "failed" });
}
