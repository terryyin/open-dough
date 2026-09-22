import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isFullGitRevision } from "./ci-revisions.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { classifyRevisionApplicability } from "./ci-path-applicability.mjs";

// States that, once recorded, are not reclassified on a later poll unless an
// exact attempt for that revision's own SHA appears (checked first, always).
// `not_required` joins the existing terminal verdicts here: its basis is a
// proved fact about the registered revision's own tree, not something a
// later poll needs to keep re-deriving.
const terminalRevisionStates = [
  "success",
  "failure",
  "incomplete",
  "not_required",
];

export const discoveryDelayBoundMs = 10 * 60 * 1000;
export const discoveryAdvisoryMarkerName = "discovery-advisory.json";

const revisionDirectory = (directory) => join(directory, "coverage");

function revisionPath(directory, sha) {
  if (!isFullGitRevision(sha))
    throw new Error("Expected a full Git revision SHA");
  return join(revisionDirectory(directory), `${sha.toLowerCase()}.json`);
}

export function registerPushedRevision(directory, sha) {
  const path = revisionPath(directory, sha);
  const normalized = sha.toLowerCase();
  mkdirSync(revisionDirectory(directory), { recursive: true, mode: 0o700 });
  if (!existsSync(path))
    publishJson(revisionDirectory(directory), `${normalized}.json`, {
      sha: normalized,
      state: "undiscovered",
    });
  return readRevisionCoverage(directory).find(
    (revision) => revision.sha === normalized,
  );
}

export function readRevisionCoverage(directory) {
  const coverage = revisionDirectory(directory);
  if (!existsSync(coverage)) return [];
  return readdirSync(coverage)
    .filter(
      (name) =>
        name.toLowerCase().endsWith(".json") &&
        isFullGitRevision(name.slice(0, -5)),
    )
    .sort()
    .map((name) => JSON.parse(readFileSync(join(coverage, name), "utf8")));
}

function preferredAttempt(attempts) {
  return (
    attempts.find(
      ({ status, conclusion }) =>
        status === "completed" && conclusion === "success",
    ) ??
    attempts.find(({ status }) => status !== "completed") ??
    attempts[0]
  );
}

function observedRevision(revision, attempt) {
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

function discoveryAdvisoryMarkerPath(directory) {
  return join(directory, discoveryAdvisoryMarkerName);
}

export function discoveryAdvisoryEmitted(directory) {
  return existsSync(discoveryAdvisoryMarkerPath(directory));
}

// Classifies one still-undiscovered revision's CI-path applicability against
// already-known candidate SHAs, and only pays for the broader (`gh`-backed)
// ancestor search when the narrow local candidates could not prove any
// ancestor at all. Never called for a revision that already has an exact
// attempt or an existing terminal verdict — see the call site below.
async function classifyUndiscoveredRevision({
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

export async function observeRevisionCoverage(
  directory,
  runs,
  request,
  observedAt = Date.now(),
  {
    repoDir = request.root,
    event = "push",
    workflowPath,
    discoverAncestorCandidates,
  } = {},
) {
  const events = [];
  const localCandidateShas = [
    ...new Set(
      runs
        .map(({ headSha }) => headSha?.toLowerCase())
        .filter((sha) => isFullGitRevision(sha)),
    ),
  ];
  let broadenedCandidateShas;
  const getBroadenedCandidateShas = discoverAncestorCandidates
    ? async () => {
        broadenedCandidateShas ??= (await discoverAncestorCandidates()) ?? [];
        return broadenedCandidateShas;
      }
    : undefined;

  for (const revision of readRevisionCoverage(directory)) {
    const matches = runs.filter(
      ({ headSha }) => headSha?.toLowerCase() === revision.sha,
    );
    const registeredAt = revision.registeredAt ?? observedAt;
    let next;
    const attempt = preferredAttempt(matches);
    if (attempt) {
      next = observedRevision({ ...revision, registeredAt }, attempt);
    } else if (terminalRevisionStates.includes(revision.state)) {
      next = revision;
    } else if (repoDir) {
      const classification = await classifyUndiscoveredRevision({
        repoDir,
        event,
        workflowPath,
        registeredSha: revision.sha,
        localCandidateShas,
        getBroadenedCandidateShas,
      });
      next =
        classification.result === "not_required"
          ? {
              sha: revision.sha,
              state: "not_required",
              basis: classification.basis,
              registeredAt,
            }
          : { sha: revision.sha, state: "undiscovered", registeredAt };
    } else {
      next = {
        sha: revision.sha,
        state: "undiscovered",
        registeredAt,
      };
    }
    publishJson(revisionDirectory(directory), `${revision.sha}.json`, next);
  }

  if (!discoveryAdvisoryEmitted(directory)) {
    const undiscovered = readRevisionCoverage(directory).filter(
      ({ state }) => state === "undiscovered",
    );
    const overdue = undiscovered.some(
      ({ registeredAt }) =>
        registeredAt !== undefined &&
        observedAt - registeredAt > discoveryDelayBoundMs,
    );
    if (overdue) {
      events.push({
        type: "CI_DISCOVERY_DELAYED",
        repo: request.repo,
        branch: request.branch,
        revisions: undiscovered.map(({ sha }) => sha).sort(),
      });
      publishJson(directory, discoveryAdvisoryMarkerName, { emitted: true });
    }
  }
  return events;
}
