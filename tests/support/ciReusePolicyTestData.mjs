// @ts-check
// Reuse-policy and reuse-attempt facts as `reusableValidation` /
// `readGitHubReuseFacts` consume them. Call sites state identity, context,
// age and outcome; keep deliberately incomplete or contradicted fields
// literal under proof. Encoding and mailbox registration stay in the harness.
import { copyFacts } from "./factBuilder.mjs";

/**
 * Provider-owned reuse policy at the scheduling boundary
 * (`src/skills/dough-execute-plan/scripts/ci-reuse-policy.mjs`).
 * @typedef {{
 *   repo: string,
 *   workflow: string,
 *   unit: string,
 *   configuration: string,
 *   context: string,
 *   targetRef: string,
 *   refs: string[],
 *   events: string[],
 *   maxAgeMs: number,
 * }} CiReusePolicy
 */

/**
 * One current attempt fact a reuse query lists for a revision under a policy.
 * Optional fields stay absent when the case omits them; keep malformed or
 * contradicted forms literal at the call site.
 * @typedef {{
 *   repo: string,
 *   workflow: string,
 *   unit: string,
 *   configuration: string,
 *   context: string,
 *   targetRef?: string,
 *   refs?: string[],
 *   events?: string[],
 *   maxAgeMs?: number,
 *   sha: string,
 *   ref: string,
 *   event: string,
 *   runId: string,
 *   attemptId: string,
 *   url?: string,
 *   current?: boolean,
 *   order?: number,
 *   outcome?: string,
 *   direct?: boolean,
 *   validatedAt?: number,
 *   validUntil?: number,
 * }} CiReuseAttempt
 */

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
 * History-read answer for one GitHub run's first attempt (`answeredRun`).
 * @typedef {{
 *   runUrl: string,
 *   runId: number,
 *   runAttempt: number,
 * }} AnsweredCiRun
 */

/**
 * @returns {import("./factBuilder.mjs").FactBuilder<CiReusePolicy>}
 */
export function aCiReusePolicy() {
  return { with: copyFacts };
}

/**
 * @returns {import("./factBuilder.mjs").FactBuilder<CiReuseAttempt>}
 */
export function aCiReuseAttempt() {
  return { with: copyFacts };
}

/**
 * @returns {import("./factBuilder.mjs").FactBuilder<IntegratedStatePolicy>}
 */
export function anIntegratedStatePolicy() {
  return { with: copyFacts };
}

/**
 * @returns {import("./factBuilder.mjs").FactBuilder<AnsweredCiRun>}
 */
export function anAnsweredCiRun() {
  return { with: copyFacts };
}

/**
 * @typedef {object} CiReusePolicyMakeMe
 * @property {import("./factBuilder.mjs").FactBuilder<CiReusePolicy>} aCiReusePolicy
 * @property {import("./factBuilder.mjs").FactBuilder<CiReuseAttempt>} aCiReuseAttempt
 * @property {import("./factBuilder.mjs").FactBuilder<IntegratedStatePolicy>} anIntegratedStatePolicy
 * @property {import("./factBuilder.mjs").FactBuilder<AnsweredCiRun>} anAnsweredCiRun
 */

/** @returns {PropertyDescriptorMap} */
export function ciReusePolicyMakeMeProperties() {
  return {
    aCiReusePolicy: {
      enumerable: true,
      get() {
        return aCiReusePolicy();
      },
    },
    aCiReuseAttempt: {
      enumerable: true,
      get() {
        return aCiReuseAttempt();
      },
    },
    anIntegratedStatePolicy: {
      enumerable: true,
      get() {
        return anIntegratedStatePolicy();
      },
    },
    anAnsweredCiRun: {
      enumerable: true,
      get() {
        return anAnsweredCiRun();
      },
    },
  };
}
