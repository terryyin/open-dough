// Git-model caller policy, not native guidance-following. Real publishers,
// maintenance and completion CLI supply the observed boundaries.
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  lsRemoteSha,
  plantHumanEdit,
  remoteHeads,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import { agentIdentity } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

const branch = "exec/story";
const identity = "SEED-1#ongoing";
const ongoingStory = makeMe.aBacklogEntry
  .with({ identity, title: "Ongoing", href: "story.md#ongoing" })
  .please();
const plan =
  "# Plan\n\n## Ordered slices\n\n### 1. Release\nType: Behavior\nStatus: planned\n";
// The unfinished execution's published records, at their canonical paths.
const records = [
  ".planning/PLAN.md",
  ".planning/PRODUCT-BACKLOG.md",
  `.planning/${agentIdentity("jackson").path}`,
];

// A trunk holding the tracked `trunk.txt` that the planted human edit, a
// story change and another writer edit, then an increment, then the
// published records of an unfinished execution: its plan, the story Taken
// and jackson's assignment in `mode`. The workspace starts from those
// records; a published story also holds one more commit, which the fixture
// pushes to the story branch.
const unfinishedExecution = (published) => {
  const repository = makeMe.aRepository
    .withRevision("trunk", { files: { "trunk.txt": "base\n" } })
    .withRevision("increment")
    .withRevision("records", {
      backlog: { taken: [ongoingStory] },
      files: { ".planning/PLAN.md": plan },
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "jackson",
            identity,
            mode: published ? "story-branch" : "trunk",
            branch,
          })
          .please(),
      ],
      message: "Record unfinished execution",
    })
    .withWorkspace(branch, { from: "records" });
  return (
    published
      ? repository.withUnpublishedRevision("published prefix", {
          files: { "published-prefix.txt": "published prefix\n" },
          message: "Published story increment",
        })
      : repository
  ).please();
};

async function ongoing(t, published = false) {
  const f = await materializeRepository(unfinishedExecution(published));
  t.after(f.cleanup);
  const publishedStoryTip = published ? f.candidateSha : undefined;
  if (published)
    await git(f.execution, "push", "-q", "origin", `HEAD:refs/heads/${branch}`);
  return {
    ...f,
    publishedStoryTip,
    bodies: records.map((file) =>
      readFileSync(join(f.execution, file), "utf8"),
    ),
    executionPlan: join(f.execution, ".planning/PLAN.md"),
  };
}
function unchangedRecords(f) {
  records.forEach((file, i) =>
    assert.equal(readFileSync(join(f.execution, file), "utf8"), f.bodies[i]),
  );
  assert.equal(existsSync(f.execution), true);
}
const options = (f) => ({
  worktree: f.execution,
  branch,
  keepWorktree: true,
  executionPlan: f.executionPlan,
  publishedStoryTip: f.publishedStoryTip,
});

test("explicit retained Trunk Mode increment lands an unfinished plan, safely refreshes and reruns without another commit or push", async (t) => {
  const f = await ongoing(t);
  await advanceOriginFromAnotherWriter(f.origin);
  writeFileSync(join(f.execution, "reviewed.txt"), "reviewed\n");
  let pushes = 0;
  const land = () =>
    landWorktree({
      ...options(f),
      defaultCheckout: f.integration,
      beforePush: () => {
        pushes += 1;
      },
    });
  const landed = await land();
  assert.equal(landed.stopped, null, JSON.stringify(landed));
  assert.equal(landed.commit, "created");
  assert.equal(landed.refresh.result, "advanced");
  assert.equal(landed.cleanup.removed, false);
  assert.equal(landed.cleanup.reason, "explicit --keep-worktree");
  const accepted = await lsRemoteSha(f.origin, "refs/heads/main");
  assert.equal(await revParse(f.integration, "HEAD"), accepted);
  assert.equal(await revParse(f.execution, branch), accepted);
  assert.equal(
    (await git(f.execution, "branch", "--show-current")).stdout.trim(),
    branch,
  );
  assert.equal(
    (await git(f.origin, "show", "main:reviewed.txt")).stdout,
    "reviewed\n",
  );
  unchangedRecords(f);
  const before = await captureCheckout(f.execution);
  const heads = await remoteHeads(f.origin);
  const repeated = await land();
  assert.equal(repeated.commit, "nothing-to-commit");
  assert.equal(repeated.publication.pushed, false);
  assert.equal(pushes, 1);
  assertCheckoutUnchanged(before, await captureCheckout(f.execution));
  assert.deepEqual(await remoteHeads(f.origin), heads);
  unchangedRecords(f);
});

test("retained Story Branch landing preserves its published prefix and local suffix over advanced trunk, leaving a dirty default checkout untouched", async (t) => {
  const f = await ongoing(t, true);
  const trunk = await advanceOriginFromAnotherWriter(f.origin);
  writeFileSync(join(f.execution, "local-suffix.txt"), "local suffix\n");
  await plantHumanEdit(f.integration);
  const human = await captureCheckout(f.integration);
  const landed = await landWorktree({
    ...options(f),
    defaultCheckout: f.integration,
  });
  assert.equal(landed.stopped, null);
  const accepted = await lsRemoteSha(f.origin, "refs/heads/main");
  await git(
    f.origin,
    "merge-base",
    "--is-ancestor",
    f.publishedStoryTip,
    accepted,
  );
  await git(f.origin, "merge-base", "--is-ancestor", trunk, accepted);
  const local = await revParse(f.execution, branch);
  assert.notEqual(local, f.publishedStoryTip);
  await git(f.origin, "merge-base", "--is-ancestor", local, accepted);
  assert.equal(
    (await git(f.origin, "show", "main:local-suffix.txt")).stdout,
    "local suffix\n",
  );
  assert.equal(
    await lsRemoteSha(f.origin, `refs/heads/${branch}`),
    f.publishedStoryTip,
  );
  assert.equal(
    (await git(f.execution, "branch", "--show-current")).stdout.trim(),
    branch,
  );
  assert.equal(landed.refresh.result, "deferred");
  assertCheckoutUnchanged(human, await captureCheckout(f.integration));
  unchangedRecords(f);
  const repeated = await landWorktree(options(f));
  assert.equal(repeated.commit, "nothing-to-commit");
  assert.equal(repeated.publication.pushed, false);
  assert.equal(repeated.refresh.result, "not applicable");
  unchangedRecords(f);
});

test("a retained published-story conflict preserves the stopped merge, resources and unfinished records without a push", async (t) => {
  const f = await ongoing(t, true);
  await git(f.execution, "show", "HEAD:trunk.txt");
  writeFileSync(join(f.execution, "trunk.txt"), "story change\n");
  await git(f.execution, "commit", "-qam", "Story conflict");
  await advanceOriginFromAnotherWriter(f.origin, {
    file: "trunk.txt",
    body: "other change\n",
  });
  const heads = await remoteHeads(f.origin);
  const landed = await landWorktree(options(f));
  assert.equal(landed.stopped, "publish");
  assert.equal(landed.publication.reason, "conflict");
  assert.equal(landed.refresh, "not-attempted");
  assert.equal(landed.cleanup, "not-performed");
  assert.deepEqual(await remoteHeads(f.origin), heads);
  assert.ok(
    (
      await git(f.execution, "diff", "--name-only", "--diff-filter=U")
    ).stdout.includes("trunk.txt"),
  );
  unchangedRecords(f);
});
