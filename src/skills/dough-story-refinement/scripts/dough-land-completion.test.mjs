// Resolved-plan enforcement at the Git-model landing boundary. This invokes
// the production completion checker; it does not claim native guidance use.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  remoteHeads,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const identity = "SEED-1#ongoing";
const branch = "exec/story";
const profile = ".planning/agents/jackson-chan.json";
const claim = `# Product backlog\n\n## Taken\n- [${identity} Ongoing](story.md#ongoing) · [plan](PLAN.md)\n\n## Backlog list\n`;
function planSource({ pending = false, obligation = false } = {}) {
  return `# Execution plan
**Source:** [selected story](story.md#ongoing)

## Ordered slices
${[...Array(14).keys()].map((i) => `### ${i + 1}. ${i === 13 ? "Release the result" : `Work ${i + 1}`}\nType: Behavior\nStatus: ${pending && i === 13 ? "planned" : "done"}`).join("\n\n")}
${
  obligation
    ? `
## Story obligations
### G1. Release missing
Reported: slice 14 — "The release remains unpublished."
Story clause: "A release is available."
Disposition: return
`
    : ""
}`;
}
async function executionFixture(t, source) {
  const f = await createCleanTrunkFixture();
  t.after(f.cleanup);
  mkdirSync(join(f.execution, ".planning"));
  const plan = join(f.execution, ".planning/PLAN.md");
  writeFileSync(plan, source);
  writeFileSync(join(f.execution, ".planning/PRODUCT-BACKLOG.md"), claim);
  writeFileSync(
    join(f.execution, ".planning/story.md"),
    '# Stories\n\n<a id="ongoing"></a>\n\n### Ongoing\n\nA release is available.\n',
  );
  mkdirSync(join(f.execution, ".planning/agents"));
  writeFileSync(
    join(f.execution, profile),
    renderAgentProfile({
      name: "jackson",
      identity,
      mode: "story-branch",
      branch,
    }),
  );
  await git(f.execution, "add", ".planning");
  await git(f.execution, "commit", "-qm", "Record ongoing execution");
  await git(f.execution, "push", "-q", "origin", `HEAD:refs/heads/${branch}`);
  return { ...f, plan };
}

for (const [example, source, reason] of [
  ["13 of 14 slices done", planSource({ pending: true }), "pending-slice"],
  [
    "all slices done with an open obligation",
    planSource({ obligation: true }),
    "open-obligation",
  ],
  [
    "ambiguous slice status",
    planSource().replace("Status: done", "Status: uncertain"),
    "unreadable-slices",
  ],
  [
    "missing slice evidence",
    "# Plan without slice evidence\n",
    "unreadable-slices",
  ],
]) {
  test(`ordinary landing with ${example} refuses before commit, index change or publication`, async (t) => {
    const f = await executionFixture(t, source);
    // Preserve both staged and unstaged edits, including the selected plan.
    writeFileSync(join(f.execution, "reviewed-staged.txt"), "staged result\n");
    await git(f.execution, "add", "reviewed-staged.txt");
    writeFileSync(join(f.execution, "trunk.txt"), "reviewed unstaged result\n");
    const before = await captureCheckout(f.execution);
    const heads = await remoteHeads(f.origin);
    const assignment = readFileSync(join(f.execution, profile), "utf8");
    const refused = await landWorktree({
      worktree: f.execution,
      branch,
      executionPlan: f.plan,
    });
    assert.equal(refused.stopped, "execution-completion");
    assert.equal(refused.commit, "none");
    assert.ok(
      refused.completion.problems.some((problem) => problem.reason === reason),
      JSON.stringify(refused),
    );
    if (reason === "pending-slice")
      assert.ok(
        refused.completion.problems.some(
          (problem) =>
            problem.slice === 14 && problem.name === "Release the result",
        ),
      );
    assert.equal(refused.refresh, "not-attempted");
    assert.equal(refused.cleanup, "not-performed");
    assertCheckoutUnchanged(before, await captureCheckout(f.execution));
    assert.deepEqual(await remoteHeads(f.origin), heads);
    assert.equal(await revParse(f.execution, branch), before.head);
    assert.equal(readFileSync(f.plan, "utf8"), source);
    assert.equal(
      readFileSync(join(f.execution, ".planning/PRODUCT-BACKLOG.md"), "utf8"),
      claim,
    );
    assert.equal(readFileSync(join(f.execution, profile), "utf8"), assignment);
    assert.equal(existsSync(f.execution), true);
  });
}

test("an already accepted unfinished execution still refuses ordinary rerun without retiring", async (t) => {
  const f = await executionFixture(t, planSource({ pending: true }));
  await git(f.execution, "push", "-q", "origin", "HEAD:refs/heads/main");
  const before = await captureCheckout(f.execution);
  const heads = await remoteHeads(f.origin);
  const refused = await landWorktree({
    worktree: f.execution,
    branch,
    executionPlan: f.plan,
  });
  assert.equal(refused.stopped, "execution-completion");
  assertCheckoutUnchanged(before, await captureCheckout(f.execution));
  assert.deepEqual(await remoteHeads(f.origin), heads);
  assert.equal(existsSync(f.execution), true);
});

test("completed execution still Taken is not labelled unfinished and retains resources while its caller's retirement gate is absent", async (t) => {
  const f = await executionFixture(t, planSource());
  const assignment = readFileSync(join(f.execution, profile), "utf8");
  const landed = await landWorktree({
    worktree: f.execution,
    branch,
    executionPlan: f.plan,
    retirementAuthorized: false,
  });
  assert.equal(landed.stopped, null);
  assert.equal(landed.publication.publication, "accepted");
  assert.equal(landed.cleanup.removed, false);
  assert.equal(existsSync(f.execution), true);
  assert.equal(
    readFileSync(join(f.execution, ".planning/PRODUCT-BACKLOG.md"), "utf8"),
    claim,
  );
  assert.equal(readFileSync(f.plan, "utf8"), planSource());
  assert.equal(readFileSync(join(f.execution, profile), "utf8"), assignment);
  assert.equal(
    await revParse(f.execution, branch),
    (await git(f.execution, "rev-parse", "HEAD")).stdout.trim(),
  );
});
