import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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

// Starts the real command in the watching checkout with a sub-second interval,
// passing `args` (refs, `--deadline`, `--duration-minutes`) through unchanged.
export function startWait(t, watcher, ...args) {
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
