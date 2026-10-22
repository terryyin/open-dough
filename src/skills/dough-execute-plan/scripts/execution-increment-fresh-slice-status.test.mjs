// The planned status step through the installed fresh-work CLI: delivery marks
// only the selected slice done, and a repeated request after a refusal leaves
// it so. Real Git, index, hooks and remote state prove withheld effects.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import { git } from "./publication-test-fixtures.mjs";
import { slicePlan } from "./story-obligations-test-fixtures.mjs";
import {
  acceptedProof,
  localFixture,
  planned,
} from "./execution-increment-fresh-test-fixtures.mjs";

const slice4 = "### 4. Work 4\nType: Behavior\nStatus: ";
const statuses = (f) =>
  readPlanSlices(readFileSync(join(f.workspace, "PLAN.md"), "utf8")).slices.map(
    ({ status }) => status,
  );

test("a retry after a staged-whitespace refusal leaves only the selected slice done", async (t) => {
  const f = await localFixture(t);
  const p = await planned(f);
  writeFileSync(join(f.workspace, "work.txt"), "owned work\n\n");
  const refused = await f.fresh(p);
  assert.equal(refused.code, 1);
  assert.equal(refused.result.status, "preparation-failed");
  assert.equal(refused.result.operation, "staged whitespace");
  assert.deepEqual(statuses(f), ["planned", "planned", "planned", "done"]);
  await f.withheld();
  writeFileSync(join(f.workspace, "work.txt"), "owned work\n");
  const retried = await f.fresh(p);
  assert.equal(retried.code, 0, JSON.stringify(retried.result));
  assert.equal(retried.result.report, "committed-pending-publication");
  assert.equal(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    `${slicePlan("").replace(`${slice4}planned`, `${slice4}done`)}${acceptedProof}`,
  );
});

test("only the selected slice's real status line changes, not a fenced example", async (t) => {
  const f = await localFixture(t);
  const fenced = slicePlan("").replace(
    `${slice4}planned`,
    "### 4. Work 4\nType: Behavior\n\n```text\nStatus: planned\n```\n\nStatus: planned",
  );
  const p = await planned(f, fenced);
  const { code, result } = await f.fresh(p);
  assert.equal(code, 0, JSON.stringify(result));
  assert.equal(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    `${fenced.replace("```\n\nStatus: planned", "```\n\nStatus: done")}${acceptedProof}`,
  );
});

test("a missing, unreadable or duplicated selected slice refuses before staging without changing the plan", async (t) => {
  const f = await localFixture(t);
  for (const [plan, slice] of [
    [slicePlan(""), 7],
    [slicePlan("").replace("## Ordered slices", "## Work"), 4],
    [slicePlan("", { indices: [1, 2, 3, 4, 4] }), 4],
  ]) {
    const p = await planned(f, plan);
    p.plan.slice = slice;
    const bytes = readFileSync(join(f.workspace, "PLAN.md"), "utf8");
    const { code, result } = await f.fresh(p);
    assert.equal(code, 1);
    assert.equal(result.operation, "plan/status mutation");
    assert.match(result.error, new RegExp(`slice ${slice}\\b`));
    assert.equal(readFileSync(join(f.workspace, "PLAN.md"), "utf8"), bytes);
    assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
    await f.withheld();
  }
});

test("another slice newly done in the working plan refuses, naming it, before staging", async (t) => {
  const f = await localFixture(t);
  const p = await planned(f);
  const advanced = readFileSync(join(f.workspace, "PLAN.md"), "utf8").replace(
    "### 2. Work 2\nType: Behavior\nStatus: planned",
    "### 2. Work 2\nType: Behavior\nStatus: done",
  );
  writeFileSync(join(f.workspace, "PLAN.md"), advanced);
  const { code, result } = await f.fresh(p);
  assert.equal(code, 1);
  assert.equal(result.operation, "plan/status mutation");
  assert.match(result.error, /slice 2 is done/);
  assert.equal(readFileSync(join(f.workspace, "PLAN.md"), "utf8"), advanced);
  assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
  await f.withheld();
});

test("a request still carrying a caller-authored plan update refuses as context", async (t) => {
  const f = await localFixture(t);
  const p = await planned(f);
  p.plan.update = f.logged("plan update");
  const { code, result } = await f.fresh(p);
  assert.equal(code, 1);
  assert.equal(result.operation, "context");
  assert.match(result.error, /not update/);
  assert.equal(existsSync(f.operations), false);
  assert.deepEqual(statuses(f), ["planned", "planned", "planned", "planned"]);
  await f.withheld();
});
