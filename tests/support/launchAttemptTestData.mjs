// @ts-check
// A launch request the dashboard accepted, as the machine's attempt store
// keeps it; a server's live answer about it is
// `./launchAttemptObservationTestData.mjs`. An attempt can precede any launch
// record: until it settles it holds only its incoming request and acceptance
// facts. A launched outcome names the session it launched by host and native
// ID; the kept launch itself is `./launchTestData.mjs`.

import { CompletionReportBuilder } from "./launchOutcomeTestData.mjs";
import { LaunchRequestBuilder } from "./launchRequestTestData.mjs";

/** @typedef {import("../../dashboard/src/launchOutcome.ts").LaunchAttemptRecord} LaunchAttemptRecord */
/** @typedef {import("../../dashboard/src/launchOutcome.ts").AttemptOutcome} AttemptOutcome */
/** @typedef {LaunchAttemptRecord["request"]} AgentLaunchRequest */
/** @typedef {Extract<AttemptOutcome, { kind: "launched" }>["session"]} LaunchedSession */
/** @typedef {Exclude<AttemptOutcome, { kind: "launched" }>} UnlaunchedOutcome */
/** @typedef {NonNullable<LaunchAttemptRecord["worker"]>} AttemptWorker */
/** @typedef {import("./launchRequestTestData.mjs").IncomingStoryFacts} IncomingStoryFacts */
/** @typedef {import("./launchRequestTestData.mjs").IncomingAdHocFacts} IncomingAdHocFacts */

// One accepted attempt. Choose its request; it is otherwise accepted at a
// fixed instant under a fixed ID, has published nothing, and has not settled.
// Nothing settles it but a stated outcome or completed report, and no
// settlement time is implied by either.
export class AcceptedAttemptBuilder {
  #id = "00000000-0000-4000-8000-00000000a771";
  /** @type {AgentLaunchRequest | undefined} */
  #request;
  #acceptedAt = "2026-01-01T00:00:00.000Z";
  /** @type {string | undefined} */
  #reportingOrigin;
  /** @type {Pick<LaunchAttemptRecord, "reporting" | "landingRepository">} */
  #landingReporting = {};
  /** @type {LaunchAttemptRecord["publication"]} */
  #publication = { kind: "none" };
  /** @type {AttemptWorker | undefined} */
  #worker;
  /** @type {string | undefined} */
  #slowSince;
  /** @type {AttemptOutcome | undefined} */
  #outcome;
  /** @type {string | undefined} */
  #settledAt;
  /** @type {string | undefined} */
  #reconciledAt;
  /** @type {LaunchAttemptRecord["completion"]} */
  #completion;

  /** @param {string} id a UUID */
  withId(id) {
    this.#id = id;
    return this;
  }

  /**
   * The exact incoming request the attempt keeps.
   * @param {AgentLaunchRequest} request
   */
  requesting(request) {
    this.#request = structuredClone(request);
    return this;
  }

  /**
   * An execution start of the story, in the `open-dough` project with
   * `claude` unless stated.
   * @param {IncomingStoryFacts} facts
   */
  executing(facts) {
    this.#request = new LaunchRequestBuilder().executing(facts).please();
    return this;
  }

  /**
   * A refinement start of the story, in the `open-dough` project with
   * `claude` unless stated.
   * @param {IncomingStoryFacts} facts
   */
  refining(facts) {
    this.#request = new LaunchRequestBuilder().refining(facts).please();
    return this;
  }

  /**
   * An ad hoc session start, in the `open-dough` project with `claude`
   * unless stated.
   * @param {IncomingAdHocFacts} [facts]
   */
  adHoc(facts = {}) {
    this.#request = new LaunchRequestBuilder().adHoc(facts).please();
    return this;
  }

  /** @param {string} at an ISO date-time */
  acceptedAt(at) {
    this.#acceptedAt = at;
    return this;
  }

  /**
   * The dashboard origin the attempt's session reports to.
   * @param {string} origin
   */
  reportingTo(origin) {
    this.#reportingOrigin = origin;
    return this;
  }

  // Whether the start published anything is not known.
  publicationUnknown() {
    this.#publication = { kind: "unknown" };
    return this;
  }

  /**
   * The start published its Take, at this revision when known.
   * @param {string} [revision]
   */
  published(revision) {
    this.#publication = {
      kind: "published",
      ...(revision !== undefined && { revision }),
    };
    return this;
  }

  /**
   * The process working on the start, as the machine noted it.
   * @param {AttemptWorker} worker
   */
  workedBy(worker) {
    this.#worker = { ...worker };
    return this;
  }

  /**
   * The start crossed its warning threshold at this time while running.
   * @param {string} at an ISO date-time
   */
  slowSince(at) {
    this.#slowSince = at;
    return this;
  }

  /**
   * The attempt launched this host's session.
   * @param {LaunchedSession} session
   */
  launched({ host, sessionId }) {
    this.#outcome = { kind: "launched", session: { host, sessionId } };
    return this;
  }

  /**
   * The attempt ended without a confirmed launch: refused, failed, or with a
   * session that may or may not have started.
   * @param {UnlaunchedOutcome} outcome
   */
  ended(outcome) {
    this.#outcome = { ...outcome };
    return this;
  }

  /**
   * When its outcome was recorded.
   * @param {string} at an ISO date-time
   */
  settledAt(at) {
    this.#settledAt = at;
    return this;
  }

  /**
   * When a page found the settled attempt reconciled with published state.
   * @param {string} at an ISO date-time
   */
  reconciledAt(at) {
    this.#reconciledAt = at;
    return this;
  }

  /**
   * Its session's final report, received at `at`, with the kept launch's
   * fixed receipt and reference.
   * @param {"completed" | "unfinished"} outcome
   * @param {string} at an ISO date-time
   * @param {string} [message] empty for a quiet report
   */
  reported(outcome, at, message = "") {
    this.#completion = new CompletionReportBuilder()
      .withOutcome(outcome)
      .saying(message)
      .receivedAt(at)
      .please();
    return this;
  }

  /** @param {Pick<LaunchAttemptRecord, "reporting" | "landingRepository">} facts */
  capturingLanding(facts) {
    this.#landingReporting = structuredClone(facts);
    return this;
  }

  /** @returns {LaunchAttemptRecord} */
  please() {
    if (!this.#request)
      throw new Error(
        "choose .requesting(...), .executing(...), .refining(...) or .adHoc(...) first",
      );
    return {
      id: this.#id,
      ...this.#landingReporting,
      ...(this.#reportingOrigin !== undefined && {
        reportingOrigin: this.#reportingOrigin,
      }),
      ...(this.#completion && { completion: { ...this.#completion } }),
      request: structuredClone(this.#request),
      acceptedAt: this.#acceptedAt,
      ...(this.#worker && { worker: { ...this.#worker } }),
      ...(this.#slowSince !== undefined && { slowSince: this.#slowSince }),
      publication: { ...this.#publication },
      ...(this.#outcome && { outcome: structuredClone(this.#outcome) }),
      ...(this.#settledAt !== undefined && { settledAt: this.#settledAt }),
      ...(this.#reconciledAt !== undefined && {
        reconciledAt: this.#reconciledAt,
      }),
    };
  }
}
