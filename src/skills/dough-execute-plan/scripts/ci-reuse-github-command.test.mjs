import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { exec } from "./publication-test-fixtures.mjs";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";

const command = fileURLToPath(
  new URL("./ci-reuse-github-command.mjs", import.meta.url),
);
const gate = fileURLToPath(new URL("./ci-reuse-gate.mjs", import.meta.url));
const sha = "a".repeat(40);
const policy = {
  repo: "owner/repo",
  workflow: "ci.yml",
  unit: "covered",
  configuration: "checks-v1",
  context: "inputs-v1",
  targetRef: "main",
  refs: ["trusted"],
  events: ["push"],
  maxAgeMs: 3600000,
};

test("actual GitHub command writes hit/miss/fallback outputs and inspectable distinct source/target reports", async (t) => {
  const at = new Date().toISOString();
  const run = {
    id: 42,
    run_attempt: 1,
    workflow_id: 7001,
    head_sha: sha,
    head_branch: "trusted",
    event: "push",
    head_repository: { full_name: policy.repo },
    status: "completed",
    conclusion: "success",
    run_started_at: at,
    updated_at: at,
    html_url: "https://github.test/source/42",
  };
  const json = (body) => ({
    head: "HTTP/2.0 200 OK",
    body: JSON.stringify(body),
  });
  const github = instrumentedGithubFixture(t, {});
  const root = github.env.CI_GH_FIXTURE;
  const count = join(root, "covered-executions");
  const direct = await exec(process.execPath, [
    "-e",
    `require('node:fs').appendFileSync(${JSON.stringify(count)}, 'executed\\n'); console.log('DOUGH_CI_DIRECT '+JSON.stringify(${JSON.stringify({ sha, unit: policy.unit, configuration: policy.configuration, context: policy.context })}));`,
  ]);
  const state = {
    runs: [run],
    attempts: { "42/1": run },
    jobs: [
      {
        id: 9,
        name: "covered",
        status: "completed",
        conclusion: "success",
        completed_at: at,
      },
    ],
    answers: {
      "runs/42": json(run),
      "jobs/9/logs": { head: "HTTP/2.0 200 OK", body: direct.stdout },
    },
  };
  const policyFile = join(root, "policy.json");
  writeFileSync(policyFile, JSON.stringify(policy));
  const report = join(root, "decision.json");
  const output = join(root, "outputs");
  const summary = join(root, "summary");
  const env = {
    ...github.env,
    GH_TOKEN: "secret-fixture",
    GITHUB_SHA: sha,
    GITHUB_RUN_ID: "77",
    GITHUB_RUN_ATTEMPT: "2",
    GITHUB_REF_NAME: "main",
    GITHUB_REPOSITORY: "owner/repo",
    GITHUB_SERVER_URL: "https://github.test",
    GITHUB_OUTPUT: output,
    GITHUB_STEP_SUMMARY: summary,
    DOUGH_CI_FRESH: "false",
  };
  github.set(state);
  await exec(process.execPath, [command, policyFile, report], { env });
  const hit = JSON.parse(readFileSync(report));
  assert.equal(hit.reuse, true);
  assert.equal(hit.target.runId, "77");
  assert.equal(hit.target.attemptId, "2");
  assert.equal(hit.source.runId, "42");
  assert.equal(hit.source.attemptId, "1");
  assert.equal(hit.source.context, policy.context);
  assert.equal(readFileSync(output, "utf8"), "reuse=true\n");
  assert.match(readFileSync(summary, "utf8"), /actions\/runs\/77\/attempts\/2/);
  assert.match(
    readFileSync(summary, "utf8"),
    /https:\/\/github.test\/source\/42/,
  );
  assert.equal(readFileSync(count, "utf8"), "executed\n");
  state.answers["jobs/9/logs"].body = direct.stdout.replace(
    "inputs-v1",
    "changed-context",
  );
  github.set(state);
  await exec(process.execPath, [command, policyFile, report], { env });
  assert.equal(JSON.parse(readFileSync(report)).reuse, false);
  state.answers["runs/42"] = {
    head: "HTTP/2.0 500 Failed",
    body: "{}",
    code: 1,
  };
  github.set(state);
  await exec(process.execPath, [command, policyFile, report], { env });
  assert.equal(JSON.parse(readFileSync(report)).reason, "incomplete-query");
  await exec(
    process.execPath,
    [command, join(root, "missing-policy"), report],
    { env },
  );
  assert.equal(
    JSON.parse(readFileSync(report)).reason,
    "unreadable-policy-or-evidence",
  );
  assert.equal(
    readFileSync(output, "utf8"),
    "reuse=true\nreuse=false\nreuse=false\nreuse=false\n",
  );
});

test("unreadable generic gate input is a fresh decision, not a failed command", async () => {
  const result = await exec(process.execPath, [
    gate,
    "--input",
    "/missing/dough-ci-evidence.json",
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    reuse: false,
    reason: "unreadable-evidence",
  });
});
