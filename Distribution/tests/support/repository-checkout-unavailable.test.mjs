import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { performCheckoutWork } from "./repository-checkout-work.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

const commitAt = "2020-03-08T12:00:00Z";
const rewriteAt = "2020-03-08T12:10:00Z";

test("an uncommitted checkout edit leaves HEAD and the index alone", async (t) => {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository.please(),
  );
  const { integration, trunkSha } = repository;
  const { edit } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .editing("edit", {
        at: commitAt,
        files: { "edited.txt": "uncommitted\n" },
      })
      .please(),
  );
  assert.equal(edit, trunkSha);
  assert.equal(
    (await git(integration, "rev-parse", "HEAD")).stdout.trim(),
    trunkSha,
  );
  assert.equal(
    (await git(integration, "status", "--short")).stdout,
    "?? edited.txt\n",
  );
  assert.equal(
    readFileSync(join(integration, "edited.txt"), "utf8"),
    "uncommitted\n",
  );
});

test("a dated commit on another branch returns the checkout to its original branch", async (t) => {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository.please(),
  );
  const { integration, trunkSha } = repository;
  const { side } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committingOnBranch("side", {
        at: commitAt,
        branch: "side",
        message: "Add side work",
        files: { "side.txt": "side work\n" },
      })
      .please(),
  );
  assert.equal(
    (await git(integration, "symbolic-ref", "--short", "HEAD")).stdout.trim(),
    "main",
  );
  assert.equal(
    (
      await git(integration, "rev-parse", "HEAD", "side", "side^")
    ).stdout.trim(),
    [trunkSha, side, trunkSha].join("\n"),
  );
  assert.equal(
    (await git(integration, "show", "side:side.txt")).stdout,
    "side work\n",
  );
  assert.equal(
    Number(
      (await git(integration, "log", "-1", "--format=%ct", "side")).stdout,
    ),
    Date.parse(commitAt) / 1000,
  );
});

test("a dated reword preserves the tip's files and records its literal new message", async (t) => {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository.please(),
  );
  const { integration, trunkSha } = repository;
  const message = "Clarify 'notes' and $CHECKOUT_TOPIC";
  const { initial, reworded } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("initial", {
        at: commitAt,
        message: "Add notes",
        files: { "notes.txt": "session notes\n" },
      })
      .rewordingTip("reworded", { at: rewriteAt, message })
      .please(),
  );
  assert.notEqual(reworded, initial);
  assert.equal(
    (await git(integration, "rev-parse", "HEAD", "HEAD^")).stdout.trim(),
    [reworded, trunkSha].join("\n"),
  );
  assert.equal(
    (await git(integration, "show", "HEAD:notes.txt")).stdout,
    "session notes\n",
  );
  assert.equal(
    (await git(integration, "log", "-1", "--format=%s")).stdout.trim(),
    message,
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
      .includes(
        `HEAD@{${Date.parse(rewriteAt) / 1000}} rebase (reword): ${message}`,
      ),
    stdout,
  );
});
