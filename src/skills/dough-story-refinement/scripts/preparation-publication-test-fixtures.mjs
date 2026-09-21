import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  exec,
  git,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";

// Shared preparation-workspace fixture for the preparation publication tests.
// Git mechanics only: an integration checkout plus a separately branched
// preparation worktree holding one retained-record commit.

// Builds a disposable repository modeling preparation's own case: a bare
// origin at trunkSha, an "integration" checkout (this preparation's recorded
// integration checkout, per "Select or reuse the workspace"), and a
// "preparation" worktree -- a temporary branch/worktree pair created from
// trunkSha, per [own a temporary exploration workspace] "Select the
// checkout" -- holding one committed retained seed-draft record, matching
// "Keep and publish the retained result" step 1's already-committed case.
// `tmpPrefix` distinguishes each caller's disposable directories for easier
// debugging; it has no effect on the fixture's Git behavior.
export async function createPreparationFixture(tmpPrefix) {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), tmpPrefix)));
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");
  const preparation = join(fixture, "preparation");
  const preparationBranch = "prep/seed-1-refinement";

  await exec("git", ["init", "--bare", "-b", "main", origin]);

  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  writeFileSync(join(integration, "trunk.txt"), "base\n");
  await git(integration, "add", "trunk.txt");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");
  const trunkSha = await revParse(integration, "main");

  await git(
    integration,
    "worktree",
    "add",
    preparation,
    "-b",
    preparationBranch,
    trunkSha,
  );
  await git(preparation, "config", "user.name", "Preparation Workspace");
  await git(preparation, "config", "user.email", "preparation@example.test");

  writeFileSync(
    join(preparation, "seed-draft.md"),
    "SEED-1: refined goal and scope\n",
  );
  await git(preparation, "add", "seed-draft.md");
  await git(preparation, "commit", "-m", "Refine SEED-1 draft");
  const preparationSha = await revParse(preparation, preparationBranch);

  return {
    fixture,
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}

// Git mechanics for "Close or retain the workspace": `git worktree remove`,
// then safe branch deletion. Safe deletion follows the fetched authorized
// remote, because the default checkout may still lag after publication.
// The confirmed-disposition and session-created facts are supplied by the
// caller, not derived by scanning file content.
export async function closeOrRetainWorkspace({
  integration,
  preparation,
  preparationBranch,
  confirmedDisposition,
  sessionCreated,
}) {
  if (!confirmedDisposition) {
    return {
      removed: false,
      path: preparation,
      branch: preparationBranch,
      reason:
        "no confirmed disposition (publication unconfirmed, interrupted, or no decision made)",
    };
  }
  if (!sessionCreated) {
    return {
      removed: false,
      path: preparation,
      branch: preparationBranch,
      reason: "reused or host-owned workspace, not created by this session",
    };
  }
  const status = (await git(preparation, "status", "--porcelain")).stdout;
  if (status !== "") {
    return {
      removed: false,
      path: preparation,
      branch: preparationBranch,
      reason: "workspace is not clean",
    };
  }
  await git(integration, "worktree", "remove", preparation);
  // Safe deletion follows the fetched authorized remote, not the default
  // checkout's HEAD. `git branch -d` treats a branch as merged when that tip
  // is in its upstream, so point the upstream at origin/main first. Do not
  // force-delete a branch the remote does not contain.
  await git(integration, "fetch", "origin");
  try {
    await git(
      integration,
      "merge-base",
      "--is-ancestor",
      preparationBranch,
      "origin/main",
    );
  } catch {
    return {
      removed: false,
      path: preparation,
      branch: preparationBranch,
      reason:
        "worktree removed but branch is not contained in the fetched authorized remote target",
    };
  }
  await git(
    integration,
    "branch",
    "--set-upstream-to=origin/main",
    preparationBranch,
  );
  await git(integration, "branch", "-d", preparationBranch);
  return { removed: true, path: preparation, branch: preparationBranch };
}

export async function worktreeCount(integration) {
  const { stdout } = await git(integration, "worktree", "list", "--porcelain");
  return stdout.split("\n\n").filter((block) => block.trim() !== "").length;
}
