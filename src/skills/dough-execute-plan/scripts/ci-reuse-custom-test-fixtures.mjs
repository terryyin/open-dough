import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { exec, lsRemoteSha } from "./publication-test-fixtures.mjs";
import { git } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import { startStoryTarget } from "./ci-reuse-journey-test-fixtures.mjs";
import { deliver } from "./ci-reuse-trunk-test-fixtures.mjs";
import { workerPollingEnvironment } from "./ci-worker-poll-test-fixtures.mjs";
import { createReuseCheckCommands } from "./ci-reuse-check-command-test-fixtures.mjs";

// Existing real publication/observer/check fixtures, with only the provider
// acquisition and discovery replaced by the installed runnable example.
export async function installCustomReuseProvider(fixture) {
  Object.assign(fixture, { env: workerPollingEnvironment(fixture.env) });
  Object.assign(fixture.requestBase, { env: fixture.env });
  const policy = {
    repo: "owner/project",
    workflow: "project-checks",
    unit: "covered",
    configuration: "checks-v1",
    context: "inputs-v1",
    targetRef: "main",
    refs: ["exec/story", "main"],
    events: ["push"],
    maxAgeMs: 3600000,
  };
  const checks = createReuseCheckCommands(fixture, policy);
  const state = join(fixture.fixture, "custom-provider.json");
  const script = join(fixture.skill, "scripts/ci-reuse-custom-example.mjs");
  const command = [process.execPath, script, "adapter", state];
  writeFileSync(
    join(fixture.execution, ".planning/open-dough.json"),
    JSON.stringify({ ciAdapter: command }),
  );
  let sequence = 0;
  const schedule = async (mode, sha, options = {}) => {
    const job = join(fixture.fixture, "custom-job.json");
    writeFileSync(
      job,
      JSON.stringify({
        repo: policy.repo,
        workflow: policy.workflow,
        ref: options.ref ?? (mode === "source" ? "exec/story" : "main"),
        event: "push",
        sha,
        // Deliberately reverse lexical/numeric-looking identity order.
        runId: options.runId ?? `${mode}/opaque:${1000 - sequence++}`,
        attemptId: options.attemptId ?? "try:alpha",
        policy: options.noPolicy ? undefined : policy,
        covered: options.covered ?? checks.coveredCommand(sha, options.failed),
        targetOnly: checks.targetOnlyCommand(sha, options.targetFailed),
        freshOverride: options.fresh ?? false,
      }),
    );
    const result = await exec(process.execPath, [script, mode, state, job], {
      cwd: fixture.execution,
    }).catch((error) => error);
    return JSON.parse(result.stdout);
  };
  return {
    policy,
    state,
    command,
    count: checks.count,
    coveredCommand: checks.coveredCommand,
    direct: async (sha, options) =>
      (await schedule("source", sha, options)).attempt,
    target: (sha, options) => schedule("target", sha, options),
    editJournal(edit) {
      const value = JSON.parse(readFileSync(state, "utf8"));
      edit(value);
      writeFileSync(state, JSON.stringify(value));
    },
  };
}

export async function publishCustomTarget(fixture, mode) {
  if (mode === "trunk") {
    const result = await deliver(fixture, fixture.trunkSha);
    assert.equal(result.publication, "accepted");
    assert.equal(
      await lsRemoteSha(fixture.origin, "refs/heads/exec/story"),
      "",
    );
    return { receipt: result.receipt, directory: result.observation.directory };
  }
  await git(fixture.execution, "push", "origin", "HEAD:refs/heads/exec/story");
  const result = await publishHistoryPreservingCandidate({
    ownedWorkspace: fixture.execution,
    publishedTip: fixture.candidateSha,
    branch: "exec/story",
  });
  return {
    receipt: result.receipt,
    directory: await startStoryTarget(fixture, result.receipt.sha),
  };
}
