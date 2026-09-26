import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  createMailbox,
  readMailboxEvents,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import {
  allBranchesWorkflow,
  commitAll,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

const exec = promisify(execFile);

// A real temporary Git repository supplies the accepted workflow filter and
// ancestry, the same way ci-revision-coverage-not-required.test.mjs and
// ci-revision-coverage-ignored-only-failure.test.mjs do; GitHub itself stays
// faked through watchCiExecution's own `gh` seam. This drives four ignored-
// only descendants B1..B4, each reusing a distinct ancestor A1..A4 whose real
// attempt is respectively pending, cancelled (incomplete), successful, and
// failed, and asserts what shutdown reports for each without ever waiting
// for CI.
function fourAncestorsGithub({ branch, ancestors }) {
  let historyCalls = 0;
  const gh = async (args) => {
    if (args[0] === "run" && args[1] === "list") {
      const limit = Number(args[args.indexOf("--limit") + 1]);
      const hasCreated = args.includes("--created");
      if (limit === 100 && !hasCreated) {
        historyCalls += 1;
        return ancestors.map((ancestor) =>
          run({
            headSha: ancestor.sha,
            headBranch: branch,
            databaseId: ancestor.databaseId,
            workflowName: "CI",
            event: "push",
            status: ancestor.status,
            conclusion: ancestor.conclusion,
            url: `https://github.com/owner/project/actions/runs/${ancestor.databaseId}`,
          }),
        );
      }
      // The ordinary per-poll listing never discovers A1..A4 directly (they
      // are ordinary branch history, not revisions this execution pushed),
      // same premise as ci-revision-coverage-not-required.test.mjs's
      // ignoredOnlyGithub.
      return [];
    }
    if (args[0] === "run" && args[1] === "view" && args.at(-1) === "jobs") {
      const runId = Number(args[2]);
      const ancestor = ancestors.find((a) => a.databaseId === runId);
      return {
        jobs: [
          {
            databaseId: runId * 10,
            name: "build",
            conclusion: ancestor?.conclusion === "failure" ? "failure" : null,
          },
        ],
      };
    }
    throw new Error(`unexpected gh call ${JSON.stringify(args)}`);
  };
  return { gh, historyCallCount: () => historyCalls };
}

test("shutdown retains a not_required revision's pending/incomplete applicable-ancestor evidence and omits proved terminal cases, without a discovery event", async (t) => {
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-not-required-shutdown-"));
  const teardown = fixtureTeardown(storage, repo);
  t.after(teardown.cleanup);

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, allBranchesWorkflow);
  await commitAll(repo, "base code and workflow");

  // A1 (pending) -> B1 (ignored-only descendant of A1)
  writeFileSync(join(repo, "app.js"), "console.log('a1');\n");
  const shaA1 = await commitAll(repo, "A1: code change, CI still pending");
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "b1.md"), "b1\n");
  const shaB1 = await commitAll(repo, "B1: ignored-only");

  // A2 (cancelled/incomplete) -> B2
  writeFileSync(join(repo, "app.js"), "console.log('a2');\n");
  const shaA2 = await commitAll(repo, "A2: code change, CI cancelled");
  writeFileSync(join(repo, ".planning", "b2.md"), "b2\n");
  const shaB2 = await commitAll(repo, "B2: ignored-only");

  // A3 (success) -> B3
  writeFileSync(join(repo, "app.js"), "console.log('a3');\n");
  const shaA3 = await commitAll(repo, "A3: code change, CI succeeded");
  writeFileSync(join(repo, ".planning", "b3.md"), "b3\n");
  const shaB3 = await commitAll(repo, "B3: ignored-only");

  // A4 (failure) -> B4
  writeFileSync(join(repo, "app.js"), "console.log('a4');\n");
  const shaA4 = await commitAll(repo, "A4: code change, CI failed");
  writeFileSync(join(repo, ".planning", "b4.md"), "b4\n");
  const shaB4 = await commitAll(repo, "B4: ignored-only");

  const branch = "feature/shutdown-applicability";
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch,
      maxDurationMs: 60_000,
    },
    { root: repo, storage },
  );
  // A1..A4 are never registered: they are ordinary GitHub CI history the
  // worker discovers as B1..B4's respective applicable basis.
  registerPushedRevision(directory, shaB1);
  registerPushedRevision(directory, shaB2);
  registerPushedRevision(directory, shaB3);
  registerPushedRevision(directory, shaB4);

  const polls = controllableSleep();
  const github = fourAncestorsGithub({
    branch,
    ancestors: [
      {
        sha: shaA1,
        databaseId: 911,
        status: "in_progress",
        conclusion: null,
      },
      {
        sha: shaA2,
        databaseId: 912,
        status: "completed",
        conclusion: "cancelled",
      },
      {
        sha: shaA3,
        databaseId: 913,
        status: "completed",
        conclusion: "success",
      },
      {
        sha: shaA4,
        databaseId: 914,
        status: "completed",
        conclusion: "failure",
      },
    ],
  });
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep: polls.sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );

  await polls.of(worker, () => readMailboxEvents(directory)).reached();

  const coverageOf = (sha) =>
    readRevisionCoverage(directory).find((revision) => revision.sha === sha);

  assert.deepEqual(coverageOf(shaB1), {
    sha: shaB1,
    state: "not_required",
    basis: { sha: shaA1, state: "pending" },
    registeredAt: coverageOf(shaB1).registeredAt,
  });
  assert.deepEqual(coverageOf(shaB2), {
    sha: shaB2,
    state: "not_required",
    basis: { sha: shaA2, state: "incomplete" },
    registeredAt: coverageOf(shaB2).registeredAt,
  });
  assert.deepEqual(coverageOf(shaB3), {
    sha: shaB3,
    state: "not_required",
    basis: { sha: shaA3, state: "success" },
    registeredAt: coverageOf(shaB3).registeredAt,
  });
  assert.deepEqual(coverageOf(shaB4), {
    sha: shaB4,
    state: "not_required",
    basis: { sha: shaA4, state: "failure" },
    registeredAt: coverageOf(shaB4).registeredAt,
  });

  // A4's real failure is still delivered exactly once (slice 3 behavior is
  // unaffected by resolving basis.state), but no not_required revision ever
  // triggers a discovery-delay advisory.
  const events = readMailboxEvents(directory).map(({ event }) => event);
  assert.ok(
    events.some(({ type, sha }) => type === "CI_FAILURE" && sha === shaA4),
    "A4's failure must still be delivered",
  );
  assert.ok(
    !events.some(({ type }) => type === "CI_DISCOVERY_DELAYED"),
    "no not_required revision may trigger a discovery-delay advisory",
  );

  requestMailboxStop(directory, { root: repo, storage });
  await worker;
  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  // B1 (pending ancestor) and B2 (incomplete ancestor) retain visible,
  // sourced evidence; B3 (success ancestor) and B4 (failure ancestor) are
  // proved terminal cases and are fully omitted, exactly like an ordinary
  // proved revision.
  assert.deepEqual(
    [...terminal.coverage.unproved].sort((a, b) => a.sha.localeCompare(b.sha)),
    [
      {
        sha: shaB1,
        state: "not_required",
        basis: { sha: shaA1, state: "pending" },
      },
      {
        sha: shaB2,
        state: "not_required",
        basis: { sha: shaA2, state: "incomplete" },
      },
    ].sort((a, b) => a.sha.localeCompare(b.sha)),
  );
});
