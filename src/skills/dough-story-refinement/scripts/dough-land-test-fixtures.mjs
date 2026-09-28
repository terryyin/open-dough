// Git model of the Dough Land sequence for tests (not guidance-following).
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
import {
  ongoingOperation,
  refreshDefaultCheckout,
} from "../../dough-execute-plan/scripts/maintain-default-checkout.mjs";
import {
  git,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  managementContext,
  resolveManagementContext,
} from "../../dough-execute-plan/scripts/publication-git.mjs";

// The reviewed worktree holds a committed seed draft plus uncommitted edits: a
// changed tracked file and a new untracked plan.
export function planReviewedEdits(worktree) {
  writeFileSync(
    join(worktree, "seed-draft.md"),
    "SEED-1: refined goal, scope, and key examples\n",
  );
  writeFileSync(join(worktree, "plan-draft.md"), "PLAN-1: two slices\n");
}

// Retirement observed from the repository: the fetched target contains the
// accepted SHA and the retired branch is gone.
export async function assertRetiredFrom(
  repository,
  branch,
  acceptedSha,
  remoteRef,
) {
  await git(repository, "fetch", "-q", remoteRef.split("/")[0]);
  await git(repository, "merge-base", "--is-ancestor", acceptedSha, remoteRef);
  await assert.rejects(
    git(repository, "rev-parse", "--verify", `refs/heads/${branch}`),
  );
}

// Git mechanics for Dough Land "Retire the worktree", which preparation's
// "Close or retain the workspace" links. Containment in the fetched authorized
// remote target comes first: a default checkout may still lag after
// publication, or be absent. Then `git worktree remove` for a clean,
// session-created worktree, then a safe (non-force) branch deletion, all from
// the retained management context. The confirmed-disposition and
// session-created facts are supplied by the caller, not derived by scanning
// file content.
export async function closeOrRetainWorkspace({
  preparation,
  preparationBranch,
  confirmedDisposition,
  sessionCreated,
  repository,
  remote = "origin",
  targetBranch = "main",
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
  const management = await resolveManagementContext(repository, preparation);
  const remoteRef = `${remote}/${targetBranch}`;
  await git(management, "fetch", remote);
  if (!(await isAncestor(management, preparationBranch, remoteRef))) {
    return retained(
      "branch is not contained in the fetched authorized remote target",
    );
  }
  await git(management, "worktree", "remove", preparation);
  // `git branch -d` treats a branch as merged when its tip is in its
  // upstream, so point the upstream at the fetched target first. Never
  // force-delete.
  await git(
    management,
    "branch",
    `--set-upstream-to=${remoteRef}`,
    preparationBranch,
  );
  await git(management, "branch", "-d", preparationBranch);
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

async function topLevel(checkout) {
  try {
    return (await git(checkout, "rev-parse", "--show-toplevel")).stdout.trim();
  } catch {
    // An unusable default checkout path is not the worktree being landed.
    return null;
  }
}

// Git mechanics for the Dough Land sequence (not guidance-following): resolve
// the worktree, its management context, and the target; commit everything in
// the worktree; publish through the shared publisher; attempt the shared
// optional default-checkout refresh; then retire. With no default checkout the
// refresh is not applicable. A rerun starts from real Git state: nothing to
// commit creates no commit, and a tip the fetched target already contains is
// not pushed again. Every stop keeps all resources and names the unfinished
// step. `beforePush` lets a test race another writer against the push.
export async function landWorktree({
  worktree,
  branch,
  defaultCheckout,
  remote = "origin",
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
  const worktreeTop = await topLevel(worktree);
  if (defaultCheckout && (await topLevel(defaultCheckout)) === worktreeTop) {
    return { stopped: "default-checkout", commit: "none", ...notDone };
  }
  const repository = await managementContext(worktree);
  const operation = await ongoingOperation(worktree);
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

  const targetBranch = target.slice("refs/heads/".length);
  await git(worktree, "fetch", remote);
  const remoteRef = `${remote}/${targetBranch}`;
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
      remote,
      validate: () => true,
      beforePush,
    });
    if (!publication.ok) {
      return { stopped: "publish", commit, publication, ...notDone };
    }
    publication = { ...publication, pushed: true };
  }

  const refresh = await refreshDefaultCheckout({
    checkout: defaultCheckout,
    remote,
    integrationBranch: targetBranch,
  });
  const cleanup = await closeOrRetainWorkspace({
    preparation: worktree,
    preparationBranch: branch,
    confirmedDisposition: true,
    sessionCreated,
    repository,
    remote,
    targetBranch,
  });
  return { stopped: null, commit, publication, refresh, cleanup, repository };
}
