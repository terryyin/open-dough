import { execFile } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import assert from "node:assert/strict";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";

const exec = promisify(execFile);
const sourceSkill = dirname(dirname(fileURLToPath(import.meta.url)));

export const customCiBranch = "feature/custom";
export const queuePolicy = { check: "project-checks", context: "push" };
export const queueEntry = (sha, state = "queued", extra = {}) => ({
  sha,
  branch: customCiBranch,
  state,
  ...extra,
});
export const commandAttempt = (sha, outcome, extra = {}) => ({
  sha,
  branch: customCiBranch,
  runId: "real-run",
  attemptId: "first",
  outcome,
  time: "2026-10-25T00:00:00Z",
  ...extra,
});
export const revisionCoverage = (h, sha) =>
  h.mailbox.readRevisionCoverage(h.directory).find((r) => r.sha === sha);

export async function git(root, ...args) {
  return exec("git", args, { cwd: root });
}

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
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "ci-revision-coverage-")),
  );
  const project = join(fixture, "project");
  const remote = join(fixture, "remote.git");
  const storage = join(fixture, "mailboxes");
  const installed = join(project, ".agents/skills/dough-execute-plan");
  const adapterState = join(fixture, "attempts.json");
  const adapterCalls = join(fixture, "adapter-calls");
  const teardown = fixtureTeardown(fixture);
  t.after(teardown.cleanup);
  mkdirSync(project, { recursive: true });
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

  await exec("git", ["init", "--bare", remote]);
  await git(project, "init", "-b", customCiBranch);
  await git(project, "config", "user.name", "Coverage Fixture");
  await git(project, "config", "user.email", "coverage@example.test");
  await git(project, "remote", "add", "origin", remote);
  writeFileSync(join(project, "application.txt"), "A\n");
  await git(project, "add", "application.txt");
  await git(project, "commit", "-m", "revision A");

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
        {
          runId: "other",
          attemptId: "green",
          sha: "b".repeat(40),
          outcome: "success",
        },
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
  deferWorkerStop(teardown, worker, () =>
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
