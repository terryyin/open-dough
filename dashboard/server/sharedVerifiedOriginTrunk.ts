// One verified origin-trunk check, shared by concurrent opens of the same
// project, origin URL and Git credential. A single SharedObservation waits
// out a different key before starting it, so each key keeps its own
// observation and a second project can proceed while another transfer is
// held. The check uses the first demand's pinned texts and its own
// controller: a waiter's signal ends only that wait.

import type { PublishedSource } from "../src/publishedSource.ts";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { githubGitCredentials, githubGitOrigin } from "./githubGitTransport.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { revisionCheckReuseMs } from "./revisionChecks.ts";
import { SharedObservation, type Demanded } from "./sharedObservation.ts";
import {
  verifiedOriginTrunk,
  type VerifiedOriginTrunk,
} from "./verifiedOriginTrunk.ts";

type OriginTrunkKey = readonly [string, string, typeof githubGitCredentials];

const originTrunkKey = (source: PublishedSource): OriginTrunkKey => [
  source.id,
  githubGitOrigin(source.repository),
  githubGitCredentials,
];

const observationKey = (key: OriginTrunkKey) => JSON.stringify(key);

// A check's outcome and when it started, by the clock `askGh` uses: a demand
// that joined a running check answers that start, not its own arrival.
export type AskedOriginTrunk = {
  readonly askedAt: string;
  readonly trunk: VerifiedOriginTrunk;
};

export type SharedVerifiedOriginTrunkOptions = {
  // How long a settled check serves a later demand. Defaults to the revision
  // check window, including a test's `DOUGH_REVISION_CHECK_REUSE_MS`.
  readonly reuseMs?: () => number;
};

export class SharedVerifiedOriginTrunk {
  private readonly observations = new Map<
    string,
    SharedObservation<AskedOriginTrunk, OriginTrunkKey>
  >();
  private readonly reuseMs: () => number;

  constructor({
    reuseMs = revisionCheckReuseMs,
  }: SharedVerifiedOriginTrunkOptions = {}) {
    this.reuseMs = reuseMs;
  }

  demand(
    source: PublishedSource,
    pinned: PinnedTexts,
    signal: AbortSignal,
    waitMs = readWaitLimitMs,
  ): Promise<Demanded<AskedOriginTrunk>> {
    return this.observationFor(source, pinned).demand(
      originTrunkKey(source),
      waitMs,
      signal,
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

  // The waiter's signal is not this controller's. Aborting one waiter leaves
  // the Git check running for the others. A thrown GhFailure rejects the
  // observation's waiters.
  private async check(
    source: PublishedSource,
    pinned: PinnedTexts,
  ): Promise<AskedOriginTrunk> {
    const askedAt = new Date().toISOString();
    const controller = new AbortController();
    const trunk = await verifiedOriginTrunk(source, pinned, controller.signal);
    return { askedAt, trunk };
  }
}
