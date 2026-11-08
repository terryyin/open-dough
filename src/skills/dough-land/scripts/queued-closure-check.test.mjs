// Git mechanics through Dough Land's model and its installed check command;
// native guidance-following acceptance belongs to the separate native runs.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import {
  cloneAsAnotherWriter,
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  createPreparationFixture,
  preparationRepository,
} from "../../dough-story-refinement/scripts/preparation-publication-test-fixtures.mjs";
import {
  landWorktree,
  runClosureCheckCommand,
} from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import { fileURLToPath } from "node:url";

const identity = "SEED-001#a";
const entry = "- [A](seeds/SEED-001-a.md#a) — SEED-001#a\n";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const backlog = (queued = "", taken = "") =>
  `# Product backlog\n\n## Taken\n\n${taken}\n## Backlog list\n\n${queued}`;

// Only establishes a retained result whose committed closure removed a queued
// entry. No ownership checking or landing is supplied by this fixture.
async function retainedResult(t, { listed = true } = {}) {
  const fixture = await createPreparationFixture(
    preparationRepository({
      trunk: {
        backlog: null,
        files: { [backlogPath]: backlog(listed ? entry : "") },
      },
      record: {
        files: { [backlogPath]: backlog(), "result.txt": "kept result\n" },
      },
    }),
  );
  t.after(fixture.cleanup);
  return fixture;
}

async function rival(fixture, kind) {
  const checkout = join(fixture.fixture, "rival");
  await cloneAsAnotherWriter(fixture.origin, checkout);
  if (kind === "take") {
    writeFileSync(join(checkout, backlogPath), backlog("", entry));
  } else {
    mkdirSync(join(checkout, ".planning/agents"));
    const profile = makeMe.anAgentProfile;
    const assignment = { name: "Yui", identity };
    if (kind === "execution") {
      profile.executing({
        ...assignment,
        mode: "story-branch",
        branch: "rival/a",
      });
    } else {
      profile.preparing(assignment);
    }
    writeFileSync(
      join(checkout, ".planning/agents/yui-chan.json"),
      renderAgentProfile(profile.please()),
    );
  }
  await git(checkout, "add", "-A");
  await git(checkout, "commit", "-m", "Another owner holds A");
  await git(checkout, "push", "origin", "main");
  return lsRemoteSha(fixture.origin, "refs/heads/main");
}

const land = (fixture, extra = {}) =>
  landWorktree({
    worktree: fixture.preparation,
    branch: fixture.preparationBranch,
    defaultCheckout: fixture.integration,
    ...extra,
  });

