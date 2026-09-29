#!/usr/bin/env node
// Dough Land "Retire the worktree": from the repository management context,
// retire a worktree created for this work once the fetched target contains its
// branch tip. Keeps a dirty, ambiguous, other-branch, not-owned, or uncontained
// worktree and branch; never forces, resets, or deletes a remote branch.
import { existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { isDirectCliEntry } from "../../dough-execute-plan/scripts/ci-direct-entry.mjs";
import {
  git,
  originTrackingRef,
  resolveManagementContext,
} from "../../dough-execute-plan/scripts/publication-git.mjs";

export const trunkTarget = "refs/heads/main";
const creationRefs = "refs/worktree/dough/created-for/";
export const notCreatedForWork =
  "reused, host-owned, or unrecorded workspace, not created for this work";

export function canonical(path) {
  return existsSync(path) ? realpathSync(path) : path;
}

// True when the Git command succeeds, false when it answers no (exit 1).
async function succeeds(repo, ...args) {
  try {
    await git(repo, ...args);
    return true;
  } catch (error) {
    if (error.code === 1) {
      return false;
    }
    throw error;
  }
}

export function isAncestor(repo, ancestor, descendant) {
  return succeeds(repo, "merge-base", "--is-ancestor", ancestor, descendant);
}

function refExists(repo, ref) {
  return succeeds(repo, "show-ref", "--verify", "--quiet", ref);
}

export async function findWorktree(repository, worktree) {
  const { stdout } = await git(repository, "worktree", "list", "--porcelain");
  const wanted = canonical(worktree);
  const blocks = stdout.split("\n\n").filter((block) => block.trim() !== "");
  for (const block of blocks) {
    const lines = block.split("\n");
    const path = lines
      .find((line) => line.startsWith("worktree "))
      ?.slice("worktree ".length);
    if (!path || canonical(path) !== wanted) {
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

export function preserved(reason, worktree, branch, extra = {}) {
  return {
    removed: false,
    partial: false,
    worktree: "preserved",
    branch: "preserved",
    reason,
    path: worktree,
    branchName: branch,
    ...extra,
  };
}

// A removal step ran but was not verified; `results` names what was done.
export function unverifiedRemoval(reason, worktree, branch, results = {}) {
  return preserved(reason, worktree, branch, { partial: true, ...results });
}

// One work-scoped ownership gate over the worktree's creation refs: a ref
// naming `identity` retires whichever session created it; one naming other
// work retains; without a ref, only the caller's created-for-this-work fact
// retires.
async function ownershipHold(worktree, identity, createdForWork) {
  const refs = await git(
    worktree,
    "for-each-ref",
    "--format=%(refname:lstrip=4)",
    creationRefs,
  );
  const works = refs.stdout.split("\n").filter((name) => name !== "");
  if (identity && works.includes(identity)) {
    return null;
  }
  if (works.length > 0) {
    return {
      reason: `created for other work: ${works.join(", ")}`,
      createdFor: works,
    };
  }
  return createdForWork === true ? null : { reason: notCreatedForWork };
}

// Remove the worktree and safely delete its branch, verified, accepting either
// already absent on a rerun. Once containment is known, `holdReason` may name a
// caller's own obligation that keeps both.
export async function retireWorktree({
  repository,
  worktree,
  branch,
  remote = "origin",
  targetRef = trunkTarget,
  identity,
  createdForWork = false,
  holdReason,
}) {
  const management = await resolveManagementContext(repository, worktree);
  if (!management) {
    return preserved("management context unavailable", worktree, branch);
  }
  const listed = await findWorktree(management, worktree);
  if ((!listed && existsSync(worktree)) || listed?.branch === null) {
    return preserved("ambiguous checkout", worktree, branch);
  }
  if (listed && listed.branch !== branch) {
    return preserved("another workspace", worktree, branch);
  }
  if (listed) {
    const hold = await ownershipHold(worktree, identity, createdForWork);
    if (hold) {
      const { reason, ...extra } = hold;
      return preserved(reason, worktree, branch, extra);
    }
    const status = (await git(worktree, "status", "--porcelain")).stdout;
    if (status !== "") {
      return preserved("dirty checkout", worktree, branch);
    }
  }
  await git(management, "fetch", remote);
  const tracking = originTrackingRef(targetRef, remote);
  const branchRef = `refs/heads/${branch}`;
  const branchPresent = await refExists(management, branchRef);
  const contained =
    !branchPresent || (await isAncestor(management, branch, tracking));
  const held =
    (await holdReason?.({ management, tracking, contained })) ||
    (!contained && "unique unpublished work");
  if (held) {
    return preserved(held, worktree, branch);
  }
  const worktreeResult = listed ? "removed" : "already-absent";
  if (listed) {
    await git(management, "worktree", "remove", worktree);
    if (await findWorktree(management, worktree)) {
      return unverifiedRemoval(
        "worktree removal was not verified",
        worktree,
        branch,
      );
    }
  }
  if (branchPresent) {
    // `git branch -d` treats a branch as merged when its tip is in its
    // upstream, so point the upstream at the fetched target. Never force.
    await git(management, "branch", `--set-upstream-to=${tracking}`, branch);
    await git(management, "branch", "-d", branch);
    if (await refExists(management, branchRef)) {
      return unverifiedRemoval(
        "local branch removal was not verified",
        worktree,
        branch,
        { worktree: worktreeResult },
      );
    }
  }
  return {
    removed: true,
    partial: false,
    worktree: worktreeResult,
    branch: branchPresent ? "removed" : "already-absent",
    reason: null,
    repository: management,
  };
}

const required = ["repository", "worktree", "branch", "remote", "targetRef"];
const usage =
  "usage: worktree-retirement.mjs retire --repository PATH --worktree PATH --branch NAME --remote NAME --target-ref REF [--identity WORK] [--created-for-work]";

function argumentsOf(argv) {
  if (argv[0] !== "retire") {
    throw new Error(usage);
  }
  const result = {};
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--created-for-work") {
      result.createdForWork = true;
      continue;
    }
    if (!flag.startsWith("--") || index + 1 >= argv.length) {
      throw new Error(`invalid argument ${flag}\n${usage}`);
    }
    const key = flag
      .slice(2)
      .replace(/-[a-z]/g, (match) => match[1].toUpperCase());
    result[key] = argv[++index];
  }
  for (const field of required) {
    if (!result[field]) {
      throw new Error(`missing ${field}\n${usage}`);
    }
  }
  return result;
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  let args;
  try {
    args = argumentsOf(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
  if (args) {
    const worktree = resolve(args.worktree);
    let result;
    try {
      result = await retireWorktree({
        ...args,
        repository: resolve(args.repository),
        worktree,
      });
    } catch (error) {
      // A failed Git step stops retirement; report what is known.
      result = { removed: false, reason: "git error", error: error.message };
    }
    process.stdout.write(
      `${JSON.stringify({ ok: result.removed, ...result })}\n`,
    );
    if (!result.removed) process.exitCode = 1;
  }
}
