import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
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
  controllableSleep,
  waitFor,
} from "./ci-revision-coverage-late-github-failure-test-fixtures.mjs";
import {
  acceptedWorkflow,
  commitAll,
  exec,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

// A real temporary Git repository supplies the workflow content and ancestry
// that classifyRevisionApplicability reads via `git show`/`diff`/`merge-base`
// (see ci-path-applicability-test-fixtures.mjs). GitHub itself stays faked
// through watchCiExecution's own `gh` seam, the same seam
// ci-revision-coverage-late-github-failure.test.mjs uses: this never injects
// the expected not_required record, empty event log, or terminal report
// directly, only the GitHub responses the real worker drives through.
//
// The fake distinguishes the ordinary per-poll run listing from the extra
// bounded-history listing ci-runs.mjs's discoverApplicabilityCandidateRuns
// issues (limit 100, no --created) when a revision's local candidates cannot
// prove any ancestor: real GitHub commonly drops an old completed run out of
// the ordinary short-window listing, which is exactly why that broader,
// on-demand lookup exists.
function ignoredOnlyGithub({ repo, branch, shaA, databaseIdA }) {
  let regularCalls = 0;
  let historyCalls = 0;
  let exactRun;
  const gh = async (args) => {
    if (args[0] === "run" && args[1] === "list") {
      const limit = Number(args[args.indexOf("--limit") + 1]);
      const hasCreated = args.includes("--created");
      if (limit === 100 && !hasCreated) {
        historyCalls += 1;
        return [
          run({
            headSha: shaA,
            headBranch: branch,
            databaseId: databaseIdA,
            workflowName: "CI",
            event: "push",
            status: "completed",
            conclusion: "success",
            url: `https://github.com/${repo}/actions/runs/${databaseIdA}`,
          }),
        ];
      }
      regularCalls += 1;
      return exactRun ? [exactRun] : [];
    }
    throw new Error(`unexpected gh call ${JSON.stringify(args)}`);
  };
  return {
    gh,
    regularCallCount: () => regularCalls,
    historyCallCount: () => historyCalls,
    setExactRun: (overrides) => {
      exactRun = run(overrides);
    },
  };
}

test("an ignored-only descendant of a successful ancestor records not_required and stays quiet, a mixed descendant stays undiscovered, and a late exact attempt wins over reuse", async (t) => {
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-not-required-"));
  // Declared with `let` (not const) so the cleanup below can stop whichever
  // mailbox/worker were actually created if setup fails partway through.
  // eslint-disable-next-line prefer-const
  let directory, worker;
  t.after(async () => {
    if (directory) requestMailboxStop(directory, { root: repo, storage });
    await worker;
    rmSync(repo, { recursive: true, force: true });
    rmSync(storage, { recursive: true, force: true });
  });

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base code and workflow");

  // Ignored-only descendant of A: ancestor's applicable attempt should be
  // reused as B's basis.
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  await exec("mkdir", ["-p", join(repo, "docs")]);
  writeFileSync(join(repo, "docs", "readme.md"), "docs\n");
  const shaB = await commitAll(repo, "ignored-only change");

  // Mixed descendant of B: touches both an ignored path and app.js, so no
  // ancestor basis can safely cover it; it must stay undiscovered rather than
  // being wrongly marked not_required.
  writeFileSync(join(repo, "app.js"), "console.log('changed');\n");
  writeFileSync(join(repo, ".planning", "note2.md"), "note2\n");
  const shaC = await commitAll(repo, "mixed change");

  const branch = "feature/path-filter";
  directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch,
      maxDurationMs: 60_000,
    },
    { root: repo, storage },
  );
  // A is never registered in this mailbox at all: it is ordinary GitHub CI
  // history the worker discovers, not a revision this execution pushed.
  registerPushedRevision(directory, shaB);
  registerPushedRevision(directory, shaC);

  const { sleep, sleeps } = controllableSleep();
  const github = ignoredOnlyGithub({
    repo: "owner/project",
    branch,
    shaA,
    databaseIdA: 701,
  });
  worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep }),
  });

  await waitFor(() => sleeps.length > 0, "initial poll");
  const advancePoll = async () => {
    sleeps.shift().resolve();
    await waitFor(() => sleeps.length > 0, "poll advanced");
  };

  const coverageOf = (sha) =>
    readRevisionCoverage(directory).find((revision) => revision.sha === sha);

  // The very first poll already classifies both revisions: B reuses A's
  // proved attempt via the broadened (bounded-history) candidate search, C
  // stays undiscovered because its diff mixes ignored and non-ignored paths.
  assert.deepEqual(coverageOf(shaB), {
    sha: shaB,
    state: "not_required",
    basis: { sha: shaA, state: "success" },
    registeredAt: coverageOf(shaB).registeredAt,
  });
  assert.equal(coverageOf(shaC).state, "undiscovered");
  assert.deepEqual(readMailboxEvents(directory), []);
  assert.ok(
    github.historyCallCount() >= 1,
    "the bounded-history candidate search must have run",
  );

  // Repeated polling stays quiet: no discovery advisory, no host event, and
  // B's reuse basis does not flap.
  await advancePoll();
  await advancePoll();
  assert.deepEqual(coverageOf(shaB), {
    sha: shaB,
    state: "not_required",
    basis: { sha: shaA, state: "success" },
    registeredAt: coverageOf(shaB).registeredAt,
  });
  assert.equal(coverageOf(shaC).state, "undiscovered");
  assert.deepEqual(readMailboxEvents(directory), []);

  // A late exact attempt for B itself always wins over the path-based reuse.
  github.setExactRun({
    headSha: shaB,
    headBranch: branch,
    databaseId: 900,
    workflowName: "CI",
    event: "push",
    status: "completed",
    conclusion: "success",
    url: "https://github.com/owner/project/actions/runs/900",
  });
  await advancePoll();
  const afterExact = coverageOf(shaB);
  assert.equal(afterExact.state, "success");
  assert.deepEqual(afterExact.checkedBy, { runId: 900, attemptId: 1 });
  assert.equal(afterExact.basis, undefined);
  assert.deepEqual(readMailboxEvents(directory), []);

  requestMailboxStop(directory, { root: repo, storage });
  await worker;
  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  // B is proved (first via reuse, then via its own exact attempt) and never
  // appears as unproved; C genuinely still needs an exact run.
  assert.deepEqual(terminal.coverage.unproved, [
    { sha: shaC, state: "undiscovered" },
  ]);
});
