// Git mechanics helpers for one rejected push of an owned backlog suffix:
// replay that suffix once through the backlog rebase adapter, then one retry
// push. A conflict or a second rejection returns without another replay.
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  cloneAsAnotherWriter,
  createCleanTrunkFixture,
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

// A trunk whose backlog holds items A to D beside unaffected `trunk.txt`
// content, and a workspace on exec/story one unpublished commit ahead that
// changes the backlog to `ownedBacklog` and adds `increment.txt`.
export async function createBacklogSuffixFixture(ownedBacklog) {
  const description = makeMe.aRepository
    .withRevision("trunk", {
      files: {
        "trunk.txt": "base\n",
        [backlogPath]: backlogOf([], [itemA, itemB, itemC, itemD]),
      },
      message: "base trunk commit",
    })
    .withWorkspace("exec/story", { from: "trunk" })
    .withUnpublishedRevision("increment", {
      files: { "increment.txt": "increment\n", [backlogPath]: ownedBacklog },
      message: "verified increment",
    })
    .please();
  return { ...(await createCleanTrunkFixture(description)), description };
}

export async function advanceOriginBacklog(
  origin,
  backlog,
  message,
  branch = "main",
) {
  const writer = (await exec("mktemp", ["-d"])).stdout.trim();
  await cloneAsAnotherWriter(origin, writer);
  await git(writer, "checkout", "-q", branch);
  mkdirSync(join(writer, ".planning"), { recursive: true });
  writeFileSync(join(writer, backlogPath), backlog);
  await git(writer, "add", backlogPath);
  await git(writer, "commit", "-m", message);
  await git(writer, "push", "origin", branch);
  const sha = await lsRemoteSha(origin, `refs/heads/${branch}`);
  rmSync(writer, { recursive: true, force: true });
  return sha;
}

// The files `revisions` declare besides the backlog.
const declaredFiles = (revisions) =>
  revisions
    .flatMap((revision) => Object.entries(revision.files ?? {}))
    .filter(([path]) => path !== backlogPath);

// `sha` combines the sibling's and the owned backlog entries, and keeps every
// other file the fixture's description declares on trunk and in the owned
// increment.
export async function assertAffectedCombination(
  { execution, description },
  sha,
) {
  const show = async (path) =>
    (await git(execution, "show", `${sha}:${path}`)).stdout;
  assert.equal(
    await show(backlogPath),
    backlogOf([], [itemA, siblingB, itemC, ownedD]),
    "affected check sees the owned backlog change and the sibling entry",
  );
  for (const [path, content] of declaredFiles(description.workspace.revisions))
    assert.equal(await show(path), String(content));
  for (const [path, content] of declaredFiles(description.revisions))
    assert.equal(
      await show(path),
      String(content),
      "unaffected trunk content stays in the candidate and is not treated as the change under test",
    );
}
