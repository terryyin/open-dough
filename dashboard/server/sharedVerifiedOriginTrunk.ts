// One verified origin-trunk check, shared by concurrent opens of the same
// project, origin URL and Git credential. A single SharedObservation waits
// out a different key before starting it, so each key keeps its own
// observation and a second project can proceed while another transfer is
// held. The check uses the first demand's pinned texts and its own deadline:
// a waiter's signal ends only that wait, and a transfer still running at the
// Board's read deadline is ended so the next demand starts a new check. A
// fresh demand is answered only by a check begun after it asked.

import type { PublishedSource } from "../src/publishedSource.ts";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { GhFailure } from "./ghFailure.ts";
import { githubGitCredentials, githubGitOrigin } from "./githubGitTransport.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { checkReuseMs } from "../src/revisionCheckSchedule.ts";
import { SharedObservation, type Demanded } from "./sharedObservation.ts";
import {
  verifiedOriginTrunk,
  type VerifiedOriginTrunk,
} from "./verifiedOriginTrunk.ts";

// Zero lets boundary cases require every demand to observe origin.
function revisionCheckReuseMs(): number {
  const raw = process.env["DOUGH_REVISION_CHECK_REUSE_MS"];
  if (raw !== undefined && raw !== "") {
    const ms = Number(raw);
    if (Number.isFinite(ms) && ms >= 0) return ms;
  }
  return checkReuseMs;
}

type OriginTrunkKey = readonly [string, string, typeof githubGitCredentials];

const originTrunkKey = (source: PublishedSource): OriginTrunkKey => [
  source.id,
  githubGitOrigin(source.repository),
  githubGitCredentials,
];

const observationKey = (key: OriginTrunkKey) => JSON.stringify(key);

// A check's outcome and when it started, by this server's clock: a demand
// that joined a running check answers that start, not its own arrival.
export type AskedOriginTrunk = {
  readonly askedAt: string;
  readonly trunk: VerifiedOriginTrunk;
};

export type SharedVerifiedOriginTrunkOptions = {
  // How long a settled check serves a later demand. Defaults to the revision
  // check window, including a test's `DOUGH_REVISION_CHECK_REUSE_MS`.
  readonly reuseMs?: () => number;
  // Ends one check's Git calls when it aborts. Defaults to the Board's read
  // wait limit from the check's start.
  readonly deadline?: () => AbortSignal;
};

export type OriginTrunkDemand = {
  readonly waitMs?: number;
  // Answered only by a check begun after this demand.
  readonly fresh?: boolean;
};

export class SharedVerifiedOriginTrunk {
  private readonly observations = new Map<
    string,
    SharedObservation<AskedOriginTrunk, OriginTrunkKey>
  >();
  private readonly reuseMs: () => number;
  private readonly deadline: () => AbortSignal;

  constructor({
    reuseMs = revisionCheckReuseMs,
    deadline = () => AbortSignal.timeout(readWaitLimitMs),
  }: SharedVerifiedOriginTrunkOptions = {}) {
    this.reuseMs = reuseMs;
    this.deadline = deadline;
  }

  demand(
    source: PublishedSource,
    pinned: PinnedTexts,
    signal: AbortSignal,
    { waitMs = readWaitLimitMs, fresh = false }: OriginTrunkDemand = {},
  ): Promise<Demanded<AskedOriginTrunk>> {
    return this.observationFor(source, pinned).demand(
      originTrunkKey(source),
      waitMs,
      signal,
      fresh,
    );
  }

  // The observation for this key, closed over the first demand's source and
  // pinned texts. A later demand with the same key joins it.
  private observationFor(
    source: PublishedSource,
    pinned: PinnedTexts,
  ): SharedObservation<AskedOriginTrunk, OriginTrunkKey> {
    const key = observationKey(originTrunkKey(source));
    const existing = this.observations.get(key);
    if (existing !== undefined) return existing;
    const created = new SharedObservation<AskedOriginTrunk, OriginTrunkKey>(
      () => this.check(source, pinned),
      this.reuseMs,
    );
    this.observations.set(key, created);
    return created;
  }

  // The waiter's signal is not the check's. Aborting one waiter leaves the
  // Git check running for the others; only the deadline ends it, as a timed
  // out read. A thrown GhFailure rejects the observation's waiters.
  private async check(
    source: PublishedSource,
    pinned: PinnedTexts,
  ): Promise<AskedOriginTrunk> {
    const askedAt = new Date().toISOString();
    const deadline = this.deadline();
    try {
      const trunk = await verifiedOriginTrunk(source, pinned, deadline);
      return { askedAt, trunk };
    } catch (error) {
      if (deadline.aborted) throw new GhFailure({ kind: "timed-out" });
      throw error;
    }
  }
}
