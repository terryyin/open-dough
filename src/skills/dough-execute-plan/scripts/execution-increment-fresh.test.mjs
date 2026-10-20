// Required local operations are exercised through the installed fresh-work CLI.
// Real Git, index, hooks and remote state prove dependent mutations were withheld.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "./publication-test-fixtures.mjs";
import {
  holdings,
  obligation,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import {
  localFixture,
  planned,
} from "./execution-increment-fresh-test-fixtures.mjs";

for (const [operation, failure, expected] of [
  ["generation", "nonzero", { code: 7 }],
  ["formatting", "nonzero", { code: 7 }],
  ["summary", "nonzero", { code: 7 }],
  ["generation", "spawn", { code: "ENOENT" }],
  ["formatting", "signal", { signal: "SIGTERM" }],
  ["generation", "unterminated", { signal: "SIGTERM", killed: true }],
]) {
  test(`${operation} ${failure} stops before staging or commit and retains preparation edits`, async (t) => {
    const f = await localFixture(t);
    f.preparation.generation = f.logged("generation");
    f.preparation.formatting = f.logged("formatting");
    f.preparation.summary = f.logged("summary");
    const changed = "fs.writeFileSync('work.txt', 'preparation retained\\n');";
    f.preparation[operation] =
      failure === "spawn"
        ? { command: [join(f.fixture, "absent-tool")] }
        : failure === "unterminated"
          ? {
              ...f.logged(operation, `${changed} setInterval(() => {}, 1000);`),
              timeoutMs: 1000,
            }
          : f.logged(
              operation,
              `${changed} ${failure === "signal" ? "process.kill(process.pid, 'SIGTERM');" : "process.exit(7);"}`,
            );
    const { code, result } = await f.fresh();
    assert.equal(code, 1);
    assert.equal(result.ok, false);
    assert.equal(result.operation, operation);
    for (const [key, value] of Object.entries(expected))
      assert.equal(result[key], value);
    assert.match(result.recovery, /Repair the named operation/);
    assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
    if (failure !== "spawn")
      assert.equal(
        readFileSync(join(f.workspace, "work.txt"), "utf8"),
        "preparation retained\n",
      );
    if (operation !== "summary")
      assert.doesNotMatch(
        existsSync(f.operations) ? readFileSync(f.operations, "utf8") : "",
        /summary/,
      );
    await f.withheld();
  });
}

test("missing resolved requirements, planned inputs and ambiguous staging refuse before any project command", async (t) => {
  const f = await localFixture(t);
  const cases = [];
  for (const field of [
    "commit",
    "generation",
    "formatting",
    "summary",
    "staging",
  ]) {
    const p = structuredClone(f.preparation);
    delete p[field];
    cases.push(p);
  }
  cases.push({ ...f.preparation, kind: "planned" });
  cases.push({
    ...f.preparation,
    kind: "planned",
    plan: { path: "PLAN.md", slice: 1 },
  });
  cases.push({
    ...f.preparation,
    kind: "planned",
    plan: { path: "PLAN.md", update: f.logged("forbidden plan update") },
  });
  cases.push({
    ...f.preparation,
    generation: {
      command: [process.execPath, "-e", "process.exit(0)"],
      notRequired: "",
    },
  });
  cases.push({
    ...f.preparation,
    staging: { ownedPaths: ["."], stagedPaths: [] },
  });
  for (const p of cases) {
    const { code, result } = await f.fresh(p);
    assert.equal(code, 1);
    assert.equal(result.operation, "context");
    await f.withheld();
  }
  assert.equal(existsSync(f.operations), false);
  assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
});

test("failed required plan mutation with otherwise valid work retains edits and cannot commit", async (t) => {
  const f = await localFixture(t);
  const p = planned(
    f,
    "fs.appendFileSync('PLAN.md', '\\npartial update\\n'); process.exit(9);",
  );
  const { code, result } = await f.fresh(p);
  assert.equal(code, 1);
  assert.equal(result.operation, "plan/status mutation");
  assert.equal(result.code, 9);
  assert.match(
    readFileSync(join(f.workspace, "PLAN.md"), "utf8"),
    /partial update/,
  );
  assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
  await f.withheld();
});

test("missing plan input and failed staging each stop before commit without discarding the index", async (t) => {
  const f = await localFixture(t);
  const p = {
    ...f.preparation,
    kind: "planned",
    plan: {
      path: "missing-PLAN.md",
      slice: 1,
      update: f.logged("forbidden update"),
    },
    staging: { ownedPaths: ["work.txt", "missing-PLAN.md"], stagedPaths: [] },
  };
  const missing = await f.fresh(p);
  assert.equal(missing.result.operation, "story obligations");
  assert.equal(missing.result.code, "ENOENT");
  assert.equal(existsSync(f.operations), false);
  await f.withheld();
  await git(f.workspace, "add", "work.txt");
  const index = (await git(f.workspace, "ls-files", "--stage")).stdout;
  f.preparation.staging.ownedPaths.push("absent-product-file.txt");
  const staging = await f.fresh();
  assert.equal(staging.result.operation, "staging");
  assert.equal((await git(f.workspace, "ls-files", "--stage")).stdout, index);
  await f.withheld();
});

test("planned obligations refuse before done mutation, and after mutation before commit", async (t) => {
  const f = await localFixture(t);
  const p = planned(f);
  writeFileSync(
    join(f.workspace, "story.md"),
    `# Story\n\n<a id="selected"></a>\n\n### Selected\n${holdings.story}\n`,
  );
  const open = slicePlan(obligation(holdings));
  writeFileSync(join(f.workspace, "PLAN.md"), open);
  let attempt = await f.fresh(p);
  assert.equal(attempt.result.operation, "story obligations");
  assert.equal(
    attempt.result.details.problems.some(
      ({ reason }) => reason === "open-obligation",
    ),
    true,
  );
  assert.equal(
    existsSync(f.operations),
    false,
    "no done mutation when obligations already refuse",
  );
  await f.withheld();
  writeFileSync(join(f.workspace, "PLAN.md"), slicePlan(""));
  p.plan.update = f.logged(
    "plan update",
    `fs.writeFileSync('PLAN.md', ${JSON.stringify(open)});`,
  );
  attempt = await f.fresh(p);
  assert.equal(attempt.result.operation, "story obligations");
  assert.equal(readFileSync(f.operations, "utf8"), "plan update\n");
  assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
  await f.withheld();
});
