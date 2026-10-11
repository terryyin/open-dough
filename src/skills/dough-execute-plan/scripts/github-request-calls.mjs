// The `gh` calls this machine's one request owner
// (`./github-request-owner.mjs`) has outstanding for every Open Dough
// consumer: one `gh api` call run with GitHub's status line and headers
// included, read once (`./github-request-answer.mjs`) -- a rate limit and
// the wait GitHub directed, whichever request met it -- one call shared by
// every requester asking it while it is outstanding
// (`./github-request-outstanding.mjs`), admitted once for all of them
// (`./github-request-admission.mjs`) and taking one of the owner's turns at
// GitHub. Each call has a fixed argument array -- never a shell string.

import { execFile } from "node:child_process";
import { ReadAdmission } from "./github-request-admission.mjs";
import {
  endedAtBound,
  GhFailure,
  readAnswer,
  unasked,
} from "./github-request-answer.mjs";
import { OutstandingReads } from "./github-request-outstanding.mjs";

/** @import { GhAnswer } from "./github-request-answer.mjs" */

// How long one call may run from its start however many requesters wait on
// it, and the most its answer may print before it fails: its first
// requester's.
/**
 * @typedef {{
 *   readonly boundMs: number;
 *   readonly maxBufferBytes: number;
 * }} CallBounds
 */

// Every call asks for GitHub's status line and headers (`--include`), right
// after `api`, so a refusal's status and direction are read here whatever
// was asked.
function includedArgs(args) {
  return ["api", "--include", ...args.slice(1)];
}

export class AdmittedCalls {
  // Every `gh` call still outstanding, keyed by its argument array and its
  // answer's bound: the question asked of GitHub, any conditional hint
  // included. Requesters asking it while it is outstanding wait on that one
  // call, which ends once none of them waits or at its own bound: its first
  // requester's, so none is set here. No settled answer is kept here.
  #outstanding = new OutstandingReads(0);

  // Whether GitHub may be asked now, and the turns at GitHub. Every call
  // `#outstanding` starts is admitted here once, for all the requesters
  // waiting on it, and takes one turn however many wait on it.
  #admission;

  #failed;

  // How many `gh` processes run now.
  #running = 0;

  // `backoffBaseMs` is the first wait after a rate limit that directs none,
  // doubling while the limit continues. `failed` hears once of each failed
  // answer `gh` gave; a held-back request, a requester's departure and a
  // bound that ends a call give none.
  /**
   * @param {{
   *   readonly backoffBaseMs: number;
   *   readonly failed?: (answer: GhAnswer) => void;
   * }} options
   */
  constructor({ backoffBaseMs, failed = () => undefined }) {
    this.#admission = new ReadAdmission(backoffBaseMs);
    this.#failed = failed;
  }

  // One `gh api` answer, settled whatever its exit. `signal` ends only this
  // requester's wait, which then rejects with its reason and gets no answer;
  // a call that reached its own bound is a timed-out `GhFailure` for every
  // requester waiting on it.
  /**
   * @param {readonly string[]} args
   * @param {AbortSignal} signal
   * @param {CallBounds} bounds
   * @returns {Promise<GhAnswer>}
   */
  request(args, signal, { boundMs, maxBufferBytes }) {
    const asked = includedArgs(args);
    return this.#outstanding.waitFor(
      JSON.stringify([asked, maxBufferBytes]),
      signal,
      (shared) => this.#spawned(asked, shared, maxBufferBytes),
      boundMs,
    );
  }

  // How many `gh` processes this owner still runs: one it ended is counted
  // until it is gone.
  get running() {
    return this.#running;
  }

  // Why nothing may be asked of GitHub now, when a rate limit's wait stands.
  /** @param {number} nowMs */
  heldBack(nowMs) {
    return this.#admission.heldBack(nowMs);
  }

  // One call `#outstanding` started: refused while a rate limit holds
  // requests back, otherwise run once it has a turn -- unless a limit met
  // while it waited holds it back then. Its bound runs from before its turn,
  // so waiting counts toward it; a call that ends while waiting never reaches
  // GitHub.
  async #spawned(args, signal, maxBufferBytes) {
    const refused = this.#admission.heldBack(Date.now());
    if (refused !== undefined) {
      return unasked(refused);
    }
    let turnEnds;
    try {
      turnEnds = await this.#admission.turn(signal);
    } catch {
      if (endedAtBound(signal)) {
        throw new GhFailure({ kind: "timed-out" });
      }
      return unasked({ kind: "failed" });
    }
    // A turn can pass to this call while every requester is being ended, as
    // when their owner closes: a call already ended is never run.
    if (signal.aborted) {
      turnEnds();
      return unasked({ kind: "failed" });
    }
    const heldBack = this.#admission.heldBack(Date.now());
    if (heldBack !== undefined) {
      turnEnds();
      return unasked(heldBack);
    }
    const askedAt = new Date().toISOString();
    this.#running += 1;
    return new Promise((resolve, reject) => {
      execFile(
        "gh",
        [...args],
        {
          signal,
          maxBuffer: maxBufferBytes,
          encoding: "utf8",
          env: { ...process.env, GH_PROMPT_DISABLED: "1" },
        },
        (error, stdout, stderr) => {
          this.#running -= 1;
          // However the call ended, admission learns of it before the turn
          // passes on, so a limit this answer starts holds back the request
          // that takes the turn next, and an ending without one reopens the
          // turns.
          if (signal.aborted) {
            this.#admission.endedUnanswered(askedAt);
            turnEnds();
            if (endedAtBound(signal)) {
              reject(new GhFailure({ kind: "timed-out" }));
              return;
            }
            // Ordinary departure or shutdown ended the call: not a retained
            // retryable failure, and not classified as an upstream answer.
            resolve(unasked({ kind: "failed" }, askedAt));
            return;
          }
          const answer = this.#admission.answered(
            readAnswer(error, stdout, stderr, askedAt),
            Date.now(),
          );
          if (answer.failure !== undefined) {
            this.#failed(answer);
          }
          turnEnds();
          resolve(answer);
        },
      );
    });
  }
}
