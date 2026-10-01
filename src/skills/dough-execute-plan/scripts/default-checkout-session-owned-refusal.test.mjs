// Owned starts must refuse the main worktree before fetching, carrying edits,
// refreshing, or publishing. Only --one-shot --default-main opts into it.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { snapshot } from "./default-checkout-test-fixtures.mjs";
import { git } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { createPreparationTrunk } from "../../dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import {
  start as startRefinement,
  useInstalledPayload,
} from "../../dough-story-refinement/scripts/one-shot-refinement-test-fixtures.mjs";

useInstalledPayload();

async function unchangedState(trunk) {
  const checkout = trunk.integration;
  const directory = (
    await git(checkout, "rev-parse", "--absolute-git-dir")
  ).stdout.trim();
  const bytes = (path) =>
    existsSync(path) ? readFileSync(path).toString("base64") : null;
  return {
    ...(await snapshot(checkout, trunk.origin)),
    trunkFile: bytes(join(checkout, "trunk.txt")),
    refs: (await git(checkout, "for-each-ref")).stdout,
    indexBytes: bytes(join(directory, "index")),
    fetchHead: bytes(join(directory, "FETCH_HEAD")),
    config: bytes(join(directory, "config")),
    headLog: bytes(join(directory, "logs/HEAD")),
  };
}

for (const [label, extra, dirty] of [
  ["tracked queued Take", [], false],
  [
    "admitted carry",
    [
      "--admit",
      "--identity",
      "SEED-B#b",
      "--link",
      "seeds/B.md#b",
      "--title",
      "Story B",
      "--carry",
    ],
    true,
  ],
  ["isolated one-shot", ["--one-shot"], false],
]) {
  test(`${label} refuses the main worktree without changing anything`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    if (dirty) {
      writeFileSync(
        join(trunk.integration, "trunk.txt"),
        "uncommitted tracked edit\n",
      );
      writeFileSync(
        join(trunk.integration, "untracked.txt"),
        "untracked edit\n",
      );
    }
    const before = await unchangedState(trunk);
    const result = await startCliResult(trunk, "trunk", extra, {
      workspace: trunk.integration,
      branch: "main",
      integration: null,
    });
    assert.equal(result.code, 1, JSON.stringify(result.receipt));
    assert.equal(result.receipt.status, "invalid-request");
    assert.match(
      result.receipt.error,
      /main worktree.*separate owned workspace/,
    );
    assert.deepEqual(await unchangedState(trunk), before);
    assert.equal(
      (await git(trunk.integration, "for-each-ref", "refs/dough/carried/"))
        .stdout,
      "",
    );
  });
}

test("assigned preparation refuses the main worktree without changing anything", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const before = await unchangedState(trunk);
  const result = await startRefinement(
    trunk,
    trunk.integration,
    ["--push-authorized"],
    "main",
    { integration: null },
  );
  assert.equal(result.code, 1, JSON.stringify(result.receipt));
  assert.equal(result.receipt.status, "workspace-selection-failed");
  assert.match(result.receipt.error, /main worktree.*separate owned workspace/);
  assert.deepEqual(await unchangedState(trunk), before);
  assert.equal(
    (await git(trunk.integration, "for-each-ref", "refs/dough/carried/"))
      .stdout,
    "",
  );
});