async function assertHeld(fixture, result, remoteSha) {
  assert.equal(result.stopped, "publish");
  assert.equal(result.publication.status, "ownership-changed");
  assert.equal(result.publication.publication, "stopped");
  assert.equal(result.publication.ownership.identity, identity);
  assert.equal(result.refresh, "not-attempted");
  assert.equal(result.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/main"), remoteSha);
  assert.equal(
    await revParse(fixture.preparation, "HEAD"),
    fixture.preparationSha,
  );
  assert.equal(existsSync(fixture.preparation), true);
}

test("unchanged queued A reports its closure, lands, and retires the retained workspace", async (t) => {
  const fixture = await retainedResult(t);
  assert.deepEqual(
    await runClosureCheckCommand({ checkout: fixture.preparation }),
    { code: 0, result: { ok: true, status: "clear", closes: [identity] } },
  );
  const result = await land(fixture);
  assert.equal(result.stopped, null);
  assert.equal(
    await lsRemoteSha(fixture.origin, "refs/heads/main"),
    result.publication.receipt.sha,
  );
  assert.equal(
    (await git(fixture.origin, "show", `main:${backlogPath}`)).stdout,
    backlog(),
  );
  assert.equal(
    (await git(fixture.origin, "show", "main:result.txt")).stdout,
    "kept result\n",
  );
  assert.equal(result.cleanup.removed, true);
  assert.equal(existsSync(fixture.preparation), false);
  // An already accepted candidate has no outstanding closure on rerun.
  assert.deepEqual(
    (await runClosureCheckCommand({ checkout: fixture.integration })).result
      .closes,
    [],
  );
});

for (const activity of ["preparation", "execution"]) {
  test(`rival ${activity} profile stops before caller checks and preserves result and trunk`, async (t) => {
    const fixture = await retainedResult(t);
    const remoteSha = await rival(fixture, activity);
    const checked = await runClosureCheckCommand({
      checkout: fixture.preparation,
    });
    assert.equal(checked.code, 1);
    assert.deepEqual(checked.result.ownership, {
      identity,
      agent: "Yui-chan",
      activity,
    });
    assert.match(checked.result.error, new RegExp(`Yui-chan for ${activity}`));
    let callerChecks = 0;
    const result = await land(fixture, {
      onFetchedTarget: () => {
        callerChecks += 1;
      },
    });
    await assertHeld(fixture, result, remoteSha);
    assert.equal(callerChecks, 0);
    assert.match(
      (await git(fixture.origin, "show", "main:.planning/agents/yui-chan.json"))
        .stdout,
      /SEED-001#a/,
    );
  });
}

test("rival Take stops at the check before the backlog rebase adapter", async (t) => {
  const fixture = await retainedResult(t);
  const remoteSha = await rival(fixture, "take");
  const checked = await runClosureCheckCommand({
    checkout: fixture.preparation,
  });
  assert.equal(checked.code, 1);
  assert.deepEqual(checked.result.ownership, { identity, list: "Taken" });
  const result = await land(fixture);
  await assertHeld(fixture, result, remoteSha);
  assert.match(result.publication.error, /already Taken/);
});

test("a Take racing the first push stops the retry without rewriting or pushing the result", async (t) => {
  const fixture = await retainedResult(t);
  let remoteSha;
  const attempts = [];
  const result = await land(fixture, {
    beforePush: async ({ attempt }) => {
      attempts.push(attempt);
      remoteSha = await rival(fixture, "take");
    },
  });
  await assertHeld(fixture, result, remoteSha);
  assert.deepEqual(attempts, [0]);
  assert.deepEqual(result.publication.ownership, { identity, list: "Taken" });
});

test("a Take racing a published-story landing stops before recomputing its merge", async (t) => {
  const fixture = await retainedResult(t);
  await git(
    fixture.preparation,
    "push",
    "origin",
    `HEAD:refs/heads/${fixture.preparationBranch}`,
  );
  let remoteSha;
  const attempts = [];
  const result = await land(fixture, {
    keepWorktree: true,
    publishedStoryTip: fixture.preparationSha,
    beforePush: async ({ attempt }) => {
      attempts.push(attempt);
      if (attempt === 0) remoteSha = await rival(fixture, "take");
    },
  });
  assert.equal(result.stopped, "publish", JSON.stringify(result));
  assert.equal(result.publication.reason, "ownership-changed");
  assert.deepEqual(result.publication.ownership, { identity, list: "Taken" });
  assert.deepEqual(attempts, [0]);
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/main"), remoteSha);
  assert.equal(
    await revParse(fixture.preparation, fixture.preparationBranch),
    fixture.preparationSha,
  );
  assert.equal(existsSync(fixture.preparation), true);
});

test("an unlisted kept result has no closure check to stop and lands as before", async (t) => {
  const fixture = await retainedResult(t, { listed: false });
  assert.deepEqual(
    await runClosureCheckCommand({ checkout: fixture.preparation }),
    { code: 0, result: { ok: true, status: "clear", closes: [] } },
  );
  const result = await land(fixture);
  assert.equal(result.stopped, null);
  assert.equal(result.cleanup.removed, true);
  assert.equal(
    (await git(fixture.origin, "show", "main:result.txt")).stdout,
    "kept result\n",
  );
});

test("the installed check rejects missing required publication inputs with one JSON line and exit 2", async () => {
  const command = fileURLToPath(
    new URL("queued-closure-check.mjs", import.meta.url),
  );
  await assert.rejects(
    exec("node", [command, "check", "--checkout", "."]),
    (error) => {
      assert.equal(error.code, 2);
      assert.equal(error.stdout.trim().split("\n").length, 1);
      assert.equal(JSON.parse(error.stdout).status, "usage-error");
      return true;
    },
  );
});
