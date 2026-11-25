import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "../../support/makeMe.mjs";
import { backlogOf } from "../../support/product-backlog-fixture.mjs";
import {
  cloneAsAnotherWriter,
  exec,
  git,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const itemA = "- [Item A](seeds/A.md#a)";
export const itemB = "- [Item B](seeds/B.md#b)";
export const itemC = "- [Item C](seeds/C.md#c)";
export const itemD = "- [Item D](seeds/D.md#d)";
export const ownedD = "- [Item D, owned](seeds/D.md#d)";
export const siblingB = "- [Item B, sibling](seeds/B.md#b)";
export const otherD = "- [Item D, other writer](seeds/D.md#d)";

// A trunk whose backlog holds items A to D beside unaffected `trunk.txt`
// content, and a workspace on exec/story one unpublished commit ahead that
// changes the backlog to `ownedBacklog` and adds `increment.txt`.
export function backlogSuffixDescription(ownedBacklog) {
  return makeMe.aRepository
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
}

export async function createBacklogSuffixFixture(ownedBacklog) {
  const description = backlogSuffixDescription(ownedBacklog);
  return { ...(await materializeRepository(description)), description };
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
