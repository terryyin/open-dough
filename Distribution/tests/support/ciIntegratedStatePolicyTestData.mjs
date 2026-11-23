// @ts-check
// Integrated-state completion policy facts as a project declares them. Call
// sites state the facts; keep deliberately incomplete forms literal under
// proof.
import { copyFacts } from "./factBuilder.mjs";

/**
 * Integrated-state completion policy a project declares
 * (`ci-integrated-state-policy.mjs`).
 * @typedef {{
 *   check: string,
 *   context: string,
 *   jobs?: string[],
 * }} IntegratedStatePolicy
 */

/**
 * @typedef {object} CiIntegratedStatePolicyMakeMe
 * @property {import("./factBuilder.mjs").FactBuilder<IntegratedStatePolicy>} anIntegratedStatePolicy
 */

/** @returns {PropertyDescriptorMap} */
export function ciIntegratedStatePolicyMakeMeProperties() {
  return {
    anIntegratedStatePolicy: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
  };
}
