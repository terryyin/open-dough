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

test("a dated merge and amendment keep both parents and the merge message", async (t) => {
  const repository = await materializeRepository(makeMe.aRepository.please());
  t.after(repository.cleanup);
  const { integration, origin } = repository;
  const { first, merged, amended } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("first", {
        at: "2020-03-08T12:00:00Z",
        message: "Session work",
        files: { "session.txt": "local\n" },
      })
      .mergingTrunkWork("merged", {
        at: "2020-03-08T12:10:00Z",
        message: "Trunk work",
        files: { "trunk.txt": "published\n" },
      })
      .amending("amended", {
        at: "2020-03-08T12:20:00Z",
        files: { "amended.txt": "added to merge\n" },
      })
      .please(),
  );
  const trunk = (await git(origin, "rev-parse", "main")).stdout.trim();
  const facts = async (revision) =>
    (
      await git(integration, "show", "-s", "--format=%P%n%ct%n%s", revision)
    ).stdout
      .trim()
      .split("\n");
  const [mergeParents, mergeTime, mergeMessage] = await facts(merged);
  const [amendParents, amendTime, amendMessage] = await facts(amended);
  assert.equal(mergeParents, `${first} ${trunk}`);
  assert.equal(amendParents, mergeParents);
  assert.equal(mergeTime, String(Date.parse("2020-03-08T12:10:00Z") / 1000));
  assert.equal(amendTime, String(Date.parse("2020-03-08T12:20:00Z") / 1000));
  assert.match(mergeMessage, /^Merge branch 'main'/);
  assert.equal(amendMessage, mergeMessage);
  assert.equal(
    (await git(integration, "show", `${amended}:amended.txt`)).stdout,
    "added to merge\n",
  );
});

for (const [step, runLength, action] of [
  ["rebasingOntoTrunkWork", 2, /^pull .*--rebase.* \(pick\): Session work$/],
  [
    "rebasingTipOntoFetchedTrunkWork",
    1,
    /^rebase(?: [^(]+)? \(pick\): Session work$/,
  ],
]) {
  test(`${step} replays the earlier authored commit at the stated time`, async (t) => {
    const repository = await materializeRepository(makeMe.aRepository.please());
    t.after(repository.cleanup);
    const authoredAt = "2020-03-08T12:00:00Z";
    const replayedAt = "2020-03-08T12:10:00Z";
    const { beforeReplay, trunk } = await performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .committing("first", {
          at: "2020-03-08T11:50:00Z",
          message: "Earlier work",
          files: { "earlier.txt": "first local work\n" },
        })
        .committing("beforeReplay", {
          at: authoredAt,
          message: "Session work",
          files: { "session.txt": "local\n" },
        })
        [step]("trunk", {
          at: replayedAt,
          message: "Trunk work",
          files: { "trunk.txt": "published\n" },
        })
        .please(),
    );
    const { integration } = repository;
    const [head, authorTime, committerTime] = (
      await git(integration, "show", "-s", "--format=%H%n%at%n%ct", "HEAD")
    ).stdout
      .trim()
      .split("\n");
    assert.notEqual(head, beforeReplay);
    assert.equal(
      (await git(integration, "rev-parse", `HEAD~${runLength}`)).stdout.trim(),
      trunk,
    );
    assert.equal(
      (
        await git(integration, "ls-tree", "--name-only", "HEAD", "earlier.txt")
      ).stdout.trim(),
      runLength === 2 ? "earlier.txt" : "",
    );
    assert.equal(authorTime, String(Date.parse(authoredAt) / 1000));
    assert.equal(committerTime, String(Date.parse(replayedAt) / 1000));
    const { stdout } = await git(
      integration,
      "log",
      "-g",
      "--format=%gs",
      "HEAD",
    );
    assert.ok(
      stdout
        .trim()
        .split("\n")
        .some((entry) => action.test(entry)),
      stdout,
    );
  });
}
