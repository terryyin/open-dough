import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { githubRequest } from "./github-actions-api-test-fixtures.mjs";

const exec = promisify(execFile);
const observer = new URL("./watch-ci-execution.mjs", import.meta.url).href;
const fixtures = new URL("./watch-ci-test-fixtures.mjs", import.meta.url).href;

// Observes one modeled repository whose selected `checks.yaml` workflow is
// displayed as "Client checks", beside a deployment workflow and another
// branch. Each process starts beside, rather than inside, the project root,
// with an isolated environment and the supplied project settings.
async function observeClientRepository(
  workflowEnvironment,
  configuration,
  changeSettings = false,
) {
  const directory = mkdtempSync(join(tmpdir(), "ci-client-configuration-"));
  const root = join(directory, "project");
  mkdirSync(root);
  const program = `
    import { watchCiExecution } from ${JSON.stringify(observer)};
    import { modeledGithubActions } from ${JSON.stringify(fixtures)};
    import { writeFileSync } from 'node:fs';
    const controller = new AbortController();
    const failed = { headSha: 'abc', status: 'completed', conclusion: 'failure' };
    const github = modeledGithubActions({
      workflows: { 'checks.yaml': 'Client checks', 'deploy.yml': 'Deploy', 'ci.yml': 'CI' },
      runs: [
        { ...failed, workflow: 'checks.yaml', databaseId: 1, headBranch: 'release/next' },
        { ...failed, workflow: 'checks.yaml', databaseId: 2, headBranch: 'main' },
        { ...failed, workflow: 'deploy.yml', databaseId: 3, headBranch: 'release/next' },
        { ...failed, workflow: 'ci.yml', databaseId: 4, headBranch: 'release/next' },
      ],
    });
    const calls = [], events = [], facts = [];
    let polls = 0;
    await watchCiExecution({
      repo: 'client/project', branch: 'release/next', root: ${JSON.stringify(root)}, signal: controller.signal,
      emit: event => events.push(event),
      observeCoverage: async (runs, at, { integratedPolicy, readCurrentAttempt }) => {
        if (integratedPolicy && runs.length) facts.push(await readCurrentAttempt(runs[0]));
        return [];
      },
      sleep: async () => {
        if (${changeSettings} && polls === 0)
          writeFileSync(${JSON.stringify(join(root, ".planning/open-dough.json"))}, '{"ciWorkflow":"deploy.yml"}');
        if (++polls === 3) controller.abort();
      },
      gh: args => { calls.push(args); return github.gh(args); },
    });
    console.log(JSON.stringify({ calls, events, facts }));
  `;
  const env = { ...process.env };
  delete env.DOUGH_CI_WORKFLOW;
  delete env.DOUGH_CI_WORKFLOW_NAME;
  try {
    if (configuration !== undefined) {
      mkdirSync(join(root, ".planning"));
      writeFileSync(
        join(root, ".planning/open-dough.json"),
        JSON.stringify(configuration),
      );
    }
    const { stdout } = await exec(
      process.execPath,
      ["--input-type=module", "-e", program],
      {
        cwd: directory,
        env: { ...env, ...workflowEnvironment },
        timeout: 5000,
      },
    );
    return JSON.parse(stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const selectedFailures = (events) =>
  events
    .filter(({ type }) => type === "CI_FAILURE")
    .map(({ runId, workflow, branch }) => ({ runId, workflow, branch }));

test("project settings select the native workflow outside a development shell", async () => {
  const { calls, events } = await observeClientRepository(
    {},
    { ciWorkflow: "checks.yaml" },
  );
  assert.equal(githubRequest(calls[0]).workflow, "checks.yaml");
  assert.deepEqual(selectedFailures(events), [
    { runId: 1, workflow: "checks.yaml", branch: "release/next" },
  ]);
});

test("the environment overrides the project's workflow selection", async () => {
  const { calls, events } = await observeClientRepository(
    { DOUGH_CI_WORKFLOW: "checks.yaml" },
    { ciWorkflow: "deploy.yml" },
  );
  assert.equal(githubRequest(calls[0]).workflow, "checks.yaml");
  assert.deepEqual(selectedFailures(events), [
    { runId: 1, workflow: "checks.yaml", branch: "release/next" },
  ]);
});

for (const [name, configuration] of [
  ["absent project file", undefined],
  ["absent workflow setting", {}],
  ["empty adapter", { ciAdapter: [] }],
]) {
  test(`${name} retains the ci.yml default`, async () => {
    const { calls, events } = await observeClientRepository({}, configuration);
    assert.equal(githubRequest(calls[0]).workflow, "ci.yml");
    assert.deepEqual(selectedFailures(events), [
      { runId: 4, workflow: "ci.yml", branch: "release/next" },
    ]);
  });
}

test("a numeric workflow ID string selects the native workflow", async () => {
  const { calls, events } = await observeClientRepository(
    {},
    { ciWorkflow: "1" },
  );
  assert.equal(githubRequest(calls[0]).workflow, "1");
  assert.deepEqual(selectedFailures(events), [
    { runId: 1, workflow: "1", branch: "release/next" },
  ]);
});

test("integrated-state evidence names the same project-selected workflow", async () => {
  const { facts } = await observeClientRepository(
    {},
    {
      ciWorkflow: "checks.yaml",
      integratedStateCompletion: { check: "checks.yaml", context: "push" },
    },
  );
  assert.equal(facts.length, 3);
  assert.ok(
    facts.every(
      ({ check, context }) => check === "checks.yaml" && context === "push",
    ),
  );
});

test("observation keeps its startup settings when the project file changes", async () => {
  const { calls, events } = await observeClientRepository(
    {},
    { ciWorkflow: "checks.yaml" },
    true,
  );
  assert.equal(
    calls.filter((args) => githubRequest(args).kind === "runs").length,
    3,
  );
  assert.deepEqual(selectedFailures(events), [
    { runId: 1, workflow: "checks.yaml", branch: "release/next" },
  ]);
});

for (const value of ["", "  ", null, 917, [], {}]) {
  test(`malformed native workflow ${JSON.stringify(value)} names the setting and its project file`, async () => {
    await assert.rejects(
      observeClientRepository({}, { ciWorkflow: value }),
      ({ stderr }) =>
        /ciWorkflow in .*\.planning\/open-dough\.json must be a nonempty string naming a GitHub Actions workflow filename or numeric ID/.test(
          stderr,
        ),
    );
  });
}

test("client workflow and non-main branch select failures and exclude deployment", async () => {
  const { calls, events } = await observeClientRepository({
    DOUGH_CI_WORKFLOW: "checks.yaml",
    DOUGH_CI_WORKFLOW_NAME: "Client checks",
  });
  const requests = calls.map(githubRequest);
  assert.deepEqual(requests[0], {
    kind: "workflow",
    repo: "client/project",
    workflow: "checks.yaml",
  });
  // The workflow is resolved once, and every listing asks that workflow's
  // own runs on the target branch.
  assert.equal(requests.filter(({ kind }) => kind === "workflow").length, 1);
  const listings = requests.filter(({ kind }) => kind === "runs");
  assert.equal(listings.length, 3);
  assert.ok(
    listings.every(
      ({ workflowId, branch, event }) =>
        workflowId === "1" && branch === "release/next" && event === "push",
    ),
  );
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
  const { events } = await observeClientRepository(
    {
      DOUGH_CI_WORKFLOW_NAME: "CI",
    },
    { ciWorkflow: "checks.yaml" },
  );
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
