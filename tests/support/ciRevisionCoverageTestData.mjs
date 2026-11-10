// @ts-check
// Stored revision-coverage construction for MakeMe. The authority is
// `src/skills/dough-execute-plan/scripts/ci-mailbox-revision-records.mjs`.
// Builders arrange starting records for judgment or the real JSON publication
// seam; they do not invent observed outputs or completion receipts.
import { copyFacts } from "./factBuilder.mjs";

/**
 * One stored revision-coverage record as the mailbox holds it.
 * State facts that drive the case at the call site; keep independently
 * written validated/unresolved expectations outside this builder.
 * @typedef {{
 *   sha: string,
 *   state:
 *     | "undiscovered"
 *     | "pending"
 *     | "success"
 *     | "failure"
 *     | "incomplete"
 *     | "not_required",
 *   registeredAt?: number,
 *   observedAt?: number,
 *   checkedBy?: { runId: string | number, attemptId: string | number },
 *   basis?: { sha: string, state?: string },
 *   queue?: object,
 *   integrated?: object,
 * }} RevisionCoverageRecord
 */

/**
 * Stated coverage-record facts exactly, preserving omitted optionals.
 * @returns {import("./factBuilder.mjs").FactBuilder<RevisionCoverageRecord>}
 */
export function aRevisionCoverage() {
  return { with: copyFacts };
}
