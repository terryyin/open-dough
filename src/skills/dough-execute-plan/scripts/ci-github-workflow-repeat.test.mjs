// The real CI action, request owner and synthetic gh, observing method and run.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { actionsRunsAnswer } from "../../../../dashboard/tests/support/baseCiActions.ts";
import * as actions from "./ci-github-actions.mjs";
import { GitHubRequests } from "./github-requests.mjs";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";

const signal = () => new AbortController().signal;
const route = "repos/owner/repo/actions/runs/71/rerun";
function provider(t, run, answer) {
  const encoded = actionsRunsAnswer([run]);
  const { workflow_runs: runs } = JSON.parse(encoded.body);
  const github = instrumentedGithubFixture(t, {
    runs,
    attempts: {},
    jobs: [],
    answers: { "POST runs/71/rerun": answer },
  });
  github.enter();
  return github;
}
const requests = (github) =>
  github.calls().filter(({ phase }) => phase === "asked");

test("the explicit full repeat posts the selected original run once; generic API reads remain GET and cannot post", async (t) => {
  const run = makeMe.aCiRun
    .with({ id: 71, headSha: "a".repeat(40), attempt: 1 })
    .please();
  const github = provider(t, run, { head: "HTTP/2.0 201 Created", body: "{}" });
  assert.deepEqual(
    await actions.repeatGitHubWorkflow(
      { repository: "owner/repo", runId: run.id },
      signal(),
    ),
    {
      kind: "accepted",
      status: 201,
    },
  );
  const read = await actions
    .createGitHubActions({ repo: "owner/repo" })
    .viewCurrentRun(run.id, signal());
  assert.equal(read.headSha, run.headSha);
  const generic = new GitHubRequests({
    boundMs: 20_000,
    backoffBaseMs: 60_000,
  });
  assert.equal(
    (await generic.request(["api", "--method", "POST", route], signal()))
      .failure.kind,
    "failed",
  );
  assert.deepEqual(
    requests(github).map(({ method, route }) => ({ method, route })),
    [
      { method: "POST", route },
      { method: "GET", route: "repos/owner/repo/actions/runs/71" },
    ],
  );
  assert.deepEqual(requests(github)[0].args, [
    "api",
    "--include",
    "--method",
    "POST",
    route,
  ]);
});

for (const [status, kind] of [
  [403, "refused"],
  [408, "uncertain"],
  [429, "refused"],
  [500, "uncertain"],
  [undefined, "uncertain"],
]) {
  test(`full repeat ${status ?? "lost reply"} is ${kind} and is never automatically retried`, async (t) => {
    const run = makeMe.aCiRun
      .with({ id: 71, headSha: "a".repeat(40), attempt: 1 })
      .please();
    const github = provider(t, run, {
      head: status === undefined ? "" : `HTTP/2.0 ${status} Result`,
      body: "{}",
      code: 1,
      stderr:
        status === undefined
          ? "error connecting to api.github.com"
          : `gh: refused (HTTP ${status})`,
    });
    const result = await actions.repeatGitHubWorkflow(
      { repository: "owner/repo", runId: run.id },
      signal(),
    );
    assert.equal(result.kind, kind);
    assert.equal(
      result.reason,
      kind === "refused" ? "provider-refused" : "submission-unconfirmed",
    );
    if (status !== undefined) assert.equal(result.status, status);
    assert.equal(requests(github).length, 1);
    assert.equal(requests(github)[0].method, "POST");
    assert.equal(requests(github)[0].route, route);
  });
}

test("identical explicit repeats remain separate requests through both client and owner, without read coalescing", async (t) => {
  const run = makeMe.aCiRun
    .with({ id: 71, headSha: "a".repeat(40), attempt: 1 })
    .please();
  const github = provider(t, run, { head: "HTTP/2.0 201 Created", body: "{}" });
  github.holdRequests();
  github.teardown.defer(github.releaseRequests);
  const both = Promise.all(
    [1, 2].map(() =>
      actions.repeatGitHubWorkflow(
        { repository: "owner/repo", runId: run.id },
        signal(),
      ),
    ),
  );
  void both.catch(() => undefined);
  try {
    await until(
      () => requests(github).length === 2,
      "both independent POSTs reached GitHub",
    );
  } finally {
    github.releaseRequests();
  }
  assert.deepEqual(await both, [
    { kind: "accepted", status: 201 },
    { kind: "accepted", status: 201 },
  ]);
  assert.deepEqual(
    requests(github).map(({ method }) => method),
    ["POST", "POST"],
  );
});

test("the action accepts only a repository and positive original run ID, never an arbitrary endpoint or command", async (t) => {
  const run = makeMe.aCiRun
    .with({ id: 71, headSha: "a".repeat(40), attempt: 1 })
    .please();
  const github = provider(t, run, { head: "HTTP/2.0 201 Created", body: "{}" });
  for (const input of [
    { repository: "owner/repo/actions/runs/72/rerun", runId: 71 },
    { repository: "https://other/owner/repo", runId: 71 },
    { repository: "owner/..", runId: 71 },
    { repository: "owner/repo", runId: "71; gh run rerun 72" },
    { repository: "owner/repo", runId: 0 },
  ])
    await assert.rejects(
      actions.repeatGitHubWorkflow(input, signal()),
      TypeError,
    );
  assert.deepEqual(requests(github), []);
});
