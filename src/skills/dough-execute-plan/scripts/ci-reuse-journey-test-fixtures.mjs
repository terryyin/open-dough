// Existing publication/observer fixtures with provider evidence produced by a
// real covered command. This fixture supplies provider API facts, not verdicts.
import assert from "node:assert/strict";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { exec, git } from "./publication-test-fixtures.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { workerPollingEnvironment } from "./ci-worker-poll-test-fixtures.mjs";
import { createReuseCheckCommands } from "./ci-reuse-check-command-test-fixtures.mjs";

export async function installReuseProvider(fixture) {
  Object.assign(fixture, { env: workerPollingEnvironment(fixture.env) });
  Object.assign(fixture.requestBase, { env: fixture.env });
  const policy = {
    repo: "owner/project",
    workflow: "ci.yml",
    unit: "covered",
    configuration: "checks-v1",
    context: "inputs-v1",
    targetRef: "main",
    refs: ["exec/story", "main"],
    events: ["push"],
    maxAgeMs: 3600000,
  };
  const { count, runCovered, runTargetOnly } = createReuseCheckCommands(
    fixture,
    policy,
  );
  const sources = [];
  const targets = [];
  const reader = await import(
    pathToFileURL(join(fixture.skill, "scripts/ci-reuse-github.mjs")).href
  );
  const gh = async ([, route]) => {
    if (route.endsWith("workflows/ci.yml")) return { id: 7 };
    if (route.includes("/runs?")) {
      const sha = new URLSearchParams(route.split("?")[1]).get("head_sha");
      const runs = sources.filter((source) => source.head_sha === sha);
      return { total_count: runs.length, workflow_runs: runs };
    }
    const source = sources.find((source) =>
      route.includes(`/runs/${source.id}`),
    );
    if (!source) throw Error(`Unknown source ${route}`);
    if (route.includes("/jobs?"))
      return {
        total_count: 1,
        jobs: [
          {
            id: source.id,
            name: policy.unit,
            status: "completed",
            conclusion: source.conclusion,
            completed_at: source.updated_at,
          },
        ],
      };
    return source;
  };
  const log = async ([, route]) =>
    sources.find((source) => route.includes(`/jobs/${source.id}/logs`)).log;
  return {
    policy,
    count,
    sources,
    targets,
    async direct(sha, { failed = false } = {}) {
      const result = await runCovered(sha, failed);
      const at = new Date().toISOString();
      const source = {
        id: `source-opaque-${sources.length}`,
        run_attempt: 1,
        head_sha: sha,
        head_branch: "exec/story",
        event: "push",
        workflow_id: 7,
        head_repository: { full_name: policy.repo },
        html_url: "https://ci.example/source",
        status: "completed",
        conclusion: result.success ? "success" : "failure",
        run_started_at: at,
        updated_at: at,
        log: result.log,
      };
      sources.push(source);
      return source;
    },
    async target(
      sha,
      {
        failed = false,
        targetFailed = false,
        incomplete = false,
        cancelled = false,
        fresh = false,
      } = {},
    ) {
      const query = await reader.readGitHubReuseFacts({
        sha,
        policy,
        currentRunId: "target",
        freshOverride: fresh,
        gh,
        log,
      });
      if (incomplete) query.complete = false;
      const input = join(fixture.fixture, "gate-input.json");
      writeFileSync(
        input,
        JSON.stringify({ sha, targetRef: "main", policy, query }),
      );
      const result = await exec(
        process.execPath,
        [join(fixture.skill, "scripts/ci-reuse-gate.mjs"), "--input", input],
        { cwd: fixture.execution },
      );
      const decision = JSON.parse(result.stdout);
      const coveredSuccess =
        decision.reuse || (await runCovered(sha, failed)).success;
      // The target-only command really executes even on a hit.
      const targetSuccess = await runTargetOnly(sha, targetFailed);
      const runId = `target:opaque/${targets.length}`;
      const report = join(fixture.fixture, `target-${targets.length}.json`);
      const attempt = {
        runId,
        attemptId: "attempt:opaque/target",
        sha,
        outcome: cancelled
          ? "incomplete"
          : coveredSuccess && targetSuccess
            ? "success"
            : "failure",
        url: pathToFileURL(report).href,
      };
      writeFileSync(
        report,
        JSON.stringify({ target: attempt, decision }, null, 2),
      );
      targets.push(attempt);
      publishJson(fixture.fixture, "release.json", { attempts: targets });
      return { attempt, decision };
    },
  };
}

export async function completeTarget(fixture, directory, target) {
  await awaitWorkerState(
    directory,
    () =>
      readRevisionCoverage(directory).some(
        (revision) =>
          revision.sha === target.attempt.sha &&
          revision.state === target.attempt.outcome,
      ),
    "real target coverage",
  );
  const completion = await completeThroughCli(
    fixture,
    directory,
    target.attempt.sha,
  );
  assert.equal(completion.requestedSha, target.attempt.sha);
  const revision = completion.effectiveEvidence.revision;
  assert.equal(revision.checkedBy.runId, target.attempt.runId);
  assert.equal(revision.checkedBy.attemptId, target.attempt.attemptId);
  const report = JSON.parse(readFileSync(new URL(target.attempt.url), "utf8"));
  assert.equal(report.target.sha, target.attempt.sha);
  assert.deepEqual(report.decision, target.decision);
  if (target.decision.reuse)
    assert.notEqual(revision.checkedBy.runId, target.decision.source.runId);
  return completion;
}

export async function startStoryTarget(fixture, sha) {
  const request = {
    mode: "execution",
    repo: "owner/project",
    branch: "main",
    coordinator: "reuse-story-coordinator",
    root: fixture.execution,
    cwd: fixture.execution,
    maxDurationMs: 60000,
  };
  const directory = await fixture.startExecutionMailbox(request, {
    root: fixture.execution,
    storage: fixture.storage,
    env: fixture.env,
  });
  await exec(
    process.execPath,
    [
      join(fixture.skill, "scripts/ci-mailbox.mjs"),
      "register-push",
      directory,
      sha,
    ],
    { cwd: fixture.execution, env: fixture.env },
  );
  return directory;
}

export async function ignoreInstalledSkills(fixture) {
  const common = (
    await git(
      fixture.execution,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  appendFileSync(
    join(common, "info/exclude"),
    ".agents/\n.claude/\n.planning/open-dough.json\n",
  );
}
