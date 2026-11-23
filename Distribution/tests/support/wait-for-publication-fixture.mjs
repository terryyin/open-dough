import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  exec,
  git,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { until } from "./local-test-suite-fixtures.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import { commitDeclaredRevision } from "./repository-revision-commit.mjs";

const script = fileURLToPath(
  new URL(
    "../../src/skills/dough-execute-plan/scripts/wait-for-publication.mjs",
    import.meta.url,
  ),
);

export const outcomePath = "docs/supplier-outcome.md";
export const watchedOutcome = ["--ref", `main:${outcomePath}`];
export const delivered = { [outcomePath]: "delivered\n" };

// A remote whose trunk holds `files`, the supplier's checkout that publishes
// to it, and the watching checkout: a separate clone of that remote.
export async function watchedRemote(t, files = { [outcomePath]: "paused\n" }) {
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

export async function objectAt(checkout, revision) {
  return (await git(checkout, "rev-parse", revision)).stdout.trim();
}

// The supplier pushes one commit holding `files` to `ref` on the remote.
export async function publish(supplier, ref, files) {
  const commit = await commitDeclaredRevision(supplier, {
    name: `publish to ${ref}`,
    files,
  });
  await git(supplier, "push", "origin", `${commit}:refs/heads/${ref}`);
  return commit;
}

// The one change a publication of `commit` to the outcome on main makes, from
// the `before` object.
export async function outcomeChange(supplier, before, commit) {
  return {
    ref: "main",
    path: outcomePath,
    before,
    after: await objectAt(supplier, `${commit}:${outcomePath}`),
  };
}

// Run the real CLI and Git with a test-only timer preload. No probe adds
// anything to the command's argument contract.
function launchWait(t, watcher, args, { clock, allowPoll = true } = {}) {
  const control = encodeURIComponent(`
    import timers from "node:timers/promises";
    import { readFileSync } from "node:fs";
    import { syncBuiltinESMExports } from "node:module";
    const clock = ${JSON.stringify(clock ?? null)};
    if (clock) Date.now = () => Number(readFileSync(clock, "utf8"));
    const pause = timers.setTimeout;
    timers.setTimeout = (ms, ...args) => {
      if (!${allowPoll}) throw new Error("the continued wait reached the poll timer");
      return pause(Math.min(ms, 50), ...args);
    };
    syncBuiltinESMExports();
  `);
  const child = spawn(
    process.execPath,
    [
      `--import=data:text/javascript,${control}`,
      script,
      "--remote",
      "origin",
      ...args,
    ],
    { cwd: watcher },
  );
  t.after(() => child.kill("SIGKILL"));
  const wait = { stdout: "", stderr: "" };
  for (const name of ["stdout", "stderr"])
    child[name].on("data", (chunk) => {
      wait[name] += chunk;
    });
  wait.ended = new Promise((resolve) => {
    child.on("close", (code) => resolve({ code }));
  });
  return wait;
}

export function startWait(t, watcher, ...args) {
  return launchWait(t, watcher, args);
}

export function continueBeforePolling(t, watcher, ...args) {
  return launchWait(t, watcher, args, { allowPoll: false });
}

export function startWaitWithClock(t, watcher, time, ...args) {
  const clock = join(watcher, ".git", "fixture-time");
  const advanceTo = (now) => {
    writeFileSync(`${clock}.pending`, String(now));
    renameSync(`${clock}.pending`, clock);
  };
  advanceTo(time);
  return Object.assign(launchWait(t, watcher, args, { clock }), { advanceTo });
}

// What the watching checkout last fetched: empty after a failed observation.
export function lastFetched(watcher) {
  try {
    return readFileSync(join(watcher, ".git", "FETCH_HEAD"), "utf8");
  } catch {
    return null;
  }
}

export function observed(watcher, commit) {
  return until(`the wait observes ${commit}`, () =>
    lastFetched(watcher)?.includes(commit),
  );
}

// The one result line a finished wait printed, with nothing on stderr.
export async function onlyResult(wait) {
  const { code } = await wait.ended;
  assert.equal(wait.stderr, "");
  assert.equal(code, 0);
  assert.match(wait.stdout, /^[^\n]+\n$/);
  return JSON.parse(wait.stdout);
}
