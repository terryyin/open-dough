import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { startCliResult } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  fixture,
  publish,
  supplierPlan,
  supplier,
  consumer,
  readDependencies,
  run,
  resolveConsumer,
  homeBytes,
  discover,
} from "./supplier-dependency-fixture.mjs";

test("generic queue complete and absent supplier without recovered outcome release no consumer", async (t) => {
  const f = await fixture(t);
  await publish(f, "unfinished supplier increment");
  const before = homeBytes(f);
  const removed = await run(f.project, [
    "complete",
    "--identity",
    supplier.identity,
  ]);
  assert.equal(removed.code, 0, removed.stderr);
  assert.equal(homeBytes(f), before);
  assert.equal(
    (await readDependencies(f.project, consumer)).blocking.length,
    2,
  );
  assert.equal(
    (await readDependencies(f.project, f.sibling)).blocking.length,
    1,
  );
  rmSync(join(f.integration, ".planning/seeds/B.md"));
  rmSync(join(f.integration, supplierPlan));
  const cleanup = await publish(f, "supplier disappearance is not completion");
  const refused = await resolveConsumer(f, f.sibling, cleanup, cleanup);
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /completion evidence could not be established/);
  assert.equal(homeBytes(f), before);
  const pending = await startCliResult(f, "story-branch", f.late.args, {
    identity: f.sibling.identity,
  });
  assert.equal(pending.code, 1);
  assert.match(pending.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(pending.workspace), false);
  assert.equal((await discover(f)).consumers.length, 2);
});
