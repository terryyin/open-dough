// @ts-check
// A launch's landing as each boundary holds it, around one comparison: the
// launch it lands for (its reporting reference and, for a story, its
// identity), the trunk it lands on, and the base and revision Git accepted.
// The dashboard prepares the context a publication reads
// (`LandingContextBuilder`); a publication submits the comparison
// (`LandingSubmissionBuilder`); the dashboard answers with a receipt
// (`LandingReceiptBuilder`) and keeps the evidence on the launch, beside the
// repository authority it captures from (`./launchLandingEvidenceTestData.mjs`).

/** @typedef {import("../../dashboard/src/launchLanding.ts").LaunchLanding} LaunchLanding */
/** @typedef {import("../../dashboard/src/launchLanding.ts").LandingReceipt} LandingReceipt */
/** @typedef {import("../../dashboard/server/launchLandingAdmission.ts").LandingSubmission} LandingSubmission */

/**
 * The launch a landing is for and the trunk it lands on.
 * @typedef {Pick<LaunchLanding, "reference" | "identity" | "remote" | "target">} LandingFor
 */

/**
 * The Git comparison a landing keeps: the trunk it was based on and the
 * revision trunk accepted.
 * @typedef {Pick<LaunchLanding, "base" | "revision">} Comparison
 */

/**
 * The context the dashboard prepares for a launch that may land: where to
 * report, the launch, and its trunk target. It names no comparison yet.
 * @typedef {{ origin: string } & Pick<LandingSubmission, "source" | "host"> & LandingFor} LandingContext
 */

// The launch's reporting reference, named by its completion and its landing.
export const reportingReference = "22222222-2222-4222-8222-222222222222";

// When the dashboard received a report or landing, unless the case states it.
export const fixedReceivedAt = "2026-10-01T10:00:00.000Z";

// The delivery that carries the landing and the receipt the dashboard gives it.
export const landingDelivery = "33333333-3333-4333-8333-333333333333";
export const landingReceipt = "44444444-4444-4444-8444-444444444444";

/** @type {Required<Pick<LandingFor, "reference" | "remote" | "target">>} */
export const mainOfOrigin = {
  remote: "origin",
  target: "refs/heads/main",
  reference: reportingReference,
};

// The context a dashboard prepared for a `claude` launch of `open-dough`
// with the fixed reporting reference, landing on `origin`'s `main` and
// naming no story, unless the case states otherwise. Its reporting origin is
// always stated: it is the receiver the case runs.
export class LandingContextBuilder {
  /** @type {Omit<LandingContext, "origin"> & { origin?: string }} */
  #context = { source: "open-dough", host: "claude", ...mainOfOrigin };

  /** @param {string} origin the dashboard that receives the landing */
  reportingTo(origin) {
    this.#context = { ...this.#context, origin };
    return this;
  }

  /** @param {string} identity the story the launch is for */
  namingStory(identity) {
    this.#context = { ...this.#context, identity };
    return this;
  }

  /** @param {string} target the trunk branch ref, such as `refs/heads/master` */
  landingOn(target) {
    this.#context = { ...this.#context, target };
    return this;
  }

  /** @returns {LandingContext} */
  please() {
    const { origin, ...context } = this.#context;
    if (origin === undefined) throw new Error("state .reportingTo(origin)");
    return { origin, ...context };
  }
}

// A publication's submission of the comparison it landed for a `claude`
// launch of `open-dough` with the fixed reporting reference onto `origin`'s
// `main`, naming no story, under a fixed delivery, unless the case states
// otherwise. The comparison is always stated.
export class LandingSubmissionBuilder {
  /** @type {Omit<LandingSubmission, "base" | "revision"> & Partial<Comparison>} */
  #submission = {
    delivery: landingDelivery,
    source: "open-dough",
    host: "claude",
    ...mainOfOrigin,
  };

  /**
   * The launch it lands for: its host, its reporting reference and, for a
   * story, its identity.
   * @param {Partial<Pick<LandingSubmission, "host" | "reference" | "identity">>} launch
   */
  forLaunch(launch) {
    this.#submission = { ...this.#submission, ...launch };
    return this;
  }

  /** @param {Comparison} comparison */
  comparing({ base, revision }) {
    this.#submission = { ...this.#submission, base, revision };
    return this;
  }

  /**
   * Carried by this delivery, as a publication reporting the same landing
   * again carries it.
   * @param {string} delivery
   */
  inDelivery(delivery) {
    this.#submission = { ...this.#submission, delivery };
    return this;
  }

  /** @returns {LandingSubmission} */
  please() {
    const { base, revision, ...submission } = this.#submission;
    if (base === undefined || revision === undefined)
      throw new Error("state .comparing({ base, revision })");
    return { ...submission, base, revision };
  }
}

// The dashboard's receipt for a landing submission: the submission's launch,
// target, delivery and comparison, `recorded` under a fixed receipt at a fixed
// instant unless the case states otherwise.
export class LandingReceiptBuilder {
  /** @type {Omit<LandingReceipt, keyof LandingSubmission>} */
  #answer = {
    receipt: landingReceipt,
    receivedAt: fixedReceivedAt,
    state: "recorded",
  };
  /** @type {LandingSubmission | undefined} */
  #submission;

  /** @param {LandingSubmission} submission the submission received */
  answering(submission) {
    this.#submission = submission;
    return this;
  }

  /** @param {string} receipt the receipt the dashboard gave this landing */
  underReceipt(receipt) {
    this.#answer = { ...this.#answer, receipt };
    return this;
  }

  /** @param {LandingReceipt["state"]} state */
  inState(state) {
    this.#answer = { ...this.#answer, state };
    return this;
  }

  /** @returns {LandingReceipt} */
  please() {
    const submission = this.#submission;
    if (submission === undefined) throw new Error("state .answering(...)");
    const { reference, identity, remote, target, delivery, base, revision } =
      submission;
    return {
      ...(identity !== undefined && { identity }),
      remote,
      target,
      reference,
      delivery,
      base,
      revision,
      ...this.#answer,
    };
  }
}
