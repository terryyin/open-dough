import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const sourceSkill = dirname(dirname(fileURLToPath(import.meta.url)));

async function waitFor(predicate, message) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(message);
}

async function git(root, ...args) {
  return exec("git", args, { cwd: root });
}

test("delivery registers exact pushed revisions and coverage stays silent until actionable", async (t) => {
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "ci-revision-coverage-")),
  );
  const project = join(fixture, "project");
  const remote = join(fixture, "remote.git");
  const storage = join(fixture, "mailboxes");
  const installed = join(project, ".agents/skills/dough-execute-plan");
  const adapterState = join(fixture, "attempts.json");
  const adapterCalls = join(fixture, "adapter-calls");
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  mkdirSync(project, { recursive: true });
  mkdirSync(join(project, ".planning"));
  cpSync(sourceSkill, installed, { recursive: true });

  const adapter = join(fixture, "adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}\nimport { readFileSync, writeFileSync } from 'node:fs';\nconst calls = Number(readFileSync(${JSON.stringify(adapterCalls)}, 'utf8')) + 1;\nwriteFileSync(${JSON.stringify(adapterCalls)}, String(calls));\nprocess.stdout.write(readFileSync(${JSON.stringify(adapterState)}, 'utf8'));\n`,
  );
  chmodSync(adapter, 0o700);
  writeFileSync(adapterCalls, "0");
  writeFileSync(
    join(project, ".planning/open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );

  await exec("git", ["init", "--bare", remote]);
  await git(project, "init", "-b", "feature/custom");
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
      branch: "feature/custom",
      maxDurationMs: 60_000,
    },
    { root: project, storage },
  );
  const sleeps = [];
  const sleep = (...[, , { signal }]) =>
    new Promise((resolve, reject) => {
      const entry = { resolve };
      sleeps.push(entry);
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });
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
      watcher.watchCiExecution({ ...request, root: project, sleep }),
  });
  await waitFor(
    () => Number(readFileSync(adapterCalls, "utf8")) === 1,
    "initial poll",
  );

  const deliver = async () => {
    const sha = (await git(project, "rev-parse", "HEAD")).stdout.trim();
    await git(project, "push", "origin", "HEAD:feature/custom");
    assert.equal(
      (
        await exec("git", [
          "--git-dir",
          remote,
          "rev-parse",
          "refs/heads/feature/custom",
        ])
      ).stdout.trim(),
      sha,
    );
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
    return sha;
  };
  const shaA = await deliver();

  const advancePoll = async (expectedCalls) => {
    await waitFor(() => sleeps.length > 0, "poll sleep");
    sleeps.shift().resolve();
    await waitFor(
      () => Number(readFileSync(adapterCalls, "utf8")) === expectedCalls,
      `poll ${expectedCalls}`,
    );
    await waitFor(() => sleeps.length > 0, `poll ${expectedCalls} completed`);
  };
  for (let calls = 2; calls <= 4; calls += 1) await advancePoll(calls);
  const [coverageGap] = mailbox.readMailboxEvents(directory);
  assert.equal(coverageGap.event.type, "CI_COVERAGE_UNAVAILABLE");
  assert.equal(coverageGap.event.sha, shaA);
  assert.equal(mailbox.readRevisionCoverage(directory)[0].state, "uncovered");

  const setAttempts = (attempts) =>
    writeFileSync(adapterState, JSON.stringify({ attempts }));
  setAttempts([
    {
      runId: "run:A",
      attemptId: "attempt/pending",
      sha: shaA,
      outcome: "pending",
    },
  ]);
  await advancePoll(5);
  assert.deepEqual(mailbox.readRevisionCoverage(directory)[0], {
    sha: shaA,
    state: "pending",
    missingPolls: 0,
    checkedBy: { runId: "run:A", attemptId: "attempt/pending" },
  });
  setAttempts([
    {
      runId: "run:A",
      attemptId: "attempt/success",
      sha: shaA,
      outcome: "success",
    },
  ]);
  await advancePoll(6);
  assert.deepEqual(mailbox.readRevisionCoverage(directory)[0].checkedBy, {
    runId: "run:A",
    attemptId: "attempt/success",
  });
  assert.deepEqual(
    mailbox.readMailboxEvents(directory).map(({ event }) => event.type),
    ["CI_COVERAGE_UNAVAILABLE"],
  );

  writeFileSync(join(project, "application.txt"), "C\n");
  await git(project, "commit", "-am", "repair C");
  const shaC = await deliver();
  setAttempts([
    {
      runId: "run:A",
      attemptId: "attempt/success",
      sha: shaA,
      outcome: "success",
    },
    {
      runId: "run:C",
      attemptId: "attempt/pending",
      sha: shaC,
      outcome: "pending",
    },
  ]);
  await advancePoll(7);
  mailbox.requestMailboxStop(directory, { root: project, storage });
  await worker;

  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.deepEqual(terminal.coverage.unproved, [
    { sha: shaC, state: "pending" },
  ]);
  assert.equal(
    mailbox.readRevisionCoverage(directory).find(({ sha }) => shaA === sha)
      .state,
    "success",
  );
  assert.equal(
    mailbox
      .readMailboxEvents(directory)
      .some(({ event }) => event.type === "CI_FAILURE"),
    false,
  );
});
