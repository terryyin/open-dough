#!/usr/bin/env node
// A test-owned custom CI provider. Run as `<journal> <job>`, it schedules a
// target attempt, runs its covered command and records it in the journal;
// `customAdapterResponse` answers the project's command-adapter discovery and
// diagnosis from that journal.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Empty until the first attempt is scheduled; every write is atomic.
function journal(path) {
  return existsSync(path)
    ? JSON.parse(readFileSync(path, "utf8"))
    : { entries: [], sequence: 0 };
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const pending = `${path}.${process.pid}.tmp`;
  writeFileSync(pending, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(pending, path);
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    encoding: "utf8",
    timeout: 120000,
    maxBuffer: 16 * 1024,
  });
  return { success: !result.error && result.status === 0 };
}

// Schedules `job`'s target attempt and runs its covered command.
export function scheduleTargetAttempt(statePath, job) {
  const state = journal(statePath);
  const order = state.sequence + 1; // creation sequence, never an ID comparison
  const report = resolve(`${statePath}.reports`, `${order}.json`);
  const attempt = {
    runId: job.runId,
    attemptId: job.attemptId,
    sha: job.sha,
    outcome: "pending",
    url: pathToFileURL(report).href,
    time: new Date().toISOString(),
  };
  const fact = { event: job.event, order };
  const entries = [
    ...state.entries,
    {
      kind: "target",
      repo: job.repo,
      workflow: job.workflow,
      branch: job.ref,
      attempt,
      fact,
    },
  ];
  // Readers see the new unresolved attempt before covered execution starts.
  writeJson(statePath, { sequence: order, entries });
  const covered = run(job.covered);
  Object.assign(attempt, {
    outcome: covered.success ? "success" : "failure",
    time: new Date().toISOString(),
  });
  writeJson(report, { target: attempt, covered });
  writeJson(statePath, { sequence: order, entries });
  return { attempt };
}

// Target `entries` as discovered attempts, newest first, each naming its own
// target branch, check and context.
export function discoveredAttempts(entries) {
  return [...entries]
    .sort((left, right) => right.fact.order - left.fact.order)
    .map(({ attempt, branch, workflow, fact }) => ({
      ...attempt,
      branch,
      check: workflow,
      context: fact.event,
    }));
}

export function customAdapterResponse(statePath, request) {
  const entries = journal(statePath).entries.filter(
    (entry) =>
      entry.kind === "target" &&
      entry.repo === request.check.repo &&
      entry.branch === request.check.branch,
  );
  if (request.operation === "discover") {
    // The provider owns the current aggregate for each SHA: an earlier green
    // never shows beside its pending or failed replacement.
    const current = new Map();
    for (const entry of entries) {
      const previous = current.get(entry.attempt.sha);
      if (!previous || entry.fact.order > previous.fact.order)
        current.set(entry.attempt.sha, entry);
    }
    return { attempts: discoveredAttempts(current.values()) };
  }
  if (request.operation !== "diagnose") throw Error("unsupported operation");
  const entry = entries.find(
    ({ attempt }) =>
      attempt.runId === request.attempt.runId &&
      attempt.attemptId === request.attempt.attemptId &&
      attempt.sha === request.attempt.sha,
  );
  if (!entry) return { unavailable: "provider has no matching target attempt" };
  const report = JSON.parse(readFileSync(new URL(entry.attempt.url), "utf8"));
  return {
    excerpt: `Covered check: ${report.covered.success ? "success" : "failure"}`,
    truncated: false,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [statePath, jobPath] = process.argv.slice(2);
  const result = scheduleTargetAttempt(
    statePath,
    JSON.parse(readFileSync(jobPath, "utf8")),
  );
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.attempt.outcome !== "success") process.exitCode = 1;
}
