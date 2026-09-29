// Git model of the Dough Land sequence for tests (not guidance-following).
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
import {
  ongoingOperation,
  refreshDefaultCheckout,
} from "../../dough-execute-plan/scripts/maintain-default-checkout.mjs";
import {
  git,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { managementContext } from "../../dough-execute-plan/scripts/publication-git.mjs";
import {
  isAncestor,
  preserved,
} from "../../dough-land/scripts/worktree-retirement.mjs";

const retirementCommand = fileURLToPath(
  new URL("../../dough-land/scripts/worktree-retirement.mjs", import.meta.url),
);

// Dough Land's installed `retire` command, run as the agent runs it. Returns
// its exit code and the JSON result it prints; a retained worktree exits 1.
export async function runRetirementCommand({
  repository,
  worktree,
  branch,
  remote = "origin",
  targetRef = "refs/heads/main",
  identity,
  createdForWork,
}) {
  const args = [retirementCommand, "retire", "--repository", repository];
  args.push("--worktree", worktree, "--branch", branch, "--remote", remote);
  args.push("--target-ref", targetRef);
  if (identity) args.push("--identity", identity);
  if (createdForWork) args.push("--created-for-work");
  try {
    const { stdout } = await promisify(execFile)("node", args);
    return { code: 0, result: JSON.parse(stdout) };
  } catch (error) {
    if (error.code !== 1) throw error;
    return { code: 1, result: JSON.parse(error.stdout) };
  }
}

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

// Dough Land "Retire the worktree", which preparation's "Close or retain the
// workspace" links, through the installed retirement command, which holds the
// ownership gate. The confirmed-disposition, identity, and
// created-for-this-work facts are supplied by the caller, not derived by
// scanning file content.
export async function closeOrRetainWorkspace({
  preparation,
  preparationBranch,
  confirmedDisposition,
  identity,
  createdForWork,
  repository,
  remote = "origin",
  targetBranch = "main",
}) {
  if (!confirmedDisposition) {
    return preserved(
      "no confirmed disposition (publication unconfirmed, interrupted, or no decision made)",
      preparation,
      preparationBranch,
    );
  }
  const { result } = await runRetirementCommand({
    repository,
    worktree: preparation,
    branch: preparationBranch,
    remote,
    targetRef: `refs/heads/${targetBranch}`,
    identity,
    createdForWork,
  });
  return result;
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
  identity,
  createdForWork = true,
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
    identity,
    createdForWork,
    repository,
    remote,
    targetBranch,
  });
  return { stopped: null, commit, publication, refresh, cleanup, repository };
}
