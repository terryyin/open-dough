import { execFile } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import assert from "node:assert/strict";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { deferWorkerStop } from "./fixture-teardown-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";

const exec = promisify(execFile);
const sourceSkill = dirname(dirname(fileURLToPath(import.meta.url)));

export const customCiBranch = "feature/custom";
export const queuePolicy = { check: "project-checks", context: "push" };
// Valid adapter queue entry for the fixture branch through MakeMe. State
// check/context at the call site; keep deliberate invalid forms literal.
export const queueEntry = (sha, state = "queued", extra = {}) =>
  makeMe.aCiQueueEntry
    .with({ sha, branch: customCiBranch, state, ...extra })
    .please();
// Valid discovery attempt for the fixture branch through MakeMe.
export const commandAttempt = (sha, outcome, extra = {}) =>
  makeMe.aCiAdapterAttempt
    .with({
      sha,
      branch: customCiBranch,
      runId: "real-run",
      attemptId: "first",
      outcome,
      time: "2026-10-25T00:00:00Z",
      ...extra,
    })
    .please();
export const revisionCoverage = (h, sha) =>
  h.mailbox.readRevisionCoverage(h.directory).find((r) => r.sha === sha);

export async function git(root, ...args) {
  return exec("git", args, { cwd: root });
}

// The project's one published revision A on the custom CI branch. It is no
// Open Dough backlog project: `.planning` holds only the harness's settings.
const revisionA = makeMe.aRepository
  .withTrunkBranch(customCiBranch)
  .withRevision("a", {
    backlog: null,
    files: { "application.txt": "A\n" },
  })
  .please();

// A real local descendant; observers must establish its coverage themselves.
export async function descendantRevision(h) {
  writeFileSync(join(h.project, "application.txt"), "B\n");
  await git(h.project, "commit", "-am", "revision B");
  return (await git(h.project, "rev-parse", "HEAD")).stdout.trim();
}

export function coverageStates(mailbox, directory) {
  return new Map(
    mailbox
      .readRevisionCoverage(directory)
      .map(({ sha, state }) => [sha, state]),
  );
}

// Real custom-adapter worker harness: controllable sleep and attempt JSON only.
// Never injects expected coverage events; the worker produces them.
// Optional `now` shares one clock with watchCiExecution → observeCoverage.
// Pair a large `maxDurationMs` with a controlled clock so budget expiry does
// not fire when the test advances wall time past the discovery bound.
export async function createRevisionCoverageFixture(
  t,
  { now, maxDurationMs = 60_000, integratedPolicy } = {},
) {
  const repository = await materializeRepository(revisionA);
  const { fixture, integration: project, origin: remote } = repository;
  const storage = join(fixture, "mailboxes");
  const installed = join(project, ".agents/skills/dough-execute-plan");
  const adapterState = join(fixture, "attempts.json");
  const adapterCalls = join(fixture, "adapter-calls");
  t.after(repository.cleanup);
  mkdirSync(join(project, ".planning"));
  cpSync(sourceSkill, installed, { recursive: true });

  const adapter = join(fixture, "adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}\nimport { readFileSync, writeFileSync } from 'node:fs';\nlet input = ''; for await (const chunk of process.stdin) input += chunk;\nif (JSON.parse(input).operation === 'diagnose') { process.stdout.write(JSON.stringify({ excerpt: 'real attempt failed' })); process.exit(0); }\nconst calls = Number(readFileSync(${JSON.stringify(adapterCalls)}, 'utf8')) + 1;\nwriteFileSync(${JSON.stringify(adapterCalls)}, String(calls));\nprocess.stdout.write(readFileSync(${JSON.stringify(adapterState)}, 'utf8'));\n`,
  );
  chmodSync(adapter, 0o700);
  writeFileSync(adapterCalls, "0");
  writeFileSync(
    join(project, ".planning/open-dough.json"),
    JSON.stringify({
      ciAdapter: [process.execPath, adapter],
      ...(integratedPolicy
        ? { integratedStateCompletion: integratedPolicy }
        : {}),
    }),
  );

  const launcher = join(installed, "scripts/ci-mailbox.mjs");
  const mailbox = await import(pathToFileURL(launcher));
  const watcher = await import(
    pathToFileURL(join(installed, "scripts/watch-ci-execution.mjs"))
  );
  const directory = mailbox.createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: customCiBranch,
      maxDurationMs,
    },
    { root: project, storage },
  );
  const polls = controllableSleep();
  writeFileSync(
    adapterState,
    JSON.stringify({
      attempts: [
        makeMe.aCiAdapterAttempt
          .with({
            runId: "other",
            attemptId: "green",
            sha: "b".repeat(40),
            outcome: "success",
          })
          .please(),
      ],
    }),
  );
  const worker = mailbox.runMailboxWorker(directory, {
    root: project,
    storage,
    observe: (request) =>
      watcher.watchCiExecution({
        ...request,
        root: project,
        sleep: polls.sleep,
        ...(now ? { now } : {}),
      }),
  });
  deferWorkerStop(repository, worker, () =>
    mailbox.requestMailboxStop(directory, { root: project, storage }),
  );
  const adapterCallCount = () => Number(readFileSync(adapterCalls, "utf8"));
  const poll = polls.of(worker, () => mailbox.readMailboxEvents(directory));
  await poll.reached();
  assert.equal(adapterCallCount(), 1, "initial poll");
  let expectedCalls = 1;
  // Waits until `paused` sees the observer pause after one more poll.
  const pollCompleted = async (paused) => {
    expectedCalls += 1;
    await paused();
    assert.equal(adapterCallCount(), expectedCalls, `poll ${expectedCalls}`);
  };

  const deliver = async () => {
    const sha = (await git(project, "rev-parse", "HEAD")).stdout.trim();
    await git(project, "push", "origin", `HEAD:${customCiBranch}`);
    assert.equal(
      (
        await exec("git", [
          "--git-dir",
          remote,
          "rev-parse",
          `refs/heads/${customCiBranch}`,
        ])
      ).stdout.trim(),
      sha,
    );
    const woken = poll.pauseAfterNow();
    const { stdout } = await exec(
      process.execPath,
      [launcher, "register-push", directory, sha],
      { cwd: project, env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: storage } },
    );
    assert.match(stdout, /^CI_OBSERVER \{.+\}\n$/);
    assert.equal(
      JSON.parse(stdout.slice(mailbox.receiptPrefix.length)).revision.sha,
      sha,
    );
    // The registration wakes the paused observer for one immediate poll.
    await pollCompleted(woken);
    return sha;
  };

  const advancePoll = () => pollCompleted(poll.advance);

  const setAttempts = (attempts) =>
    writeFileSync(adapterState, JSON.stringify({ attempts }));

  return {
    project,
    storage,
    directory,
    mailbox,
    worker,
    deliver,
    advancePoll,
    setAttempts,
    setSnapshot: (snapshot) =>
      writeFileSync(
        adapterState,
        typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot),
      ),
    remote,
    fixture,
  };
}
