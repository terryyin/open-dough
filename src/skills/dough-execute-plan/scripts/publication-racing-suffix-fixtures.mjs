// Git mechanics helpers for one rejected push of an owned backlog suffix:
// replay that suffix once through the backlog rebase adapter, then one retry
// push. A conflict or a second rejection returns without another replay.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  exec,
  git,
  lsRemoteSha,
  pushCandidate,
  revParse,
} from "./publication-test-fixtures.mjs";

const rebaseCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog-git-rebase.mjs",
    import.meta.url,
  ),
);

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const itemA = "- [Item A](seeds/A.md#a)";
export const itemB = "- [Item B](seeds/B.md#b)";
export const itemC = "- [Item C](seeds/C.md#c)";
export const itemD = "- [Item D](seeds/D.md#d)";
export const ownedD = "- [Item D, owned](seeds/D.md#d)";
export const siblingB = "- [Item B, sibling](seeds/B.md#b)";
export const otherD = "- [Item D, other writer](seeds/D.md#d)";

export async function rebaseOwnedSuffix({ cwd, onto, upstream, branch }) {
  try {
    const { stdout, stderr } = await exec(process.execPath, [
      rebaseCli,
      "rebase",
      "--onto",
      onto,
      "--ref",
      upstream,
      "--branch",
      branch,
      "--cwd",
      cwd,
    ]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    return {
      code: error.code ?? 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

export async function pushRejected(workspace, sha) {
  try {
    await pushCandidate(workspace, sha);
    return false;
  } catch (error) {
    const text = `${error.message}\n${error.stderr ?? ""}`;
    if (!/! \[rejected\]/.test(text)) {
      throw error;
    }
    return true;
  }
}

export async function rebaseInProgress(cwd) {
  for (const name of ["rebase-merge", "rebase-apply"]) {
    const path = (
      await git(cwd, "rev-parse", "--git-path", name)
    ).stdout.trim();
    if (existsSync(resolve(cwd, path))) {
      return true;
    }
  }
  return false;
}

export async function publishRacingSuffix({
  workspace,
  origin,
  candidateSha,
  previouslyPublishedBase,
  branch,
  affectedCheck,
  beforeRetryPush,
}) {
  if (!(await pushRejected(workspace, candidateSha))) {
    return { status: "published", sha: candidateSha, replays: 0 };
  }
  await git(workspace, "fetch", "origin");
  const fetched = await revParse(workspace, "origin/main");
  const replay = await rebaseOwnedSuffix({
    cwd: workspace,
    onto: fetched,
    upstream: previouslyPublishedBase,
    branch,
  });
  if (replay.code !== 0) {
    return {
      status: "preserved",
      reason: "conflict",
      candidateSha,
      remoteSha: await lsRemoteSha(origin, "refs/heads/main"),
      replay,
      replays: 1,
    };
  }
  const rewritten = await revParse(workspace, branch);
  await affectedCheck(rewritten);
  if (beforeRetryPush) {
    await beforeRetryPush();
  }
  if (await pushRejected(workspace, rewritten)) {
    return {
      status: "preserved",
      reason: "persistent-contention",
      localSha: rewritten,
      remoteSha: await lsRemoteSha(origin, "refs/heads/main"),
      replays: 1,
    };
  }
  return { status: "published", sha: rewritten, replays: 1 };
}

export async function createBacklogSuffixFixture(ownedBacklog) {
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "publication-race-")),
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
  mkdirSync(join(integration, ".planning"), { recursive: true });
  writeFileSync(
    join(integration, backlogPath),
    backlogOf([], [itemA, itemB, itemC, itemD]),
  );
  await git(integration, "add", "trunk.txt", backlogPath);
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");

  await git(integration, "branch", "exec/story");
  await git(integration, "worktree", "add", execution, "exec/story");
  await git(execution, "config", "user.name", "Execution Worktree");
  await git(execution, "config", "user.email", "execution@example.test");
  writeFileSync(join(execution, "increment.txt"), "increment\n");
  writeFileSync(join(execution, backlogPath), ownedBacklog);
  await git(execution, "add", "increment.txt", backlogPath);
  await git(execution, "commit", "-m", "verified increment");

  return {
    origin,
    integration,
    execution,
    trunkSha: await revParse(integration, "main"),
    candidateSha: await revParse(execution, "exec/story"),
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}

export async function advanceOriginBacklog(origin, backlog, message) {
  const writer = (await exec("mktemp", ["-d"])).stdout.trim();
  await exec("git", ["clone", origin, writer]);
  await git(writer, "config", "user.name", "Another Writer");
  await git(writer, "config", "user.email", "another@example.test");
  writeFileSync(join(writer, backlogPath), backlog);
  await git(writer, "add", backlogPath);
  await git(writer, "commit", "-m", message);
  await git(writer, "push", "origin", "main");
  const sha = await lsRemoteSha(origin, "refs/heads/main");
  rmSync(writer, { recursive: true, force: true });
  return sha;
}

export async function assertAffectedCombination(execution, sha) {
  assert.equal(
    (await git(execution, "show", `${sha}:${backlogPath}`)).stdout,
    backlogOf([], [itemA, siblingB, itemC, ownedD]),
    "affected check sees the owned backlog change and the sibling entry",
  );
  assert.equal(
    (await git(execution, "show", `${sha}:increment.txt`)).stdout,
    "increment\n",
  );
  assert.equal(
    (await git(execution, "show", `${sha}:trunk.txt`)).stdout,
    "base\n",
    "unaffected trunk content stays in the candidate and is not treated as the change under test",
  );
}
