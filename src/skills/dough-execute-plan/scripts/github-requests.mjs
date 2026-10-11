// Every Open Dough request to GitHub: one `gh api` call run with GitHub's
// status line and headers included, read once
// (`./github-request-answer.mjs`) -- a rate limit and the wait GitHub
// directed, whichever request met it -- one call shared by every requester
// asking it while it is outstanding (`./github-request-outstanding.mjs`),
// admitted once for all of them (`./github-request-admission.mjs`) and taking
// one of the process's turns at GitHub. Each call has a fixed argument
// array -- never a shell string. What a caller may ask, what it keeps of an
// answer, and how it reports one stay with the caller.

import { execFile } from "node:child_process";
import { ReadAdmission } from "./github-request-admission.mjs";
import { GhFailure, readAnswer } from "./github-request-answer.mjs";
import {
  OutstandingReads,
  ReadBoundReached,
} from "./github-request-outstanding.mjs";

/** @import { GhAnswer, GhRequestFailure } from "./github-request-answer.mjs" */

// One failed call, told once to the owner of these requests: why, when the
// call started and -- once asked of GitHub -- when, and with what answer.
/**
 * @typedef {{
 *   readonly cause: GhRequestFailure["kind"];
 *   readonly startedAtMs: number;
 *   readonly askedAt?: string;
 *   readonly answer?: GhAnswer;
 * }} FailedGhRequest
 */

// Every call asks for GitHub's status line and headers (`--include`), right
// after `api`, so a refusal's status and direction are read here whatever
// was asked.
function includedArgs(args) {
  return args[0] === "api" ? ["api", "--include", ...args.slice(1)] : args;
}

// An answer that never came from GitHub: held back, or -- `failed` -- for a
// call no requester waits on any more, whether waiting its turn or already
// asked.
function unasked(failure, askedAt = new Date().toISOString()) {
  return { status: undefined, headers: new Map(), body: "", failure, askedAt };
}

// The shared call's own bound (`ReadBoundReached`) or a waiter's own bound
// ended it -- not ordinary departure or shutdown.
function endedAtBound(signal) {
  return (
    signal.reason instanceof ReadBoundReached ||
    (signal.reason instanceof GhFailure &&
      signal.reason.reason.kind === "timed-out")
  );
}

export class GitHubRequests {
  // Every `gh` call still outstanding in this process, keyed by its argument
  // array: the question asked of GitHub, any conditional hint included.
  // Requesters asking it while it is outstanding wait on that one call,
  // which ends once none of them waits, at its own bound, or -- by ending
  // every requester waiting on it -- when their owner closes. No settled
  // answer is kept here.
  #outstanding;

  // Whether this process may ask GitHub now, and its turns at GitHub. Every
  // call `#outstanding` starts is admitted here once, for all the requesters
  // waiting on it, and takes one turn however many wait on it.
  #admission;

  #failed;

  #maxBufferBytes;

  // `boundMs` is how long one `gh` call may run from its start however many
  // requesters wait on it; `backoffBaseMs`, how long this process first waits
  // after a rate limit that directs no wait, doubling while the limit
  // continues. `failed` hears of each failed call once, including a bound
  // that ends it; held-back and ordinary requester departures are not told.
  // `maxBufferBytes` is the most one answer may print before its call fails.
  /**
   * @param {{
   *   readonly boundMs: number;
   *   readonly backoffBaseMs: number;
   *   readonly failed?: (request: FailedGhRequest) => void;
   *   readonly maxBufferBytes?: number;
   * }} options
   */
  constructor({
    boundMs,
    backoffBaseMs,
    failed = () => undefined,
    maxBufferBytes = 1024 * 1024,
  }) {
    this.#outstanding = new OutstandingReads(boundMs);
    this.#admission = new ReadAdmission(backoffBaseMs);
    this.#failed = failed;
    this.#maxBufferBytes = maxBufferBytes;
  }

  // One `gh api` answer, settled whatever its exit: `--include` makes `gh`
  // print GitHub's status line on stdout even when it exits non-zero, so a
  // caller can decide from that status before treating the exit as a
  // failure. `signal` ends only this requester's wait, which then rejects
  // with its reason and gets no answer; a call that reached its own bound is
  // a timed-out `GhFailure` for every requester waiting on it.
  /**
   * @param {readonly string[]} args
   * @param {AbortSignal} signal
   * @returns {Promise<GhAnswer>}
   */
  request(args, signal) {
    const asked = includedArgs(args);
    return this.#outstanding.waitFor(JSON.stringify(asked), signal, (shared) =>
      this.#spawned(asked, shared),
    );
  }

  // One call `#outstanding` started: refused while a rate limit holds
  // requests back, otherwise run once it has a turn -- unless a limit met
  // while it waited holds it back then. Its bound runs from before its turn,
  // so waiting counts toward it; a call that ends while waiting never reaches
  // GitHub.
  async #spawned(args, signal) {
    const startedAtMs = Date.now();
    const refused = this.#admission.heldBack(Date.now());
    if (refused !== undefined) {
      return unasked(refused);
    }
    let turnEnds;
    try {
      turnEnds = await this.#admission.turn(signal);
    } catch {
      if (endedAtBound(signal)) {
        this.#failed({ cause: "timed-out", startedAtMs });
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
    return new Promise((resolve, reject) => {
      execFile(
        "gh",
        [...args],
        {
          signal,
          maxBuffer: this.#maxBufferBytes,
          encoding: "utf8",
          env: { ...process.env, GH_PROMPT_DISABLED: "1" },
        },
        (error, stdout, stderr) => {
          // However the call ended, admission learns of it before the turn
          // passes on, so a limit this answer starts holds back the request
          // that takes the turn next, and an ending without one reopens the
          // turns.
          if (signal.aborted) {
            this.#admission.endedUnanswered(askedAt);
            turnEnds();
            if (endedAtBound(signal)) {
              this.#failed({ cause: "timed-out", startedAtMs, askedAt });
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
            this.#failed({
              cause: answer.failure.kind,
              startedAtMs,
              askedAt,
              answer,
            });
          }
          turnEnds();
          resolve(answer);
        },
      );
    });
  }
}
