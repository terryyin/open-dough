import assert from "node:assert/strict";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { startCliResult } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  fixture,
  publish,
  plan,
  supplierPlan,
  resolveConsumer,
  discover,
  homeBytes,
  consumer,
  supplier,
  readDependencies,
  dependency,
  updateDependency,
  git,
  run,
  revParse,
} from "./supplier-dependency-fixture.mjs";

test("completed integrated supplier resolves current unqueued sibling independently and survives cleanup/retry", async (t) => {
  const f = await fixture(t);
  await publish(f, "waiting supplier increment");
  const discovered = await discover(f);
  assert.deepEqual(
    discovered.consumers.map((entry) => entry.identity).sort(),
    [consumer.identity, f.sibling.identity].sort(),
  );
  assert.deepEqual(discovered.problems, []);
  const increment = await revParse(f.integration, "HEAD");
  const initial = homeBytes(f);
  const incomplete = await resolveConsumer(f, f.sibling, increment, increment);
  assert.equal(incomplete.code, 1);
  assert.match(incomplete.stderr, /every planned slice must be done/);
  assert.equal(homeBytes(f), initial);
  writeFileSync(join(f.integration, supplierPlan), plan("done"));
  await git(f.integration, "add", supplierPlan);
  await git(
    f.integration,
    "commit",
    "-m",
    "supplier complete with outcome proof",
  );
  const evidence = await revParse(f.integration, "HEAD");
  const unpublished = await resolveConsumer(f, f.sibling, evidence, evidence);
  assert.equal(unpublished.code, 1);
  assert.match(unpublished.stderr, /authorized integration target/);
  assert.equal(homeBytes(f), initial);
  await git(f.integration, "push", "origin", "main");
  const resolved = await resolveConsumer(f, f.sibling, evidence, evidence);
  assert.equal(resolved.code, 0, resolved.stderr);
  assert.equal(
    (await readDependencies(f.project, f.sibling)).blocking.length,
    0,
  );
  assert.equal(
    (await readDependencies(f.project, consumer)).blocking.length,
    2,
  );
  const pending = await startCliResult(f, "story-branch", f.late.args, {
    identity: f.sibling.identity,
  });
  assert.equal(pending.code, 1);
  assert.match(pending.receipt.error, /execution is blocked/);
  assert.equal(existsSync(pending.workspace), false);
  const other = await resolveConsumer(f, consumer, evidence, evidence);
  assert.equal(other.code, 0, other.stderr);
  await publish(f, "publish direct consumer resolution");
  const stillBlocked = await startCliResult(f, "story-branch");
  assert.equal(stillBlocked.code, 1);
  assert.match(stillBlocked.receipt.error, /THIRD/);
  assert.doesNotMatch(stillBlocked.receipt.error, /SEED-B#b/);
  assert.equal(existsSync(stillBlocked.workspace), false);
  const complete = await startCliResult(f, "story-branch", f.late.args, {
    identity: f.sibling.identity,
  });
  assert.equal(complete.code, 0, JSON.stringify(complete));
  assert.equal(complete.receipt.ok, true);
  const beforeCleanup = homeBytes(f);
  // Queue closure never fulfills another dependency. Remove spent supplier
  // source and plan only after preserving evidence in accepted Git history.
  const closure = await run(f.project, [
    "complete",
    "--identity",
    supplier.identity,
  ]);
  assert.equal(closure.code, 0, closure.stderr);
  rmSync(join(f.integration, ".planning/seeds/B.md"));
  rmSync(join(f.integration, supplierPlan));
  await git(f.integration, "fetch", "origin", "main");
  await git(f.integration, "merge", "--ff-only", "origin/main");
  const accepted = await publish(f, "delete spent completed supplier");
  const retry = await resolveConsumer(f, f.sibling, evidence, accepted);
  assert.equal(retry.code, 0, retry.stderr);
  assert.equal(homeBytes(f), beforeCleanup);
  const resolution = (await readDependencies(f.project, f.sibling))
    .dependencies[0].resolution;
  assert.equal(resolution.revision, evidence);
  assert.equal(resolution.path, ".planning/seeds/B.md#b");
  assert.match(resolution.summary, new RegExp(evidence));
  assert.match(
    resolution.summary,
    /Condition satisfied: The selected endpoint/,
  );
  const historical = await git(
    f.integration,
    "show",
    `${resolution.revision}:${resolution.path.split("#")[0]}`,
  );
  assert.match(historical.stdout, /SEED-B#b/);
  const unavailable = await resolveConsumer(f, consumer, accepted, accepted);
  assert.equal(unavailable.code, 1);
  assert.match(
    unavailable.stderr,
    /completion evidence could not be established/,
  );
  assert.equal(homeBytes(f), beforeCleanup);
});

test("stale condition and discovery gaps never invent fulfillment", async (t) => {
  const f = await fixture(t);
  writeFileSync(join(f.integration, supplierPlan), plan("done"));
  const evidence = await publish(f);
  const before = homeBytes(f);
  const stale = await resolveConsumer(f, consumer, evidence, evidence, {
    condition: "An old condition",
  });
  assert.equal(stale.code, 1);
  assert.match(stale.stderr, /agreement changed/);
  assert.equal(homeBytes(f), before);
  const oldBasis = (await readDependencies(f.project, consumer)).basis;
  const changed = await updateDependency(
    f.project,
    consumer,
    dependency(supplier, { condition: "New supplier outcome requirement" }),
  );
  assert.equal(changed.code, 0, changed.stderr);
  const changedBytes = homeBytes(f);
  const staleBasis = await resolveConsumer(
    f,
    consumer,
    evidence,
    evidence,
    {},
    ["--expect-dependencies", oldBasis],
  );
  assert.equal(staleBasis.code, 1);
  assert.match(staleBasis.stderr, /agreement changed/);
  assert.equal(homeBytes(f), changedBytes);
  writeFileSync(
    join(f.integration, ".planning/seeds/broken.md"),
    "# Broken\n**Identity:** BROKEN\n```json dough-story-dependencies\n{}\n```\n",
  );
  const discovered = await discover(f);
  assert.equal(discovered.consumers.length, 2);
  assert.match(discovered.problems[0].problem, /dependency/);
  assert.equal(
    (await readDependencies(f.project, consumer)).blocking.length,
    2,
  );
});

test("planless completion requires explicit recoverable outcome proof", async (t) => {
  const f = await fixture(t);
  const supplierHome = join(f.integration, ".planning/seeds/B.md");
  writeFileSync(
    supplierHome,
    '# Supplier\n<a id="b"></a>\n### B\n**Identity:** SEED-B#b\nDelivered selected endpoint.\n',
  );
  writeFileSync(
    join(f.integration, ".planning/proof.md"),
    "The selected endpoint passed its promised behavior observation.\n",
  );
  const evidence = await publish(f);
  const held = homeBytes(f);
  const missing = await resolveConsumer(f, consumer, evidence, evidence);
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /Planless supplier needs/);
  assert.equal(homeBytes(f), held);
  const resolved = await resolveConsumer(f, consumer, evidence, evidence, {}, [
    "--planless-complete",
    "--completion-file",
    ".planning/proof.md",
  ]);
  assert.equal(resolved.code, 0, resolved.stderr);
  assert.equal(
    (await readDependencies(f.project, consumer)).blocking.length,
    1,
  );
});
