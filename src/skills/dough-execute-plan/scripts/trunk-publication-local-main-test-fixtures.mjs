import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

export const exec = promisify(execFile);

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

export async function revParse(cwd, ref) {
  return (await git(cwd, "rev-parse", ref)).stdout.trim();
}

// Resolves a ref on a bare remote directly (not the checkout's cached
// remote-tracking ref), so proof about "the bare origin itself" is genuine.
export async function lsRemoteSha(remote, ref) {
  const { stdout } = await exec("git", ["ls-remote", remote, ref]);
  return stdout.trim().split(/\s+/)[0];
}

// Shared precondition step (publish-the-candidate.md's "Publish the
// candidate" step 1): fetch the authorized remote and confirm the checkout
// observed the pre-publication trunk before any reconciliation is attempted.
export async function fetchAndAssertOriginMain(integration, expectedSha) {
  await git(integration, "fetch", "origin");
  assert.equal(
    await revParse(integration, "origin/main"),
    expectedSha,
    "fetch must observe the pre-publication trunk before reconciling",
  );
}

// Shared final-state proof for publish-the-candidate.md's "Publish the
// candidate" step 6 and "Recover a rejected push" step 5: local main (the
// integration checkout) and the bare origin itself agree on the same
// published SHA, main and origin/main have converged (0/0), and the
// integration checkout is left clean. When an execution worktree applies
// (always for an increment), pass `execution` so its branch is checked
// against the same SHA too; a caller with no execution checkout at all (for
// example a preparation workspace's keep-and-publish, which never has an
// `exec/story` branch) omits it.
export async function assertPublicationAgreement(
  { origin, integration, execution },
  publishedSha,
  cleanStatusMessage,
) {
  assert.equal(await revParse(integration, "main"), publishedSha);
  assert.equal(await revParse(integration, "origin/main"), publishedSha);
  if (execution !== undefined) {
    assert.equal(await revParse(execution, "exec/story"), publishedSha);
  }
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), publishedSha);

  const counts = (
    await git(
      integration,
      "rev-list",
      "--left-right",
      "--count",
      "main...origin/main",
    )
  ).stdout.trim();
  assert.equal(counts, "0\t0");

  const status = (await git(integration, "status", "--porcelain")).stdout;
  assert.equal(status, "", cleanStatusMessage);
}

// Builds the fixture named in Slice 1 of
// .planning/quick/033-synchronize-local-main-after-trunk-publication/PLAN.md:
// a disposable repository whose primary checkout (the shared "integration
// checkout") is clean `main` at the same SHA as `origin/main` (a local bare
// repo), plus an execution worktree whose unpublished suffix is already
// based on that trunk. Exported so every test in
// trunk-publication-local-main.test.mjs can build on the same clean-trunk
// starting point before diverging it.
export async function createCleanTrunkFixture() {
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "trunk-publication-local-main-")),
  );
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");
  const execution = join(fixture, "execution");

  await exec("git", ["init", "--bare", "-b", "main", origin]);

  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  writeFileSync(join(integration, "trunk.txt"), "base\n");
  await git(integration, "add", "trunk.txt");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");

  await git(integration, "branch", "exec/story");
  await git(integration, "worktree", "add", execution, "exec/story");
  await git(execution, "config", "user.name", "Execution Worktree");
  await git(execution, "config", "user.email", "execution@example.test");

  writeFileSync(join(execution, "increment.txt"), "increment\n");
  await git(execution, "add", "increment.txt");
  await git(execution, "commit", "-m", "verified increment");

  const trunkSha = await revParse(integration, "main");
  const candidateSha = await revParse(execution, "exec/story");

  return {
    fixture,
    origin,
    integration,
    execution,
    trunkSha,
    candidateSha,
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}
