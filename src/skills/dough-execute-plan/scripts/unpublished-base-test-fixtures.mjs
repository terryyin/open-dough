// The developer's unpublished commit under an agent's commit in the default
// checkout, and the refusal that publishing over it must return.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  advanceOriginFromAnotherWriter,
  captureCheckout,
  commitParentsAndPaths,
  git,
  plantHumanEdit,
  plantedHumanEditBytes,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";

// A pending edit shows it stays untouched; a clean checkout shows an
// advanced trunk would otherwise rebase the developer's commit off the branch.
export const unpublishedBaseCases = [
  { trunkAdvanced: false, pendingEdit: true },
  { trunkAdvanced: true, pendingEdit: false },
];

// The checkout's top level, current branch, and the repository's worktree list.
async function checkoutIdentity(checkout) {
  const porcelain = (await git(checkout, "worktree", "list", "--porcelain"))
    .stdout;
  return {
    toplevel: await revParse(checkout, "--show-toplevel"),
    branch: (await git(checkout, "branch", "--show-current")).stdout.trim(),
    worktrees: porcelain
      .split("\n")
      .filter(
        (line) => line.startsWith("worktree ") || line.startsWith("branch "),
      )
      .join("\n"),
  };
}

// Everything a refused publication must leave alone: the checkout's index and
// working tree, its local branches and their commits, its worktrees, and the
// remote's branches. A fetch may still move remote-tracking refs.
async function localAndRemoteState(checkout, origin) {
  return {
    checkout: await captureCheckout(checkout),
    human: existsSync(join(checkout, "human-staged.txt"))
      ? await plantedHumanEditBytes(checkout)
      : null,
    identity: await checkoutIdentity(checkout),
    branches: (
      await git(
        checkout,
        "for-each-ref",
        "--format=%(refname) %(objectname)",
        "refs/heads/",
      )
    ).stdout,
    commits: (await git(checkout, "rev-list", "--branches")).stdout,
    remote: await remoteHeads(origin),
  };
}

// The developer commits unpublished work in the default checkout, with or
// without leaving a pending edit; the agent then commits only `owned.txt`.
// Another writer may then advance trunk. Returns the state to compare after.
export async function commitOverDeveloperWork(
  { integration, origin, trunkSha },
  { trunkAdvanced, pendingEdit },
) {
  writeFileSync(join(integration, "developer.txt"), "developer work\n");
  await git(integration, "add", "developer.txt");
  await git(integration, "commit", "-m", "developer unpublished commit");
  const developerSha = await revParse(integration, "HEAD");
  if (pendingEdit) await plantHumanEdit(integration);
  writeFileSync(join(integration, "owned.txt"), "owned change\n");
  await git(integration, "add", "owned.txt");
  await git(
    integration,
    "commit",
    "--only",
    "-m",
    "agent change",
    "--",
    "owned.txt",
  );
  const agentSha = await revParse(integration, "HEAD");
  const remoteTip = trunkAdvanced
    ? await advanceOriginFromAnotherWriter(origin)
    : trunkSha;
  const before = await localAndRemoteState(integration, origin);
  return { developerSha, agentSha, remoteTip, before };
}

// The stop names the agent's commit, the refused base, and the fetched tip;
// the developer's commit stays under the agent's and never reaches the remote.
export async function assertUnpublishedBaseRefused(
  result,
  { integration, origin },
  { developerSha, agentSha, remoteTip, before },
) {
  assert.equal(result.ok, false);
  assert.equal(result.publication, "stopped");
  assert.equal(result.status, "unpublished-base");
  assert.equal(result.receipt, null);
  assert.equal(result.candidate, agentSha);
  assert.equal(result.previouslyPublishedBase, developerSha);
  assert.equal(result.remoteTip, remoteTip);
  assert.deepEqual(await localAndRemoteState(integration, origin), before);
  assert.deepEqual(await commitParentsAndPaths(integration, agentSha), {
    parents: [developerSha],
    paths: ["owned.txt"],
  });
  await assert.rejects(git(origin, "cat-file", "-e", developerSha));
}
