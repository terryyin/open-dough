import assert from "node:assert/strict";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { performCheckoutWork } from "./repository-checkout-work.mjs";
import { materializeRepository } from "./repository-fixture.mjs";

test("dated checkout work is recorded by Git and a later push publishes its named commit", async (t) => {
  const repository = await materializeRepository(makeMe.aRepository.please());
  t.after(repository.cleanup);
  const pulledAt = "2020-03-08T12:00:00Z";
  const committedAt = "2020-03-08T12:10:00Z";
  const { pulled, committed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .fastForwardingToTrunkWork("pulled", {
        at: pulledAt,
        message: "Published trunk work",
        files: { "published.txt": "published\n" },
      })
      .committing("committed", {
        at: committedAt,
        message: "Session work",
        files: { "session.txt": "local\n" },
      })
      .please(),
  );
  assert.equal(
    (await git(repository.origin, "rev-parse", "main")).stdout.trim(),
    pulled,
  );
  assert.equal(
    (
      await git(
        repository.integration,
        "log",
        "-g",
        "-2",
        "--date=unix",
        "--format=%H %gd %gs",
        "HEAD",
      )
    ).stdout.trim(),
    [
      `${committed} HEAD@{${Date.parse(committedAt) / 1000}} commit: Session work`,
      `${pulled} HEAD@{${Date.parse(pulledAt) / 1000}} pull --quiet --ff-only origin main: Fast-forward`,
    ].join("\n"),
  );

  const { published } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .pushingToTrunk("published", { at: "2020-03-08T12:20:00Z" })
      .please(),
  );
  assert.equal(published, committed);
  assert.equal(
    (await git(repository.origin, "show", "main:session.txt")).stdout,
    "local\n",
  );
});
