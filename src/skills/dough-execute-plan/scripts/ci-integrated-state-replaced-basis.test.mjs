// An ignored-only accepted B whose applicable ancestor A was replaced:
// A's run was cancelled with no jobs, B changed only docs and has no run, and
// B's descendant C actually ran its covered command green. Under the declared
// policy the installed completion command completes B as validated at C,
// keeping B's own `not_required` state and basis; without one, B stays
// incomplete as its basis outcome.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { git, revParse } from "./publication-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  createIntegratedStateJourney,
  policy,
} from "./ci-integrated-state-journey-test-fixtures.mjs";
import { createMailbox } from "./ci-mailbox-location.mjs";
import {
  observeRevisionCoverage,
  readRevisionCoverage,
  registerPushedRevision,
} from "./ci-mailbox-revision-coverage.mjs";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import {
  acceptedWorkflow,
  commitAll,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

// The coordinator commits `files` on its accepted history and publishes them.
async function publishFiles(journey, files) {
  const { fixture } = journey;
  const { execution } = fixture;
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(execution, file, ".."), { recursive: true });
    writeFileSync(join(execution, file), content);
    await git(execution, "add", file);
  }
  await git(execution, "commit", "-m", `increment ${Object.keys(files)}`);
  fixture.candidateSha = await revParse(execution, "HEAD");
  return journey.publishIncrement();
}

test("declared policy: docs-only B whose replaced source ancestor A has no verdict completes as validated at C, then shuts down", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const a = await publishFiles(journey, {
    ".github/workflows/ci.yml": acceptedWorkflow,
    "app.js": "a\n",
  });
  journey.recordRun(a, { state: "cancelled" });
  const b = await publishFiles(journey, { "docs/b.md": "b\n" });
  const c = await publishFiles(journey, { "app.js": "c\n" });
  const cRun = journey.recordRun(c, {
    state: "completed",
    executed: await journey.runCovered(c),
  });
  const directory = await journey.observe(b);
  const validated = {
    sha: c,
    branch: "main",
    runId: cRun,
    attempt: 1,
    url: `https://github.test/owner/repo/actions/runs/${cRun}`,
    check: "ci.yml",
    context: "push",
    jobs: [
      {
        name: "covered",
        jobId: cRun * 10 + 1,
        conclusion: "success",
        url: `https://github.test/owner/repo/actions/runs/${cRun}/job/${cRun * 10 + 1}`,
      },
    ],
  };
  const ancestry = {
    ancestor: b,
    descendant: c,
    basis: "git merge-base --is-ancestor",
  };
  // The completion command itself waits out B's undiscovered first record.
  const completion = await completeThroughCli(journey.fixture, directory, b);
  const accepted = {
    sha: b,
    state: "not_required",
    basis: { sha: a, state: "incomplete" },
    registeredAt: journey.coverage(directory, b).registeredAt,
  };
  const { shutdown, ...receipt } = completion;
  assert.deepEqual(receipt, {
    requestedSha: b,
    target: { repo: "owner/repo", branch: "main" },
    effectiveEvidence: {
      source: "integrated_state",
      accepted,
      validated,
      policy,
      ancestry,
    },
    verdict: "success",
  });
  assert.equal(shutdown.status, "confirmed");
  assert.deepEqual(shutdown.terminal.coverage, {
    state: "ended",
    pendingCi: "unobserved",
  });
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "dead",
  );
  assert.equal(journey.commands.count(b), 0, "B's check never ran");
  assert.equal(journey.commands.count(c), 1);
});

// Coverage to await with real classification: the same B, judged from the
// listed runs [C success, A cancelled] with C's current attempt green.
test("without a declared policy, docs-only B on a replaced ancestor stays incomplete with no verdict; with one it completes", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  writeWorkflow(repo, acceptedWorkflow);
  writeFileSync(join(repo, "app.js"), "a\n");
  const a = await commitAll(repo, "A");
  mkdirSync(join(repo, "docs"));
  writeFileSync(join(repo, "docs/b.md"), "b\n");
  const b = await commitAll(repo, "B");
  writeFileSync(join(repo, "app.js"), "c\n");
  const c = await commitAll(repo, "C");
  const run = (headSha, databaseId, conclusion) => ({
    headSha,
    headBranch: "main",
    databaseId,
    attempt: 1,
    status: "completed",
    conclusion,
    event: "push",
  });
  const request = {
    mode: "execution",
    repo: "owner/repo",
    branch: "main",
    maxDurationMs: 60_000,
    root: repo,
  };
  const readCurrentAttempt = async (listed) => ({
    ...listed,
    check: "ci.yml",
    context: "push",
  });

  async function complete(integratedPolicy) {
    const storage = mkdtempSync(join(tmpdir(), "ci-replaced-basis-"));
    t.after(() => rmSync(storage, { recursive: true, force: true }));
    const directory = createMailbox(request, { root: repo, storage });
    registerPushedRevision(directory, b);
    await observeRevisionCoverage(
      directory,
      [run(c, 3, "success"), run(a, 1, "cancelled")],
      request,
      Date.now(),
      { integratedPolicy, readCurrentAttempt },
    );
    const [record] = readRevisionCoverage(directory);
    assert.equal(record.state, "not_required");
    assert.deepEqual(record.basis, { sha: a, state: "incomplete" });
    let now = 0;
    return awaitRevision(directory, b, {
      root: repo,
      storage,
      deadlineMs: 20,
      now: () => now,
      sleep: async (ms) => {
        now += ms;
      },
      workerLiveness: () => "alive",
    });
  }

  const withoutPolicy = await complete(undefined);
  assert.equal(withoutPolicy.verdict, undefined);
  assert.equal(withoutPolicy.unresolvedReason, "incomplete");
  assert.deepEqual(withoutPolicy.effectiveEvidence, {
    source: "not_required_basis",
    revision: { sha: b, state: "not_required" },
    basis: { sha: a, state: "incomplete" },
  });

  const declared = { check: "ci.yml", context: "push" };
  const withPolicy = await complete(declared);
  assert.equal(withPolicy.verdict, "success");
  assert.equal(withPolicy.effectiveEvidence.source, "integrated_state");
  assert.equal(withPolicy.effectiveEvidence.validated.sha, c);
});
