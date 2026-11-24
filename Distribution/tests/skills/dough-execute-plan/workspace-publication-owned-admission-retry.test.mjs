import assert from "node:assert/strict";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { exec, git, revParse } from "./publication-test-fixtures.mjs";
import { listed } from "./workspace-publication-admission-fixtures.mjs";
import {
  advanceRemote,
  holdFirstPush,
  resumeArgs,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

const cli = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/scripts/execution-start.mjs",
    import.meta.url,
  ),
);

async function draft(trunk, title) {
  const { stdout } = await exec(process.execPath, [
    cli,
    "draft",
    "--repository",
    trunk.integration,
    "--target",
    "main",
    "--title",
    title,
    "--goal",
    title,
  ]);
  return JSON.parse(stdout);
}

function admit(trunk, owner, draft, retry = []) {
  return startProcess(trunk, owner, draft.identity, [
    "--integration",
    "",
    "--repository",
    trunk.integration,
    "--admit",
    "--link",
    draft.link,
    "--title",
    draft.title,
    "--owned-draft",
    JSON.stringify(draft.ownedDraft),
    ...retry,
  ]);
}

test("owned admission retry keeps a losing candidate recoverable and preserves dirty work", async (t) => {
  const repo = await materializeRepository(makeMe.aRepository.please());
  t.after(repo.cleanup);
  const first = await draft(repo, "First admission");
  const second = await draft(repo, "Second admission");
  assert.equal(first.identity, second.identity);
  const hold = await holdFirstPush(repo);
  const contender = admit(repo, "a", first);
  await hold.awaitArrival(contender);
  const original = await revParse(contender.workspace, "HEAD");
  const profile = (
    await git(
      contender.workspace,
      "ls-tree",
      "--name-only",
      original,
      ".planning/agents/",
    )
  ).stdout.trim();
  const { stdout: contents } = await git(
    contender.workspace,
    "show",
    `${original}:${profile}`,
  );
  await advanceRemote(repo, "notes.txt", contents);
  const parent = await revParse(repo.origin, "main");
  const winner = (await admit(repo, "b", second).result).receipt;
  assert.equal(winner.ok, true, JSON.stringify(winner));
  hold.release();
  const { receipt: lost, workspace } = await contender.result;
  assert.equal(lost.ownership, "other");
  const { startingRevision } = lost.recovery;
  assert.notEqual(parent, startingRevision);
  const retryFor = (candidateSha) => [
    "--retry-admission",
    "true",
    ...resumeArgs({ startingRevision, candidateSha }),
  ];
  const replaceCandidate = async (rename) => {
    await git(workspace, "reset", "--keep", parent);
    await git(
      workspace,
      "restore",
      "--staged",
      "--worktree",
      `--source=${original}`,
      "--",
      ".planning",
    );
    if (rename) await git(workspace, "rm", "--", "notes.txt");
    await git(workspace, "commit", "-C", original);
    return revParse(workspace, "HEAD");
  };
  const renamed = await replaceCandidate(true);
  const projection = await git(
    workspace,
    "diff",
    "--find-renames=100%",
    "--name-status",
    parent,
    renamed,
  );
  assert.match(projection.stdout, /^R100\tnotes\.txt\t\.planning\/agents\//m);
  const renameRefusal = (
    await admit(repo, "a", first, retryFor(renamed)).result
  ).receipt;
  assert.equal(renameRefusal.status, "conflict");
  assert.equal(await revParse(workspace, "HEAD"), renamed);
  assert.equal(await revParse(repo.origin, "main"), winner.publishedSha);

  const candidateSha = await replaceCandidate(false);
  const retry = retryFor(candidateSha);

  const note = join(workspace, "developer-note.txt");
  await git(workspace, "config", "status.showUntrackedFiles", "no");
  writeFileSync(note, "Keep this edit\n");
  const dirty = (await admit(repo, "a", first, retry).result).receipt;
  assert.equal(dirty.status, "conflict");
  assert.equal(await revParse(workspace, "HEAD"), candidateSha);
  assert.equal(readFileSync(note, "utf8"), "Keep this edit\n");

  unlinkSync(note);
  const retired = (await admit(repo, "a", first, retry).result).receipt;
  assert.equal(retired.status, "retry-admission", JSON.stringify(retired));
  assert.equal(retired.recovery.startingRevision, startingRevision);
  assert.equal(
    await revParse(workspace, retired.recovery.preserved),
    candidateSha,
  );
  assert.equal(await revParse(workspace, "HEAD"), parent);
  assert.equal(await revParse(repo.origin, "main"), winner.publishedSha);
  const repeated = (await admit(repo, "a", first, retry).result).receipt;
  assert.equal(repeated.recovery.preserved, retired.recovery.preserved);

  const next = await draft(repo, first.title);
  assert.notEqual(next.identity, first.identity);
  const published = (await admit(repo, "a", next).result).receipt;
  assert.equal(published.ok, true, JSON.stringify(published));
  assert.equal(await revParse(workspace, "HEAD"), published.publishedSha);
  const retained = ["--retry-admission", "true", ...resumeArgs(published)];
  const recovered = (await admit(repo, "a", next, retained).result).receipt;
  assert.equal(recovered.publishedSha, published.publishedSha);
  const entries = await listed(repo, await revParse(repo.origin, "main"));
  assert.deepEqual(
    entries
      .filter(({ list }) => list === "Taken")
      .map(({ identity, title }) => [identity, title])
      .sort(),
    [
      [second.identity, second.title],
      [next.identity, first.title],
    ].sort(),
  );
});
