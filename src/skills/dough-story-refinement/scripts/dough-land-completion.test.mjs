// Resolved-plan enforcement at the Git-model landing boundary. This invokes
// the production completion checker; it does not claim native guidance use.
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import assert from "node:assert/strict";
import { renderPlanSlice } from "../../../../tests/support/published-plan.mjs";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  remoteHeads,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import { renderPublishedBacklog } from "../../../../tests/support/published-backlog.mjs";
import { agentIdentity } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

const identity = "SEED-1#ongoing";
const branch = "exec/story";
const profile = `.planning/${agentIdentity("jackson").path}`;
const ongoingStory = makeMe.aBacklogEntry
  .with({
    identity,
    title: "Ongoing",
    href: "story.md#ongoing",
    plan: { label: "plan", target: "PLAN.md" },
  })
  .please();
const claim = renderPublishedBacklog({ taken: [ongoingStory] });
function planSource({ pending = false, obligation = false } = {}) {
  const slices = [...Array(14).keys()].map((at) =>
    makeMe.aPlanSlice
      .with({
        index: at + 1,
        name: at === 13 ? "Release the result" : `Work ${at + 1}`,
        status: pending && at === 13 ? "planned" : "done",
      })
      .please(),
  );
  return `# Execution plan
**Source:** [selected story](story.md#ongoing)

## Ordered slices
${slices.map(renderPlanSlice).join("\n\n")}
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
// A trunk holding the tracked `trunk.txt` a reviewer edits, and a workspace
// whose one unpublished commit records the ongoing execution: its plan
// `source`, the seed draft, the Taken claim and the agent's assignment. That
// commit is published to the execution branch.
async function executionFixture(t, source) {
  const f = await materializeRepository(
    makeMe.aRepository
      .withRevision("trunk", { files: { "trunk.txt": "base\n" } })
      .withWorkspace(branch, { from: "trunk" })
      .withUnpublishedRevision("ongoing", {
        backlog: { taken: [ongoingStory] },
        files: {
          ".planning/PLAN.md": source,
          ".planning/story.md":
            '# Stories\n\n<a id="ongoing"></a>\n\n### Ongoing\n\nA release is available.\n',
        },
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({
              name: "jackson",
              identity,
              mode: "story-branch",
              branch,
            })
            .please(),
        ],
        message: "Record ongoing execution",
      })
      .please(),
  );
  t.after(f.cleanup);
  await git(f.execution, "push", "-q", "origin", `HEAD:refs/heads/${branch}`);
  return { ...f, plan: join(f.execution, ".planning/PLAN.md") };
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
