// @ts-check
// Published feedback review dates, the saved machine choice and the due
// check's observations. Launch records and attempts keep their existing owners.
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {Extract<import("../../../dashboard/src/feedbackReview.ts").FeedbackReview, { kind: "scheduled" }>} ScheduledReview */
/** @typedef {import("../../../dashboard/src/feedbackMaintenanceSetting.ts").FeedbackMaintenanceChoice} MaintenanceChoice */
/** @typedef {import("../../../dashboard/src/feedbackMaintenanceState.ts").MaintenanceObservation} MaintenanceObservation */
/** @typedef {import("../../../dashboard/src/feedbackMaintenanceDue.ts").MaintenanceSession} MaintenanceSession */
/** @typedef {import("../../../dashboard/src/feedbackMaintenanceDue.ts").ObservedMaintenanceSession} ObservedMaintenanceSession */
/** @template {object} Facts @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder */

/** @param {Pick<ScheduledReview, "reviewed" | "reviewAfter">} dates */
function reviewedFeedback(dates) {
  return {
    /** @returns {ScheduledReview} */
    please: () => ({ kind: "scheduled", ...dates }),
  };
}

// The published block's JSON payload, encoded from the scheduled review.
// The fence and surrounding document belong to the writing harness.
/** @param {ScheduledReview} review */
export function feedbackReviewPayload({ reviewed, reviewAfter }) {
  return { schemaVersion: 1, reviewed, reviewAfter };
}

export class MaintenanceSessionBuilder {
  /** @type {MaintenanceSession | undefined} */
  #session;

  /** @param {MaintenanceSession} session */
  with(session) {
    this.#session = { ...session };
    return this;
  }

  /** @param {string} at @returns {{ please(): ObservedMaintenanceSession }} */
  observedAt(at) {
    return { please: () => ({ ...this.please(), at }) };
  }

  /** @returns {MaintenanceSession} */
  please() {
    if (!this.#session) {
      throw new Error("state the maintenance session facts first");
    }
    return { ...this.#session };
  }
}

/**
 * @typedef {object} FeedbackMakeMe
 * @property {{ with: typeof reviewedFeedback }} aFeedbackReview
 * @property {FactBuilder<MaintenanceChoice>} aFeedbackMaintenanceChoice
 * @property {FactBuilder<MaintenanceObservation>} aMaintenanceObservation
 * @property {MaintenanceSessionBuilder} aMaintenanceSession
 */

/** @returns {PropertyDescriptorMap} */
export function feedbackMakeMeProperties() {
  return {
    aFeedbackReview: {
      enumerable: true,
      get() {
        return { with: reviewedFeedback };
      },
    },
    aFeedbackMaintenanceChoice: {
      enumerable: true,
      /** @returns {FactBuilder<MaintenanceChoice>} */
      get() {
        return { with: copyFacts };
      },
    },
    aMaintenanceObservation: {
      enumerable: true,
      /** @returns {FactBuilder<MaintenanceObservation>} */
      get() {
        return { with: copyFacts };
      },
    },
    aMaintenanceSession: {
      enumerable: true,
      get() {
        return new MaintenanceSessionBuilder();
      },
    },
  };
}
