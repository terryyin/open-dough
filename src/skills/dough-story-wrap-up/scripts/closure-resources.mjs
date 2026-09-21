// Git mechanics (not guidance-following) for Trunk Mode execution-resource
// cleanup. Eligible removal is `git worktree remove` plus `git branch -d`
// only. This module does not delete a remote execution branch.
import { existsSync, realpathSync } from "node:fs";
import { git } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";

export const trunkTarget = "refs/heads/main";

function canonical(path) {
  return existsSync(path) ? realpathSync(path) : path;
}

export async function isAncestor(workspace, ancestor, descendant) {
  try {
    await git(workspace, "merge-base", "--is-ancestor", ancestor, descendant);
    return true;
  } catch (error) {
    if (error.code === 1) {
      return false;
    }
    throw error;
  }
}

async function refExists(repo, ref) {
  try {
    await git(repo, "show-ref", "--verify", "--quiet", ref);
    return true;
  } catch (error) {
    if (error.code === 1) {
      return false;
    }
    throw error;
  }
}

export async function findWorktree(integration, execution) {
  const { stdout } = await git(integration, "worktree", "list", "--porcelain");
  const wanted = canonical(execution);
  const blocks = stdout.split("\n\n").filter((block) => block.trim() !== "");
  for (const block of blocks) {
    const lines = block.split("\n");
    const pathLine = lines.find((line) => line.startsWith("worktree "));
    if (!pathLine) {
      continue;
    }
    const path = pathLine.slice("worktree ".length);
    if (canonical(path) !== wanted) {
      continue;
    }
    const branchLine = lines.find((line) => line.startsWith("branch "));
    return {
      path,
      branch: branchLine ? branchLine.slice("branch refs/heads/".length) : null,
    };
  }
  return null;
}

function preserved(reason, execution, branch) {
  return {
    removed: false,
    partial: false,
    worktree: "preserved",
    branch: "preserved",
    reason,
    path: execution,
    branchName: branch,
  };
}

function cleaned(worktree, branch) {
  return {
    removed: true,
    partial: false,
    worktree,
    branch,
    reason: null,
  };
}

function hostsThisWorktree(observer, execution) {
  if (!observer?.bound || observer.stopped) {
    return false;
  }
  if (!observer.checkout) {
    return true;
  }
  return canonical(observer.checkout) === canonical(execution);
}

function bothRegistered(observer, closureShas) {
  return (
    observer?.bound === true &&
    observer.stopped === true &&
    closureShas.every((sha) =>
      observer.receipts.some(
        (receipt) => receipt.sha === sha && receipt.target === trunkTarget,
      ),
    )
  );
}

function isNonEmpty(sha) {
  return typeof sha === "string" && sha !== "";
}

async function everyAncestor(workspace, shas, descendant) {
  for (const sha of shas) {
    if (!(await isAncestor(workspace, sha, descendant))) {
      return false;
    }
  }
  return true;
}

export async function removeExecutionResources({
  integration,
  execution,
  branch,
  observer,
  sessionOwned,
  closureShas,
}) {
  if (hostsThisWorktree(observer, execution)) {
    return preserved("active checkout-bound observer", execution, branch);
  }
  if (sessionOwned !== true) {
    return preserved("another workspace", execution, branch);
  }
  const listed = await findWorktree(integration, execution);
  if (!listed && existsSync(execution)) {
    return preserved("ambiguous checkout", execution, branch);
  }
  if (listed && listed.branch === null) {
    return preserved("ambiguous checkout", execution, branch);
  }
  if (listed && listed.branch !== branch) {
    return preserved("another workspace", execution, branch);
  }
  if (listed) {
    const status = (await git(execution, "status", "--porcelain")).stdout;
    if (status !== "") {
      return preserved("dirty checkout", execution, branch);
    }
  }
  await git(integration, "fetch", "origin");
  const shas = Array.isArray(closureShas) ? closureShas : [];
  const published =
    shas.length === 2 &&
    shas.every((sha) => isNonEmpty(sha)) &&
    (await everyAncestor(integration, shas, "origin/main"));
  const branchRef = `refs/heads/${branch}`;
  const branchPresent = await refExists(integration, branchRef);
  const branchContained =
    branchPresent && (await isAncestor(integration, branch, "origin/main"));
  if (!published || (branchPresent && !branchContained)) {
    return preserved("unique unpublished work", execution, branch);
  }
  if (!bothRegistered(observer, shas)) {
    return preserved("observer obligation unfinished", execution, branch);
  }
  if (listed) {
    await git(integration, "worktree", "remove", execution);
    if (await findWorktree(integration, execution)) {
      return {
        removed: false,
        partial: true,
        worktree: "preserved",
        branch: "preserved",
        reason: "worktree removal was not verified",
        path: execution,
        branchName: branch,
      };
    }
  }
  if (!branchPresent) {
    return cleaned(listed ? "removed" : "already-absent", "already-absent");
  }
  await git(integration, "branch", "--set-upstream-to=origin/main", branch);
  await git(integration, "branch", "-d", branch);
  if (await refExists(integration, branchRef)) {
    return {
      removed: false,
      partial: true,
      worktree: listed ? "removed" : "already-absent",
      branch: "preserved",
      reason: "local branch removal was not verified",
      path: execution,
      branchName: branch,
    };
  }
  return cleaned(listed ? "removed" : "already-absent", "removed");
}
