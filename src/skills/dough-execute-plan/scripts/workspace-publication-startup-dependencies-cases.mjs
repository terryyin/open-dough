// The real startup command checks published dependency agreements before
// creating a workspace/claim. No native process can be launched on refusal.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  dependency,
  readDependencies,
  resolution,
  updateDependency,
} from "../../../../tests/support/story-dependencies-fixture.mjs";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { draftLateStory } from "./workspace-publication-admission-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

import {
  consumer,
  projectOf,
  publishDependency,
  supplier,
} from "./workspace-publication-dependency-fixtures.mjs";
import "./workspace-publication-startup-dependency-recovery-cases.mjs";

for (const oneShot of [false, true]) {
  test(`published blocker refuses ${oneShot ? "queued one-shot" : "ordinary"} start beside a stale ready local copy`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const path = join(trunk.integration, ".planning/seeds/A.md");
    const stale = readFileSync(path, "utf8");
    const tip = await publishDependency(trunk, dependency(supplier));
    const facts = await readDependencies(projectOf(trunk), consumer);
    assert.equal(facts.blocking[0].supplier.identity, identityB);
    writeFileSync(path, stale);
    const result = await startCliResult(
      trunk,
      "story-branch",
      oneShot ? ["--one-shot"] : [],
    );
    assert.equal(result.code, 1, JSON.stringify(result));
    assert.equal(result.receipt.status, "source-refused");
    assert.match(result.receipt.error, /execution is blocked by SEED-B#b/);
    assert.match(result.receipt.error, /normal reconciliation cannot supply/);
    assert.match(result.receipt.error, /completion condition/);
    assert.equal(existsSync(result.workspace), false);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
    assert.deepEqual(
      takenIdentities(
        (await git(trunk.origin, "show", "main:.planning/PRODUCT-BACKLOG.md"))
          .stdout,
      ),
      [],
    );
    assert.equal(
      (
        await git(
          trunk.origin,
          "ls-tree",
          "--name-only",
          "main",
          ".planning/agents/",
        )
      ).stdout,
      "",
    );
    assert.equal(
      await lsRemoteSha(trunk.origin, `refs/heads/${result.branch}`),
      "",
    );
  });
}

test("all dependencies must be satisfied before a ready story starts", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const third = { identity: "SUPPLIER-3", link: "seeds/third.md" };
  writeFileSync(
    join(trunk.integration, ".planning/seeds/third.md"),
    `# Third supplier\n**Identity:** ${third.identity}\n`,
  );
  await publishDependency(trunk, dependency(supplier));
  await publishDependency(trunk, dependency(third));
  await publishDependency(
    trunk,
    dependency(supplier, { state: "satisfied", resolution }),
  );
  const partial = await startCliResult(trunk, "story-branch");
  assert.equal(partial.code, 1);
  assert.match(partial.receipt.error, /SUPPLIER-3/);
  assert.doesNotMatch(partial.receipt.error, /SEED-B#b/);
  assert.equal(existsSync(partial.workspace), false);
  await publishDependency(
    trunk,
    dependency(third, { state: "satisfied", resolution }),
  );
  const complete = await startCliResult(trunk, "story-branch");
  assert.equal(complete.code, 0, JSON.stringify(complete));
  assert.equal(complete.receipt.ok, true);
  assert.equal(complete.receipt.changedSinceReview, true);
  assert.equal(existsSync(complete.workspace), true);
});

test("a canonical story admitted with a drafted dependency refuses before Take", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const late = draftLateStory(trunk);
  const result = await updateDependency(
    projectOf(trunk),
    { identity: late.identity, link: "seeds/A.md#late" },
    dependency(supplier),
  );
  assert.equal(result.code, 0, result.stderr);
  const start = await startCliResult(trunk, "story-branch", late.args, {
    identity: late.identity,
  });
  assert.equal(start.code, 1, JSON.stringify(start));
  assert.match(start.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(start.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("published unlisted admission dependency cannot be bypassed by an older draft", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const late = draftLateStory(trunk);
  const path = join(trunk.integration, late.seedPath);
  const stale = readFileSync(path, "utf8");
  const tip = await publishDependency(trunk, dependency(supplier), {
    identity: late.identity,
    link: "seeds/A.md#late",
  });
  writeFileSync(path, stale);
  const start = await startCliResult(trunk, "story-branch", late.args, {
    identity: late.identity,
  });
  assert.equal(start.code, 1, JSON.stringify(start));
  assert.match(start.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(start.workspace), false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
});

test("carrying a queued one-shot attempt into admission preserves the published start gate", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const tip = await publishDependency(trunk, dependency(supplier));
  const start = await startCliResult(trunk, "story-branch", [
    "--admit",
    "--carry",
    "--link",
    consumer.link,
    "--title",
    "Story A",
  ]);
  assert.equal(start.code, 1, JSON.stringify(start));
  assert.match(start.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(start.workspace), false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
});

test("a malformed published dependency cannot look like no blockers", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const path = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    path,
    `${readFileSync(path, "utf8")}\n\`\`\`json dough-story-dependencies\n{}\n\`\`\`\n`,
  );
  await git(trunk.integration, "commit", "-am", "malformed prerequisite");
  await git(trunk.integration, "push", "origin", "main");
  for (const extra of [[], ["--one-shot"]]) {
    const result = await startCliResult(trunk, "story-branch", extra);
    assert.equal(result.code, 1);
    assert.match(result.receipt.error, /dependency schema version/);
    assert.equal(existsSync(result.workspace), false);
  }
});
