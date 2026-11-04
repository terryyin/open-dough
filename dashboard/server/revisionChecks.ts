// Revision-only checks for the local authenticated read boundary
// (`./authenticatedRead.ts`): which commit a catalog source's ref, and every
// other published branch head, names now, asked of GitHub in one conditional
// listing (`./ghRevision.ts`) so unchanged heads cost a `304 Not Modified`
// rather than a fresh answer. When that listing fails for any reason but a
// rate limit, a read held back by one, or a timeout -- it is one unpaginated
// answer, which a repository with thousands of branches may exceed or GitHub
// may give up on -- that check asks only which commit the ref names, and
// says nothing of branch heads.
//
// One process shares a settled listing across pages of the same source and
// request-owner scope for a short reuse window (the same window host status
// uses), joining an outstanding listing otherwise, through
// `./sharedObservation.ts`. The listing runs under its own tracked controller
// so a departed requester leaves it to settle; closing the boundary aborts it.

import type { PublishedSource } from "../src/publishedSource.ts";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { checkReuseMs } from "../src/revisionCheckSchedule.ts";
import {
  checkHeadsViaGh,
  resolveRevisionViaGh,
  type HeadsAnswer,
} from "./ghRevision.ts";
import { GhFailure, rateLimitStop, scope } from "./ghRead.ts";
import { SharedObservation } from "./sharedObservation.ts";

// What one check found: the commit the source's ref names, and the head of
// every published branch, or undefined when the listing could not say.
export type CheckedHeads = {
  readonly revision: string;
  readonly heads: ReadonlyMap<string, string> | undefined;
};

export type RevisionCheckOptions = {
  // Controllers the boundary aborts on close (`./authenticatedRead.ts`).
  readonly tracked: Set<AbortController>;
  // How long a settled listing serves later checks, read on each demand.
  readonly reuseMs?: () => number;
  // The request-owner scope a listing is keyed by; undefined shares nothing.
  readonly scope?: () => Promise<string | undefined>;
  // The listing itself; production asks GitHub. A boundary spec that keys by
  // scope alone may substitute a settled answer without launching `gh`.
  readonly listHeads?: (
    source: PublishedSource,
    signal: AbortSignal,
  ) => Promise<CheckedHeads>;
};

// How long a settled listing serves later checks: `checkReuseMs`, unless a
// test names another through `DOUGH_REVISION_CHECK_REUSE_MS` (including
// zero). Unlike `./configuredLimit.ts`, zero is a usable override so existing
// boundary cases still see every listing.
export function revisionCheckReuseMs(): number {
  const raw = process.env["DOUGH_REVISION_CHECK_REUSE_MS"];
  if (raw !== undefined && raw !== "") {
    const ms = Number(raw);
    if (Number.isFinite(ms) && ms >= 0) return ms;
  }
  return checkReuseMs;
}

// The last answer per catalog source, kept only as a hint for the next
// conditional request: in memory, per launched server, bounded by the
// catalog, and never a source of what a project published -- a `304` only
// repeats heads GitHub itself listed for this same source, and every other
// answer replaces the hint. Beside it, one shared observation per source
// serves later checks under the same scope within the reuse window.
export class RevisionChecks {
  private readonly answers = new Map<string, HeadsAnswer>();
  private readonly observations = new Map<
    string,
    SharedObservation<CheckedHeads>
  >();
  private readonly tracked: Set<AbortController>;
  private readonly reuseMs: () => number;
  private readonly ownerScope: () => Promise<string | undefined>;
  private readonly listHeads:
    | ((source: PublishedSource, signal: AbortSignal) => Promise<CheckedHeads>)
    | undefined;

  constructor({
    tracked,
    reuseMs = revisionCheckReuseMs,
    scope: ownerScope = scope,
    listHeads,
  }: RevisionCheckOptions) {
    this.tracked = tracked;
    this.reuseMs = reuseMs;
    this.ownerScope = ownerScope;
    this.listHeads = listHeads;
  }

  async check(
    source: PublishedSource,
    signal: AbortSignal,
  ): Promise<CheckedHeads> {
    const ownerScope = await this.ownerScope();
    // An undefined scope shares nothing: each demand uses a unique key.
    const key = ownerScope === undefined ? [Object.create(null)] : [ownerScope];
    try {
      const demanded = await this.observationFor(source).demand(
        key,
        readWaitLimitMs,
        signal,
      );
      if (demanded.kind === "observed") return demanded.value;
      if (demanded.kind === "unanswered") {
        throw new GhFailure({ kind: "timed-out" });
      }
      throw signal.reason ?? new GhFailure({ kind: "timed-out" });
    } catch (error) {
      if (
        signal.aborted ||
        !(error instanceof GhFailure) ||
        rateLimitStop(error) !== undefined ||
        // A listing shared with an earlier request may reach its own bound
        // first: this request is answered as timed out too.
        error.reason.kind === "timed-out"
      ) {
        throw error;
      }
      // The earlier answer stays the hint, so watching branch heads resumes
      // with the next listing that succeeds. A failed listing keeps no
      // settled observation, so the next check asks GitHub again.
      return {
        revision: (
          await resolveRevisionViaGh(source.repository, source.ref, signal)
        ).revision,
        heads: undefined,
      };
    }
  }

  private observationFor(
    source: PublishedSource,
  ): SharedObservation<CheckedHeads> {
    const existing = this.observations.get(source.id);
    if (existing !== undefined) return existing;
    const created = new SharedObservation<CheckedHeads>(
      () => this.list(source),
      this.reuseMs,
    );
    this.observations.set(source.id, created);
    return created;
  }

  // One listing under its own tracked controller: a requester's signal ends
  // only its wait on the shared observation, never this listing.
  private async list(source: PublishedSource): Promise<CheckedHeads> {
    const controller = new AbortController();
    this.tracked.add(controller);
    try {
      if (this.listHeads !== undefined) {
        return await this.listHeads(source, controller.signal);
      }
      const answer = await checkHeadsViaGh(
        source.repository,
        this.answers.get(source.id),
        controller.signal,
      );
      if (answer.etag === undefined) {
        this.answers.delete(source.id);
      } else {
        this.answers.set(source.id, answer);
      }
      const revision = answer.heads.get(source.ref);
      if (revision === undefined) {
        throw new GhFailure({ kind: "no-commit" });
      }
      return { revision, heads: answer.heads };
    } finally {
      this.tracked.delete(controller);
    }
  }
}
