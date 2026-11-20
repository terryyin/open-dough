import assert from "node:assert/strict";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { performCheckoutWork } from "./repository-checkout-work.mjs";
import {
  materializeLocalCheckout,
  materializeRepository,
} from "./repository-fixture.mjs";

const firstAt = "2020-03-08T12:00:00Z";
const rewriteAt = "2020-03-08T12:10:00Z";
const rewriteSeconds = Date.parse(rewriteAt) / 1000;

test("a continued conflicted cherry-pick has the receiver's parent and resolution", async (t) => {
  const repository = await materializeRepository(makeMe.aRepository.please());
  t.after(repository.cleanup);
  const { integration } = repository;
  const { local, continued } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("local", {
        at: firstAt,
        message: "Add local notes",
        files: { "notes.txt": "Local notes\n" },
      })
      .continuingConflictedCherryPick("continued", {
        at: rewriteAt,
        file: "notes.txt",
        incoming: "Incoming notes\n",
        resolution: "Reconciled notes\n",
      })
      .please(),
  );
  assert.equal(
    (await git(integration, "rev-parse", "HEAD")).stdout.trim(),
    continued,
  );
  assert.equal(
    (await git(integration, "rev-parse", "HEAD^")).stdout.trim(),
    local,
  );
  assert.equal(
    (await git(integration, "show", "HEAD:notes.txt")).stdout,
    "Reconciled notes\n",
  );
  const { stdout } = await git(
    integration,
    "reflog",
    "-1",
    "--date=unix",
    "--format=%gd %gs",
  );
  assert.equal(
    stdout.trim(),
    `HEAD@{${rewriteSeconds}} commit (cherry-pick): Add notes.txt`,
  );
});

for (const mode of ["fixup", "squash"]) {
  test(`a dated autosquash keeps both files in one rewritten ${mode} commit`, async (t) => {
    const repository = await materializeLocalCheckout(
      t,
      makeMe.aRepository.please(),
    );
    const { integration, trunkSha } = repository;
    const { target } = await performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .committing("target", {
          at: firstAt,
          message: "Add first.txt",
          files: { "first.txt": "First file\n" },
        })
        .please(),
    );
    const { rewritten } = await performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .autosquashing("rewritten", {
          at: rewriteAt,
          target,
          mode,
          file: "added.txt",
          content: "Added file\n",
        })
        .please(),
    );

    assert.notEqual(rewritten, target);
    assert.equal(
      (await git(integration, "rev-parse", "HEAD", "HEAD^")).stdout.trim(),
      `${rewritten}\n${trunkSha}`,
    );
    assert.equal(
      (await git(integration, "show", "HEAD:first.txt")).stdout,
      "First file\n",
    );
    assert.equal(
      (await git(integration, "show", "HEAD:added.txt")).stdout,
      "Added file\n",
    );
    const { stdout } = await git(
      integration,
      "reflog",
      "--date=unix",
      "--format=%gd %gs",
    );
    assert.ok(
      stdout
        .split("\n")
        .some((entry) =>
          entry.startsWith(
            `HEAD@{${rewriteSeconds}} rebase (${mode}): Add first.txt`,
          ),
        ),
      stdout,
    );
  });
}
