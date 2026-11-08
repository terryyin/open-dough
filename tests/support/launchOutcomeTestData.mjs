// @ts-check
// What a kept launch records after it started, as the dashboard's machine
// store holds it: its final report, its landing and its Done mark, each with
// fixed receipts and references (`./launchTestData.mjs`).

/** @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */

/**
 * The facts a builder states: the report's outcome and message, the revision
 * the work landed at, and when the developer marked the session Done.
 * @typedef {{
 *   completion?: Pick<NonNullable<LaunchRecord["completion"]>, "outcome" | "message">,
 *   landedRevision?: string,
 *   doneAt?: string,
 * }} LaunchOutcome
 */

/**
 * The record fields of `outcome`, received at `at`.
 * @param {LaunchOutcome} outcome
 * @param {string} at an ISO date-time
 */
export function launchOutcomeFacts({ completion, landedRevision, doneAt }, at) {
  return {
    ...(completion && {
      completion: {
        receipt: "11111111-1111-4111-8111-111111111111",
        reference: "22222222-2222-4222-8222-222222222222",
        outcome: completion.outcome,
        message: completion.message,
        receivedAt: at,
      },
    }),
    ...(landedRevision && {
      landing: {
        repository: "open-dough",
        remote: "origin",
        target: "refs/heads/main",
        reference: "22222222-2222-4222-8222-222222222222",
        delivery: "33333333-3333-4333-8333-333333333333",
        receipt: "44444444-4444-4444-8444-444444444444",
        base: "c3".repeat(20),
        revision: landedRevision,
        receivedAt: at,
      },
    }),
    ...(doneAt !== undefined && { doneAt }),
  };
}
