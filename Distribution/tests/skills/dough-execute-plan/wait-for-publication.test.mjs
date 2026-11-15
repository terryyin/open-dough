import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  exec,
  git,
} from "../../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { until } from "../../support/local-test-suite-fixtures.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { commitDeclaredRevision } from "../../support/repository-revision-commit.mjs";

const script = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/scripts/wait-for-publication.mjs",
    import.meta.url,
  ),
);

const outcomePath = "docs/supplier-outcome.md";
const minuteMs = 60_000;
const briefly = ["--duration-minutes", "0.05"];
const beyondLoadedStartUp = ["--duration-minutes", "0.25"];
const watchedOutcome = ["--ref", `main:${outcomePath}`];
const delivered = { [outcomePath]: "delivered\n" };

// A remote whose trunk holds `files`, the supplier's checkout that publishes
// to it, and the watching checkout: a separate clone of that remote.
async function watchedRemote(t, files = { [outcomePath]: "paused\n" }) {
  const described = await materializeRepository(
    makeMe.aRepository.withRevision("start", { backlog: null, files }).please(),
  );
  t.after(described.cleanup);
  const parent = mkdtempSync(join(tmpdir(), "wait-for-publication-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const watcher = join(parent, "watcher");
  await exec("git", ["clone", "--quiet", described.origin, watcher]);
  return { remote: described.origin, supplier: described.integration, watcher };
}

async function objectAt(checkout, revision) {
  return (await git(checkout, "rev-parse", revision)).stdout.trim();
}

// The supplier pushes one commit holding `files` to `ref` on the remote.
async function publish(supplier, ref, files) {
  const commit = await commitDeclaredRevision(supplier, {
    name: `publish to ${ref}`,
    files,
  });
  await git(supplier, "push", "origin", `${commit}:refs/heads/${ref}`);
  return commit;
}

// Starts the real command in the watching checkout with a sub-second interval.
function startWait(t, watcher, ...args) {
  const child = spawn(
    process.execPath,
    [script, "--remote", "origin", "--interval-seconds", "0.05", ...args],
    { cwd: watcher },
  );
  t.after(() => child.kill("SIGKILL"));
  const wait = { stdout: "", stderr: "" };
  for (const name of ["stdout", "stderr"])
    child[name].on("data", (chunk) => {
      wait.printedAt ??= Date.now();
      wait[name] += chunk;
    });
  wait.ended = new Promise((resolve) =>
    child.on("close", (code) => resolve({ code, endedAt: Date.now() })),
  );
  return wait;
}

// What the watching checkout last fetched: empty after a failed observation.
function lastFetched(watcher) {
  try {
    return readFileSync(join(watcher, ".git", "FETCH_HEAD"), "utf8");
  } catch {
    return null;
  }
}

function observed(watcher, commit) {
  return until(`the wait observes ${commit}`, () =>
    lastFetched(watcher)?.includes(commit),
  );
}

// The one result line a finished wait printed, with nothing on stderr.
async function onlyResult(wait) {
  const { code } = await wait.ended;
  assert.equal(wait.stderr, "");
  assert.equal(code, 0);
  assert.match(wait.stdout, /^[^\n]+\n$/);
  return JSON.parse(wait.stdout);
}

test("a push touching no watched path prints nothing, and a push to a watched path ends the wait with one result naming the change and the deadline", async (t) => {
  const { supplier, watcher } = await watchedRemote(t);
  const start = await objectAt(supplier, "HEAD");
  const deadline = new Date(Date.now() + 60 * minuteMs).toISOString();
  const wait = startWait(t, watcher, ...watchedOutcome, "--deadline", deadline);
  await observed(watcher, start);

  const unrelated = await publish(supplier, "main", { "src/other.md": "x\n" });
  await observed(watcher, unrelated);
  assert.equal(wait.stdout + wait.stderr, "");

  const published = await publish(supplier, "main", delivered);

  assert.deepEqual(await onlyResult(wait), {
    result: "publication",
    remote: "origin",
    changes: [
      {
        ref: "main",
        path: outcomePath,
        before: await objectAt(supplier, `${start}:${outcomePath}`),
        after: await objectAt(supplier, `${published}:${outcomePath}`),
      },
    ],
    deadline,
  });
  assert.equal((await git(watcher, "status", "--porcelain")).stdout, "");
});

test("a supplier branch watched whole beside a path on the target stays silent across an unrelated push to the target, and a push to the branch touching no watched path ends the wait naming that ref", async (t) => {
  const { supplier, watcher } = await watchedRemote(t);
  const start = await objectAt(supplier, "HEAD");
  await git(supplier, "push", "--quiet", "origin", "HEAD:refs/heads/supplier");
  const wait = startWait(t, watcher, "--ref", "supplier", ...watchedOutcome);
  await observed(watcher, start);

  const unrelated = await publish(supplier, "main", { "src/other.md": "x\n" });
  await observed(watcher, unrelated);
  assert.equal(wait.stdout + wait.stderr, "");
  const published = await publish(supplier, "supplier", { "any.md": "x\n" });

  assert.deepEqual((await onlyResult(wait)).changes, [
    { ref: "supplier", before: start, after: published },
  ]);
});

test("a watched path that first appears on the ref ends the wait", async (t) => {
  const { supplier, watcher } = await watchedRemote(t, { "README.md": "x\n" });
  const start = await objectAt(supplier, "HEAD");
  const wait = startWait(t, watcher, ...watchedOutcome);
  await observed(watcher, start);

  const published = await publish(supplier, "main", delivered);

  assert.deepEqual((await onlyResult(wait)).changes, [
    {
      ref: "main",
      path: outcomePath,
      before: null,
      after: await objectAt(supplier, `${published}:${outcomePath}`),
    },
  ]);
});

for (const [name, duration, minutes] of [
  ["defaults to 60 minutes", [], 60],
  ["follows the named duration", ["--duration-minutes", "90"], 90],
]) {
  test(`the deadline ${name} from the start of the wait`, async (t) => {
    const { supplier, watcher } = await watchedRemote(t);
    const startedAfter = Date.now();
    const wait = startWait(t, watcher, "--ref", "main", ...duration);
    await observed(watcher, await objectAt(supplier, "HEAD"));
    const startedBefore = Date.now();

    await publish(supplier, "main", delivered);

    const deadline = Date.parse((await onlyResult(wait)).deadline);
    assert.ok(deadline >= startedAfter + minutes * minuteMs);
    assert.ok(deadline <= startedBefore + minutes * minuteMs);
  });
}

test("a rerun given the returned deadline prints one deadline result at that time", async (t) => {
  const { supplier, watcher } = await watchedRemote(t);
  const first = startWait(t, watcher, ...watchedOutcome, ...briefly);
  await observed(watcher, await objectAt(supplier, "HEAD"));
  await publish(supplier, "main", { [outcomePath]: "not yet\n" });
  const { deadline } = await onlyResult(first);

  const rerun = startWait(t, watcher, "--ref", "main", "--deadline", deadline);

  assert.deepEqual(await onlyResult(rerun), {
    result: "deadline",
    remote: "origin",
    deadline,
  });
  assert.ok((await rerun.ended).endedAt >= Date.parse(deadline));
});

test("arguments that name no ref end at once with the usage", async (t) => {
  const wait = startWait(t, tmpdir());

  assert.equal((await wait.ended).code, 2);
  assert.equal(wait.stdout, "");
  assert.match(wait.stderr, /at least one --ref\nUsage: /);
});

test("a first observation that cannot read the remote ends at once with its error", async (t) => {
  const { remote, watcher } = await watchedRemote(t);
  renameSync(remote, `${remote}.away`);

  const wait = startWait(t, watcher, "--ref", "main");

  assert.equal((await wait.ended).code, 1);
  assert.equal(wait.stdout, "");
  assert.match(wait.stderr, /cannot read main from origin: .*repository/s);
});

test("a later observation that cannot read the remote is retried silently", async (t) => {
  const { remote, supplier, watcher } = await watchedRemote(t);
  const start = await objectAt(supplier, "HEAD");
  const wait = startWait(t, watcher, "--ref", "main");
  await observed(watcher, start);

  renameSync(remote, `${remote}.away`);
  await until("an observation fails", () => lastFetched(watcher) === "");
  assert.equal(wait.stdout + wait.stderr, "");
  renameSync(`${remote}.away`, remote);
  const published = await publish(supplier, "main", { "any.md": "x\n" });

  assert.deepEqual((await onlyResult(wait)).changes, [
    { ref: "main", before: start, after: published },
  ]);
});

test("a remote that stays unreadable after the first observation prints nothing until one deadline result", async (t) => {
  const { remote, supplier, watcher } = await watchedRemote(t);
  const wait = startWait(t, watcher, ...watchedOutcome, ...beyondLoadedStartUp);
  await observed(watcher, await objectAt(supplier, "HEAD"));

  renameSync(remote, `${remote}.away`);

  const result = await onlyResult(wait);
  assert.equal(lastFetched(watcher), "");
  assert.equal(result.result, "deadline");
  assert.ok(wait.printedAt >= Date.parse(result.deadline));
});
