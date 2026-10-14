// The mailbox's per-revision coverage records: one JSON file per registered
// revision, written by observation (ci-mailbox-revision-coverage.mjs) and read
// by completion and shutdown.
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isFullGitRevision } from "./ci-revisions.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { candidateLookupUnavailable } from "./ci-integrated-state.mjs";

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

function revisionRecordNames(directory) {
  const coverage = revisionDirectory(directory);
  if (!existsSync(coverage)) return [];
  return readdirSync(coverage)
    .filter(
      (name) =>
        name.toLowerCase().endsWith(".json") &&
        isFullGitRevision(name.slice(0, -5)),
    )
    .sort();
}

// Registered SHAs from record names alone, cheap enough to check often.
export function listRegisteredRevisions(directory) {
  return revisionRecordNames(directory).map((name) => name.slice(0, -5));
}

export function readRevisionCoverage(directory) {
  const coverage = revisionDirectory(directory);
  return revisionRecordNames(directory).map((name) =>
    JSON.parse(readFileSync(join(coverage, name), "utf8")),
  );
}

// Replaces `record`, keyed by its own normalized SHA.
export function publishRevisionRecord(directory, record) {
  publishJson(revisionDirectory(directory), `${record.sha}.json`, record);
}

// A poll that could not list runs leaves no current integrated-state evidence:
// each recorded judgement stays unresolved until a later poll judges afresh.
export function withdrawIntegratedState(directory, error) {
  for (const revision of readRevisionCoverage(directory))
    if (revision.integrated)
      publishRevisionRecord(directory, {
        ...revision,
        integrated: candidateLookupUnavailable(
          revision.integrated.policy,
          error,
        ),
      });
}
