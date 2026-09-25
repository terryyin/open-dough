import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";

const exec = promisify(execFile);
const observer = new URL("./watch-ci-execution.mjs", import.meta.url).href;
const fixtures = new URL("./watch-ci-test-fixtures.mjs", import.meta.url).href;

// Observes one modeled repository whose selected `checks.yaml` workflow is
// displayed as "Client checks", beside a deployment workflow and another
// branch, under the supplied workflow environment. The observer reads that
// environment when it loads, so each case runs in its own process.
async function observeClientRepository(workflowEnvironment) {
  const program = `
    import { watchCiExecution } from ${JSON.stringify(observer)};
    import { modeledGithubActions } from ${JSON.stringify(fixtures)};
    const controller = new AbortController();
    const failed = { headSha: 'abc', status: 'completed', conclusion: 'failure' };
    const github = modeledGithubActions({
      workflows: { 'checks.yaml': 'Client checks', 'deploy.yml': 'Deploy' },
      runs: [
        { ...failed, workflow: 'checks.yaml', databaseId: 1, headBranch: 'release/next' },
        { ...failed, workflow: 'checks.yaml', databaseId: 2, headBranch: 'main' },
        { ...failed, workflow: 'deploy.yml', databaseId: 3, headBranch: 'release/next' },
      ],
    });
    const calls = [], events = [];
    let polls = 0;
    await watchCiExecution({
      repo: 'client/project', branch: 'release/next', signal: controller.signal,
      emit: event => events.push(event),
      sleep: async () => { if (++polls === 3) controller.abort(); },
      gh: args => { calls.push(args); return github.gh(args); },
    });
    console.log(JSON.stringify({ calls, events }));
  `;
  const env = { ...process.env };
  delete env.DOUGH_CI_WORKFLOW_NAME;
  const { stdout } = await exec(
    process.execPath,
    ["--input-type=module", "-e", program],
    { env: { ...env, ...workflowEnvironment }, timeout: 5000 },
  );
  return JSON.parse(stdout);
}

const selectedFailures = (events) =>
  events
    .filter(({ type }) => type === "CI_FAILURE")
    .map(({ runId, workflow, branch }) => ({ runId, workflow, branch }));

test("client workflow and non-main branch select failures and exclude deployment", async () => {
  const { calls, events } = await observeClientRepository({
    DOUGH_CI_WORKFLOW: "checks.yaml",
    DOUGH_CI_WORKFLOW_NAME: "Client checks",
  });
  assert.equal(calls[0][calls[0].indexOf("--workflow") + 1], "checks.yaml");
  assert.equal(calls[0][calls[0].indexOf("--branch") + 1], "release/next");
  assert.deepEqual(selectedFailures(events), [
    { runId: 1, workflow: "checks.yaml", branch: "release/next" },
  ]);
});

test("a selected workflow whose display name is not CI is observed without a separate name setting", async () => {
  const { events } = await observeClientRepository({
    DOUGH_CI_WORKFLOW: "checks.yaml",
  });
  assert.deepEqual(selectedFailures(events), [
    { runId: 1, workflow: "checks.yaml", branch: "release/next" },
  ]);
});

test("an explicit display name that contradicts the selected workflow ends observation with the mismatch instead of dropping its runs", async () => {
  const { events } = await observeClientRepository({
    DOUGH_CI_WORKFLOW: "checks.yaml",
    DOUGH_CI_WORKFLOW_NAME: "CI",
  });
  assert.deepEqual(selectedFailures(events), []);
  assert.deepEqual(
    events.map(({ type, workflow }) => ({ type, workflow })),
    [{ type: "CI_MONITOR_UNAVAILABLE", workflow: "checks.yaml" }],
  );
  assert.match(
    events[0].reason,
    /DOUGH_CI_WORKFLOW_NAME "CI" does not match "Client checks"[\s\S]*checks\.yaml[\s\S]*correct or unset/,
  );
});
