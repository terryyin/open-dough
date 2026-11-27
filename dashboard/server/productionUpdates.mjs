// Pending production updates are always compared with the last successfully
// activated commit. Rejection and failed preparation/start leave that baseline
// intact; only a completed activation advances it.
import { qualifyPublishedRange } from "./productionQualification.mjs";

/**
 * @typedef {import("./productionDeployment.mjs").PublishedCommit} PublishedCommit
 * @typedef {(range: {baseline: PublishedCommit, selected: PublishedCommit, signal?: AbortSignal}) => Promise<{qualifies: boolean}>} QualifyRange
 */

/**
 * @param {{developmentRoot: string, baseline: PublishedCommit, inspectionsRoot?: string, env?: NodeJS.ProcessEnv}} options
 */
export function publishedUpdates(options) {
  return updateSelection(options.baseline, (range) =>
    qualifyPublishedRange({ ...options, ...range }),
  );
}

/**
 * Selection state over a published range qualification.
 * @param {PublishedCommit} initial @param {QualifyRange} qualify
 */
export function updateSelection(initial, qualify) {
  let baseline = initial;
  // Only a successfully inspected excluded range can be quiet on later checks.
  let excludedRange;
  return {
    get baseline() {
      return baseline;
    },
    /**
     * @param {PublishedCommit} selected
     * @param {AbortSignal} [signal]
     */
    async select(selected, signal) {
      if (selected.commit === baseline.commit) return "unchanged";
      const range = `${baseline.commit}..${selected.commit}`;
      if (range === excludedRange) return "already-excluded";
      const { qualifies } = await qualify({
        baseline,
        selected,
        ...(signal ? { signal } : {}),
      });
      if (qualifies) return "candidate";
      excludedRange = range;
      return "excluded";
    },
    // The serving owner reports this event only after preview startup succeeds.
    /** @param {PublishedCommit} selected */
    activated(selected) {
      baseline = selected;
    },
  };
}
