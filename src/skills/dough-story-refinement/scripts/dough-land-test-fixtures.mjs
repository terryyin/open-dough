// Git model of the Dough Land sequence for tests (not guidance-following).
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
import { refreshDefaultCheckout } from "../../dough-execute-plan/scripts/maintain-default-checkout.mjs";
import {
  git,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";

// The reviewed worktree holds a committed seed draft plus uncommitted edits: a
// changed tracked file and a new untracked plan.
export function planReviewedEdits(worktree) {
  writeFileSync(
    join(worktree, "seed-draft.md"),
    "SEED-1: refined goal, scope, and key examples\n",
  );
  writeFileSync(join(worktree, "plan-draft.md"), "PLAN-1: two slices\n");
}

// Git mechanics for Dough Land "Retire the worktree", which preparation's
// "Close or retain the workspace" links. Containment in the fetched authorized
// remote comes first: the default checkout may still lag after publication.
// Then `git worktree remove` for a clean, session-created worktree, then a
// safe (non-force) branch deletion. The confirmed-disposition and
// session-created facts are supplied by the caller, not derived by scanning
// file content.
export async function closeOrRetainWorkspace({
  integration,
  preparation,
  preparationBranch,
  confirmedDisposition,
  sessionCreated,
}) {
  const retained = (reason) => ({
    removed: false,
    path: preparation,
    branch: preparationBranch,
    reason,
  });
  if (!confirmedDisposition) {
    return retained(
      "no confirmed disposition (publication unconfirmed, interrupted, or no decision made)",
    );
  }
  if (!sessionCreated) {
    return retained(
      "reused or host-owned workspace, not created by this session",
    );
  }
  const status = (await git(preparation, "status", "--porcelain")).stdout;
  if (status !== "") {
    return retained("workspace is not clean");
  }
  await git(integration, "fetch", "origin");
  if (!(await isAncestor(integration, preparationBranch, "origin/main"))) {
    return retained(
      "branch is not contained in the fetched authorized remote target",
    );
  }
  await git(integration, "worktree", "remove", preparation);
  // `git branch -d` treats a branch as merged when its tip is in its
  // upstream, so point the upstream at origin/main first. Never force-delete.
  await git(
    integration,
    "branch",
    "--set-upstream-to=origin/main",
    preparationBranch,
  );
  await git(integration, "branch", "-d", preparationBranch);
  return { removed: true, path: preparation, branch: preparationBranch };
}

async function isAncestor(cwd, ancestor, descendant) {
  try {
    await git(cwd, "merge-base", "--is-ancestor", ancestor, descendant);
    return true;
  } catch {
    return false;
  }
}

async function unfinishedOperation(worktree) {
  for (const ref of ["MERGE_HEAD", "REBASE_HEAD", "CHERRY_PICK_HEAD"]) {
    try {
      await git(worktree, "rev-parse", "-q", "--verify", ref);
      return ref;
    } catch {
      // absent
    }
  }
  const gitDir = (
    await git(worktree, "rev-parse", "--absolute-git-dir")
  ).stdout.trim();
  for (const dir of ["rebase-merge", "rebase-apply"]) {
    if (existsSync(join(gitDir, dir))) return dir;
  }
  return null;
}

// Git mechanics for the Dough Land sequence (not guidance-following): resolve
// the worktree and target, commit everything in the worktree, publish through
// the shared publisher, attempt the default-checkout refresh, then retire.
// A rerun starts from real Git state: nothing to commit creates no commit, and
// a tip the fetched target already contains is not pushed again. Every stop
// keeps all resources and names the unfinished step. `beforePush` lets a test
// race another writer against the push.
export async function landWorktree({
  worktree,
  branch,
  defaultCheckout,
  target = "refs/heads/main",
  sessionCreated = true,
  message = "Land reviewed worktree changes",
  beforePush,
}) {
  const notDone = { refresh: "not-attempted", cleanup: "not-performed" };
  if (!worktree || !branch) {
    return { stopped: "missing-worktree", commit: "none", ...notDone };
  }
  if (!target || !target.startsWith("refs/heads/")) {
    return { stopped: "missing-target", commit: "none", ...notDone };
  }
  const worktreeTop = (
    await git(worktree, "rev-parse", "--show-toplevel")
  ).stdout.trim();
  const defaultTop = (
    await git(defaultCheckout, "rev-parse", "--show-toplevel")
  ).stdout.trim();
  if (worktreeTop === defaultTop) {
    return { stopped: "default-checkout", commit: "none", ...notDone };
  }
  const operation = await unfinishedOperation(worktree);
  if (operation) {
    return {
      stopped: "unfinished-operation",
      operation,
      commit: "none",
      ...notDone,
    };
  }

  let commit = "nothing-to-commit";
  if ((await git(worktree, "status", "--porcelain")).stdout !== "") {
    await git(worktree, "add", "-A");
    await git(worktree, "commit", "-m", message);
    commit = "created";
  }

  await git(worktree, "fetch", "origin");
  const remoteRef = `origin/${target.slice("refs/heads/".length)}`;
  const tip = await revParse(worktree, branch);
  let publication;
  if (await isAncestor(worktree, tip, remoteRef)) {
    publication = { ok: true, publication: "already-accepted", pushed: false };
  } else {
    const base = (
      await git(worktree, "merge-base", branch, remoteRef)
    ).stdout.trim();
    publication = await publishExecutionIncrement({
      workspace: worktree,
      branch,
      previouslyPublishedBase: base,
      targetRef: target,
      validate: () => true,
      beforePush,
    });
    if (!publication.ok) {
      return { stopped: "publish", commit, publication, ...notDone };
    }
    publication = { ...publication, pushed: true };
  }

  const refresh = await refreshDefaultCheckout({ checkout: defaultCheckout });
  const cleanup = await closeOrRetainWorkspace({
    integration: defaultCheckout,
    preparation: worktree,
    preparationBranch: branch,
    confirmedDisposition: true,
    sessionCreated,
  });
  return { stopped: null, commit, publication, refresh, cleanup };
}
