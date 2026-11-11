// Pending production updates are always compared with the last successfully
// activated commit. Rejection and failed preparation/start leave that baseline
// intact; only a completed activation advances it.
import { qualifyPublishedRange } from "./productionQualification.mjs";

/**
 * @param {{developmentRoot: string, baseline: import("./productionDeployment.mjs").PublishedCommit, inspectionsRoot?: string, env?: NodeJS.ProcessEnv}} options
 */
export function publishedUpdates(options) {
  let baseline = options.baseline;
  // Only a successfully inspected excluded range can be quiet on later checks.
  let excludedRange;
  return {
    get baseline() {
      return baseline;
    },
    /**
     * @param {import("./productionDeployment.mjs").PublishedCommit} selected
     * @param {AbortSignal} [signal]
     */
    async select(selected, signal) {
      if (selected.commit === baseline.commit) return "unchanged";
      const range = `${baseline.commit}..${selected.commit}`;
      if (range === excludedRange) return "already-excluded";
      const { qualifies } = await qualifyPublishedRange({
        ...options,
        baseline,
        selected,
        ...(signal ? { signal } : {}),
      });
      if (qualifies) return "candidate";
      excludedRange = range;
      return "excluded";
    },
    // The serving owner reports this event only after preview startup succeeds.
    /** @param {import("./productionDeployment.mjs").PublishedCommit} selected */
    activated(selected) {
      baseline = selected;
    },
  };
}
