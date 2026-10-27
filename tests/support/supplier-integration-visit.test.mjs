import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  consumer,
  git,
  readDependencies,
  revParse,
} from "./supplier-dependency-fixture.mjs";
import {
  branchedSupplier,
  executionBranch,
  identities,
  integrate,
  publishConsumers,
  recordJudgment,
  remoteMain,
  satisfied,
  seedBytes,
  selected,
  supplierBlocks,
  visitConsumers,
} from "./supplier-integration-visit-fixture.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  cloneAsAnotherWriter,
  plantHumanEdit,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { retireWorktree } from "../../src/skills/dough-land/scripts/worktree-retirement.mjs";

test("Story Branch supplier integration visits a consumer added on trunk after branching before retirement", async (t) => {
  const setup = await branchedSupplier(t);
  await plantHumanEdit(setup.trunk.integration);
  const defaultBefore = await captureCheckout(setup.trunk.integration);
  const operations = [];

  const integrated = await integrate(setup, selected);
  operations.push("integrate-and-visit");
  assert.equal(integrated.code, 0, integrated.stderr);
  const { visit, receipt, acceptedSha } = integrated.json;
  assert.equal(integrated.json.classification, "published");
  assert.equal(receipt.sha, acceptedSha);
  assert.notEqual(acceptedSha, setup.evidence);
  assert.equal(visit.status, "visited");
  assert.deepEqual(identities(visit), [
    consumer.identity,
    setup.sibling.identity,
  ]);
  assert.deepEqual(visit.problems, []);
  assert.equal(visit.checkout.relation, "fast-forwarded");
  assert.equal(visit.checkout.from, setup.closureTip);
  assert.equal(visit.checkout.revision, acceptedSha);
  assert.equal(visit.target.sha, acceptedSha);
  assert.equal(await revParse(setup.workspace, "HEAD"), acceptedSha);
  assert.equal(
    (await git(setup.workspace, "branch", "--show-current")).stdout.trim(),
    executionBranch,
  );

  for (const entry of visit.consumers) {
    const judged = await recordJudgment(
      setup,
      entry,
      acceptedSha,
      satisfied(setup, acceptedSha),
    );
    assert.equal(judged.code, 0, judged.stderr);
  }
  const final = await publishConsumers(setup, "resolve supplier B consumers");
  operations.push("publish-consumers");
  assert.equal(await remoteMain(setup), final);
  await git(setup.workspace, "merge-base", "--is-ancestor", acceptedSha, final);
  assert.notEqual(final, receipt.sha);

  const late = await readDependencies(setup.owned, setup.sibling);
  assert.equal(late.blocking.length, 0);
  assert.equal(late.dependencies[0].resolution.revision, setup.evidence);
  const older = await readDependencies(setup.owned, consumer);
  assert.equal(supplierBlocks(older), 0);
  assert.match(JSON.stringify(older.blocking), /THIRD/);
  const historical = await git(
    setup.workspace,
    "show",
    `${setup.evidence}:.planning/seeds/B.md`,
  );
  assert.match(historical.stdout, /SEED-B#b/);
  assert.equal(
    existsSync(join(setup.workspace, ".planning/seeds/B.md")),
    false,
  );

  const resolvedBytes = seedBytes(setup.workspace);
  const replay = await integrate(setup, selected);
  assert.equal(replay.code, 0, replay.stderr);
  assert.equal(replay.json.classification, "already-accepted");
  assert.equal(replay.json.visit.checkout.relation, "current");
  assert.deepEqual(
    replay.json.visit.consumers.map((entry) => entry.dependency.state),
    ["satisfied", "satisfied"],
  );
  for (const entry of replay.json.visit.consumers) {
    const repeated = await recordJudgment(
      setup,
      entry,
      acceptedSha,
      satisfied(setup, acceptedSha),
    );
    assert.equal(repeated.code, 0, repeated.stderr);
  }
  assert.equal(seedBytes(setup.workspace), resolvedBytes);
  assert.equal(
    (await git(setup.workspace, "status", "--porcelain")).stdout,
    "",
  );
  assert.equal(await revParse(setup.workspace, "HEAD"), final);

  const retired = await retireWorktree({
    repository: setup.trunk.integration,
    worktree: setup.workspace,
    branch: executionBranch,
    createdForWork: true,
    remoteBranch: executionBranch,
    contained: [acceptedSha, final],
  });
  operations.push("retire");
  assert.equal(retired.removed, true, JSON.stringify(retired));
  assert.deepEqual(operations, [
    "integrate-and-visit",
    "publish-consumers",
    "retire",
  ]);
  const remoteSeed = await git(
    setup.trunk.integration,
    "show",
    `${final}:.planning/seeds/A.md`,
  );
  assert.equal(remoteSeed.stdout, resolvedBytes);
  assertCheckoutUnchanged(
    defaultBefore,
    await captureCheckout(setup.trunk.integration),
  );
});

test("a generic integration carries no visit, and the visit only advances a clean owned checkout", async (t) => {
  const setup = await branchedSupplier(t);
  const generic = await integrate(setup);
  assert.equal(generic.code, 0, generic.stderr);
  assert.equal(generic.json.classification, "published");
  assert.equal(Object.hasOwn(generic.json, "visit"), false);
  const { acceptedSha } = generic.json;
  assert.equal(await revParse(setup.workspace, "HEAD"), setup.closureTip);

  const notes = join(setup.workspace, "notes.txt");
  writeFileSync(notes, "owner's pending note\n");
  const dirty = await visitConsumers(setup, acceptedSha);
  assert.equal(dirty.code, 1);
  assert.equal(dirty.json.status, "stopped");
  assert.equal(dirty.json.reason, "local-changes");
  assert.deepEqual(dirty.json.checkout.changes, ["?? notes.txt"]);
  assert.match(dirty.json.recovery, /Nothing was changed/);
  assert.equal(await revParse(setup.workspace, "HEAD"), setup.closureTip);
  assert.equal(readFileSync(notes, "utf8"), "owner's pending note\n");
  rmSync(notes);

  const advanced = await visitConsumers(setup, acceptedSha);
  assert.equal(advanced.code, 0, advanced.stderr);
  assert.equal(advanced.json.checkout.relation, "fast-forwarded");
  assert.deepEqual(identities(advanced.json), [
    consumer.identity,
    setup.sibling.identity,
  ]);

  writeFileSync(join(setup.workspace, "local.txt"), "local\n");
  await git(setup.workspace, "add", "local.txt");
  await git(setup.workspace, "commit", "-q", "-m", "unpublished local work");
  const ahead = await visitConsumers(setup, acceptedSha);
  assert.equal(ahead.json.checkout.relation, "ahead");
  const writer = join(setup.trunk.fixture, "another-writer");
  await cloneAsAnotherWriter(setup.trunk.origin, writer);
  writeFileSync(join(writer, "other.txt"), "other\n");
  await git(writer, "add", "other.txt");
  await git(writer, "commit", "-q", "-m", "another writer advances main");
  await git(writer, "push", "-q", "origin", "main");
  const local = await revParse(setup.workspace, "HEAD");
  const divergent = await visitConsumers(setup, acceptedSha);
  assert.equal(divergent.code, 1);
  assert.equal(divergent.json.reason, "divergent");
  assert.equal(await revParse(setup.workspace, "HEAD"), local);
  const missing = await visitConsumers(
    setup,
    "1234567890123456789012345678901234567890",
  );
  assert.equal(missing.json.reason, "accepted-not-on-target");
});
