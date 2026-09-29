// Shared Git helpers for the publication runtime modules and their proofs.
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { exec, git, lsRemoteSha, revParse } from "./publication-git.mjs";

// `lsRemoteSha` resolves a ref on a bare remote directly (not the checkout's
// cached remote-tracking ref), so proof about "the bare origin itself" is
// genuine.
export { exec, git, lsRemoteSha, revParse };

export async function indexLockPath(checkout) {
  const printed = (
    await git(checkout, "rev-parse", "--git-path", "index.lock")
  ).stdout.trim();
  return isAbsolute(printed) ? printed : join(checkout, printed);
}

export async function messageCount(repo, ref, message) {
  const log = (await git(repo, "log", "--format=%s", ref)).stdout
    .trim()
    .split("\n");
  return log.filter((line) => line === message).length;
}

export async function worktreeCount(repo) {
  const { stdout } = await git(repo, "worktree", "list", "--porcelain");
  return stdout.split("\n\n").filter((block) => block.trim() !== "").length;
}

// Work-creation records live under this per-worktree prefix.
const createdForRoot = "refs/worktree/dough/created-for/";

// The work-creation records `cwd`'s worktree lists, each as "ref sha".
export async function createdForRecords(cwd) {
  const { stdout } = await git(
    cwd,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    createdForRoot,
  );
  return stdout.trim().split("\n").filter(Boolean);
}

// The one record of a workspace created for `identity` at `sha`.
export const createdFor = (identity, sha) => [
  `${createdForRoot}${identity} ${sha}`,
];

export {
  maintenanceFromInspection,
  originTrackingRef,
  targetBranchName,
} from "./publication-git.mjs";

// Push one exact candidate SHA to the caller's authorized target. This does
// not check out or fast-forward the default checkout, and it does not update
// any other remote ref.
export async function pushExactRef(workspace, sha, targetRef) {
  await git(workspace, "push", "origin", `${sha}:${targetRef}`);
}

export async function pushCandidate(workspace, sha) {
  await pushExactRef(workspace, sha, "refs/heads/main");
}

// Pending human edit: staged content, an unstaged change to a tracked file,
// and an untracked file. Publication must leave all three untouched.
export async function plantHumanEdit(checkout) {
  writeFileSync(join(checkout, "human-staged.txt"), "human index\n");
  await git(checkout, "add", "human-staged.txt");
  writeFileSync(
    join(checkout, "trunk.txt"),
    "base\nhuman changed tracked file\n",
  );
  writeFileSync(join(checkout, "human-unstaged.txt"), "human working tree\n");
}

export async function remoteHeads(origin) {
  const { stdout } = await exec("git", ["ls-remote", "--heads", origin]);
  return stdout.trim();
}

export async function plantedHumanEditBytes(checkout) {
  return {
    staged: readFileSync(join(checkout, "human-staged.txt"), "utf8"),
    tracked: readFileSync(join(checkout, "trunk.txt"), "utf8"),
    untracked: readFileSync(join(checkout, "human-unstaged.txt"), "utf8"),
    status: (await git(checkout, "status", "--porcelain")).stdout,
  };
}

// The parents and changed paths of one commit.
export async function commitParentsAndPaths(checkout, sha) {
  const [parents, ...paths] = (
    await git(checkout, "show", "--format=%P", "--name-only", sha)
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
  return { parents: parents.split(" "), paths };
}

export async function captureCheckout(checkout) {
  return {
    head: await revParse(checkout, "HEAD"),
    status: (await git(checkout, "status", "--porcelain")).stdout,
    staged: (await git(checkout, "diff", "--cached")).stdout,
    unstaged: (await git(checkout, "diff")).stdout,
    index: (await git(checkout, "ls-files", "-s")).stdout,
  };
}

export function assertCheckoutUnchanged(before, after) {
  assert.deepEqual(after, before);
}

export async function assertRemoteCandidate(origin, candidateSha) {
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), candidateSha);
}

// Clones `origin` into `checkout` with its own committer identity, so another
// writer can commit there without relying on a global Git identity.
export async function cloneAsAnotherWriter(origin, checkout) {
  await exec("git", ["clone", "-q", origin, checkout]);
  await git(checkout, "config", "user.name", "Another Writer");
  await git(checkout, "config", "user.email", "another@example.test");
}

// Another writer advances the authorized remote's branch (main by default)
// with one disjoint commit from a separate clone. The clone is removed after
// the push.
export async function advanceOriginFromAnotherWriter(
  origin,
  {
    file = "other-writer.txt",
    body = "their work\n",
    message = "another writer's own increment",
    branch = "main",
  } = {},
) {
  const thirdCheckout = (await exec("mktemp", ["-d"])).stdout.trim();
  await cloneAsAnotherWriter(origin, thirdCheckout);
  await git(thirdCheckout, "checkout", "-q", branch);
  writeFileSync(join(thirdCheckout, file), body);
  await git(thirdCheckout, "add", file);
  await git(thirdCheckout, "commit", "-m", message);
  await git(thirdCheckout, "push", "origin", branch);
  const disjointSha = await lsRemoteSha(origin, `refs/heads/${branch}`);
  rmSync(thirdCheckout, { recursive: true, force: true });
  return disjointSha;
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

// Shared final-state proof when the owned candidate already is the default
// checkout's branch tip (a claim committed there). Owned-workspace publication
// uses assertRemoteCandidate plus assertCheckoutUnchanged instead: remote
// acceptance does not require this checkout to move.
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

// Builds the fixture used by publication.test.mjs: a disposable repository
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
