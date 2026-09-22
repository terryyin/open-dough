import { classifyRevisionApplicability } from "./ci-path-applicability.mjs";

// Per-poll helpers that turn one revision's matching GitHub runs, or its
// CI-path applicability, into a coverage verdict. Used only by
// ci-mailbox-revision-coverage.mjs's observeRevisionCoverage; kept separate
// so that file stays focused on the coverage ledger and its public API.

export function preferredAttempt(attempts) {
  return (
    attempts.find(
      ({ status, conclusion }) =>
        status === "completed" && conclusion === "success",
    ) ??
    attempts.find(({ status }) => status !== "completed") ??
    attempts[0]
  );
}

export function observedRevision(revision, attempt) {
  let state = "failure";
  if (attempt.status !== "completed") state = "pending";
  else if (attempt.conclusion === "success") state = "success";
  else if (attempt.conclusion === "cancelled") state = "incomplete";
  return {
    sha: revision.sha,
    state,
    checkedBy: { runId: attempt.databaseId, attemptId: attempt.attempt },
    registeredAt: revision.registeredAt,
  };
}

// Classifies one still-undiscovered revision's CI-path applicability against
// already-known candidate SHAs, and only pays for the broader (`gh`-backed)
// ancestor search when the narrow local candidates could not prove any
// ancestor at all. Never called for a revision that already has an exact
// attempt or an existing terminal verdict — see the call site in
// ci-mailbox-revision-coverage.mjs.
export async function classifyUndiscoveredRevision({
  repoDir,
  event,
  workflowPath,
  registeredSha,
  localCandidateShas,
  getBroadenedCandidateShas,
}) {
  let classification = classifyRevisionApplicability({
    repoDir,
    event,
    workflowPath,
    registeredSha,
    candidateShas: localCandidateShas,
  });
  if (
    classification.result === "indeterminate" &&
    classification.reason === "no-ancestor-basis" &&
    getBroadenedCandidateShas
  ) {
    const broadened = await getBroadenedCandidateShas();
    if (broadened.length) {
      classification = classifyRevisionApplicability({
        repoDir,
        event,
        workflowPath,
        registeredSha,
        candidateShas: [...new Set([...localCandidateShas, ...broadened])],
      });
    }
  }
  return classification;
}

// Resolves a `not_required` revision's basis SHA to its actual GitHub run
// object: the ancestor A is ordinary branch history, usually never
// registered in this mailbox itself, so its eventual failure/pending state
// must be looked up rather than read off any registered revision. Checks
// this poll's already-known `runs` first, then falls back to the same
// broadened (bounded-history) candidate list used for classification.
export async function findAncestorRun({
  sha,
  runs,
  getBroadenedCandidateRuns,
}) {
  const local = runs.find((run) => run.headSha?.toLowerCase() === sha);
  if (local) return local;
  if (!getBroadenedCandidateRuns) return undefined;
  return (await getBroadenedCandidateRuns()).find(
    (run) => run.headSha?.toLowerCase() === sha,
  );
}
