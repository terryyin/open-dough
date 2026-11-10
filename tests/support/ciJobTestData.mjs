// @ts-check
// Shared GitHub Actions attempt-job construction for MakeMe: facts as
// `attemptJobs` / ReportedAttemptJob read them. Encode through `apiJob` at
// the transport boundary; `databaseId` becomes API `id`. Do not map an
// observed `url` field — that is not GitHub's `html_url`.

/** @typedef {import("../../dashboard/server/ciTimeWithoutRunnerWaits.ts").ReportedAttemptJob} ReportedAttemptJob */

/**
 * @typedef {ReportedAttemptJob & {
 *   id?: number;
 *   databaseId?: number;
 *   created_at?: unknown;
 *   status?: unknown;
 *   html_url?: unknown;
 *   steps?: unknown;
 *   [key: string]: unknown;
 * }} GitHubAttemptJobFacts
 */

/**
 * @param {Record<string, unknown>} fields
 * @returns {Record<string, unknown>}
 */
const present = (fields) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );

export class GitHubJobBuilder {
  /**
   * Named job facts only: no invented identity or timing bounds.
   *
   * @param {GitHubAttemptJobFacts} facts
   */
  withFacts(facts) {
    return {
      /** @returns {GitHubAttemptJobFacts} */
      please: () => present({ ...facts }),
    };
  }
}
