// @ts-check
// Shared GitHub Actions run construction for MakeMe: observed-run facts as
// `observedRun` / `apiRun` use them, and ListedRun projection for revision
// judgment. Adapter attempts stay a distinct ListedRun field.

/** Observed GitHub Actions run facts: the Actions listing answer shape. */
/** @typedef {import("../../dashboard/tests/support/baseCiActions.ts").CiRunAnswer} ObservedCiRun */
/** @typedef {import("../../dashboard/server/baseCiNearest.ts").ListedRun} ListedRun */

const incidentalCreatedAt = "2026-11-09T00:00:00.000Z";

const revisionTimingDefaults = {
  createdAt: incidentalCreatedAt,
  startedAt: "2026-11-09T00:00:00Z",
  completedAt: "2026-11-09T00:04:00Z",
};

/**
 * @param {object} fields
 * @returns {object}
 */
const present = (fields) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );

/**
 * @param {unknown} value
 * @returns {ObservedCiRun}
 */
const asObserved = (value) => /** @type {ObservedCiRun} */ (value);

/**
 * Shared GitHub run facts: named call-site facts win; incidental defaults do
 * not invent identity or wall-time bounds. Attempt 1 wall time prefers
 * `createdAt`; when a case states `startedAt` without `createdAt`, align
 * creation so that fact is not shadowed by an incidental or revision default.
 *
 * @param {Record<string, unknown>} [facts]
 * @param {Record<string, unknown>} [defaults]
 * @returns {ObservedCiRun}
 */
export function githubCiRunFacts(facts = {}, defaults = {}) {
  const { id, databaseId: statedId, ...rest } = facts;
  const databaseId = statedId ?? id;
  const status = rest.status ?? defaults.status ?? "completed";
  const conclusion =
    "conclusion" in rest
      ? rest.conclusion
      : "conclusion" in defaults
        ? defaults.conclusion
        : status === "completed"
          ? "success"
          : null;
  const aligned =
    rest.startedAt !== undefined && rest.createdAt === undefined
      ? { ...rest, createdAt: rest.startedAt }
      : rest;
  return asObserved(
    present({
      attempt: 1,
      event: "push",
      createdAt: incidentalCreatedAt,
      ...defaults,
      ...aligned,
      status,
      conclusion,
      ...(databaseId === undefined ? {} : { databaseId, id: databaseId }),
    }),
  );
}

/**
 * Encode-ready observed run from a builder result or legacy `id` answer,
 * applying only listing-route and unconverted-literal gaps through the same
 * GitHub fact owner as MakeMe builders.
 *
 * @param {ObservedCiRun | { id?: number; databaseId?: number; headSha?: string; [key: string]: unknown }} run
 * @param {string} branch
 * @param {number} index
 * @returns {ObservedCiRun}
 */
export function observedRunForApi(run, branch, index) {
  const databaseId = run.databaseId ?? run.id ?? index + 1;
  return githubCiRunFacts({
    ...run,
    databaseId,
    headBranch: run.headBranch ?? branch,
    url: run.url ?? `https://ci.invalid/${String(databaseId)}`,
    createdAt:
      run.createdAt ?? `2026-10-01T00:${String(index).padStart(2, "0")}:00Z`,
  });
}

export class CiRunBuilder {
  /** @param {Partial<ObservedCiRun> & Pick<ObservedCiRun, "headSha"> & { id?: number }} facts */
  with(facts) {
    return {
      /** @returns {ObservedCiRun} */
      please: () => githubCiRunFacts(facts),
    };
  }
}

export class RevisionCiRunBuilder {
  /**
   * ListedRun projection: shared GitHub facts plus optional `branch` /
   * `adapterAttempt`. Timing defaults match prior comparison construction;
   * `githubCiRunFacts` owns createdAt↔startedAt alignment when creation is
   * omitted.
   *
   * @param {ListedRun & { id?: number }} facts
   */
  with(facts) {
    return {
      /** @returns {ListedRun} */
      please: () => {
        const { adapterAttempt, branch, ...github } = facts;
        return /** @type {ListedRun} */ (
          present({
            ...githubCiRunFacts(github, revisionTimingDefaults),
            ...(branch === undefined ? {} : { branch }),
            ...(adapterAttempt === undefined ? {} : { adapterAttempt }),
          })
        );
      },
    };
  }
}
