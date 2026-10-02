// Readiness judgments and review changes through the real startup command.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

// The local copy is either the pushed stale story or, restored to the assessed
// bytes in the default checkout's worktree and index, a ready-looking one.
for (const readyLocalCopy of [false, true]) {
  test(`changed published Ready starts with one Taken claim${readyLocalCopy ? " beside a ready-looking local copy" : ""}`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const seed = join(trunk.integration, ".planning/seeds/A.md");
    const assessed = readFileSync(seed, "utf8");
    writeFileSync(
      seed,
      assessed.replace("Execute A.", "Changed after assessment."),
    );
    await git(trunk.integration, "add", ".planning/seeds/A.md");
    await git(trunk.integration, "commit", "-m", "stale assessment");
    await git(trunk.integration, "push", "origin", "main");
    if (readyLocalCopy) {
      writeFileSync(seed, assessed);
      await git(trunk.integration, "add", ".planning/seeds/A.md");
    }
    const local = {
      checkout: await captureCheckout(trunk.integration),
      seed: readFileSync(seed, "utf8"),
    };
    const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
    assert.equal(code, 0, JSON.stringify(receipt));
    assert.equal(receipt.ok, true);
    assert.equal(receipt.changedSinceReview, true);
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      receipt.publishedSha,
    );
    assert.equal(existsSync(workspace), true);
    assert.equal(
      takenIdentities(await remoteBacklog(workspace)).filter(
        (id) => id === identityA,
      ).length,
      1,
    );
    const publishedSeed = (
      await git(workspace, "show", "origin/main:.planning/seeds/A.md")
    ).stdout;
    const assessmentBlock = (text) =>
      text.match(/```json dough-story-state\n[^`]+```/)[0];
    assert.equal(assessmentBlock(publishedSeed), assessmentBlock(assessed));
    if (readyLocalCopy) {
      assert.deepEqual(
        {
          checkout: await captureCheckout(trunk.integration),
          seed: readFileSync(seed, "utf8"),
        },
        local,
      );
    }
  });
}

test("a published sibling story added after readiness still takes the ready story", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seed = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    seed,
    `${readFileSync(seed, "utf8")}\n<a id="sibling"></a>\n\n### Sibling story\n\n**Identity:** SEED-A#sibling\n\nPrepared after A was assessed.\n`,
  );
  await git(trunk.integration, "add", ".planning/seeds/A.md");
  await git(trunk.integration, "commit", "-m", "add sibling story");
  await git(trunk.integration, "push", "origin", "main");
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.equal(
    takenIdentities(await remoteBacklog(workspace)).includes(identityA),
    true,
  );
});

for (const preparation of ["not-ready", "absent"]) {
  test(`published ${preparation} still refuses startup after content changes`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const seed = join(trunk.integration, ".planning/seeds/A.md");
    const current = readFileSync(seed, "utf8");
    const changed = current.replace("Execute A.", "Changed after review.");
    writeFileSync(
      seed,
      preparation === "not-ready"
        ? changed.replace(
            '"assessment":"ready","reasons":[]',
            '"assessment":"not-ready","reasons":["Scope unresolved"]',
          )
        : changed.replace(
            /,"assessment":"ready","reasons":\[\],"basis":\{[^}]+\}/,
            "",
          ),
    );
    await git(trunk.integration, "commit", "-am", "change unready source");
    await git(trunk.integration, "push", "origin", "main");
    const tip = await revParse(trunk.integration, "HEAD");
    const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
    assert.equal(code, 1, JSON.stringify(receipt));
    assert.equal(receipt.status, "source-refused");
    assert.match(receipt.error, new RegExp(preparation));
    assert.equal(existsSync(workspace), false);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  });
}

test("continued Taken starts report changes and clear them after a real current review", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seed = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    seed,
    readFileSync(seed, "utf8").replace("Execute A.", "Changed after review."),
  );
  await git(trunk.integration, "commit", "-am", "change assessed source");
  await git(trunk.integration, "push", "origin", "main");
  const first = await startCliResult(trunk, "trunk");
  assert.equal(first.code, 0, JSON.stringify(first.receipt));
  const continuation = await startCliResult(trunk, "trunk");
  assert.equal(
    continuation.receipt.status,
    "existing",
    JSON.stringify(continuation.receipt),
  );
  assert.equal(continuation.receipt.changedSinceReview, true);
  assert.equal(continuation.receipt.publishedSha, first.receipt.publishedSha);
  const home = readFileSync(seed, "utf8");
  const plan = readFileSync(
    join(trunk.integration, ".planning/slice-plans/A/PLAN.md"),
    "utf8",
  );
  const reviewed = recordStoryState(
    home,
    {
      href: "seeds/A.md#a",
      identity: identityA,
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/A/PLAN.md",
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(home, plan),
    },
    { planSource: plan },
  );
  writeFileSync(seed, reviewed.source);
  await git(trunk.integration, "commit", "-am", "review changed content");
  await git(trunk.integration, "push", "origin", "main");
  const tip = await revParse(trunk.integration, "HEAD");
  const fresh = await startCliResult(trunk, "trunk");
  assert.equal(fresh.receipt.status, "existing", JSON.stringify(fresh.receipt));
  assert.equal(fresh.receipt.changedSinceReview, false);
  assert.equal(fresh.receipt.publishedSha, first.receipt.publishedSha);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
});
