// The clean-trunk publication fixture and the authorized remotes its
// checkouts know.
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exec, git, revParse } from "./publication-git.mjs";

// Builds a clean-trunk publication fixture: a disposable repository
// whose primary checkout is clean `main` at the same SHA as `origin/main`
// (a local bare repo), plus an execution worktree whose unpublished suffix
// is already based on that trunk.
export async function createCleanTrunkFixture() {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "publication-")));
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

// The URL of `remote`: origin, or a new empty bare repository on `branch` the
// fixture's checkouts know by that name.
export async function authorizedRemote(fixture, remote, branch) {
  if (remote === "origin") return fixture.origin;
  const url = join(fixture.fixture, `${remote}.git`);
  await git(fixture.fixture, "init", "-q", "--bare", "-b", branch, url);
  await git(fixture.integration, "remote", "add", remote, url);
  return url;
}
