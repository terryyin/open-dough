// An admitted investigation continues into implementation under the same
// Taken claim: its plan and ready assessment are recorded with the real
// record-state operation and published as ordinary preparation, then the
// ordinary startup command continues the claim instead of taking the work
// again. Investigation, Taken membership, or unpublished preparation alone
// never starts implementation. Admitting the same work again continues its
// claim only for the claim's publisher. Driven through the real CLIs against a
// local bare remote.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  admitArgs,
  listed,
  neverQueued,
  publishPlannedPreparation,
  remoteText,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";

const identity = "SEED-N#slow";
const link = "seeds/N.md#slow";
const seedPath = ".planning/seeds/N.md";
const story = { identity, link, planHref: "../slice-plans/N/PLAN.md" };
const plan = "# Plan N\n\n### 1. Speed up start\n";

const continueArgs = ["--identity", identity, "--host", "claude"];

test("an admitted investigation continues into planned implementation under its one claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const draft = withFacts(
    `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("slow", identity, "Investigate slow start", "Find why startup is slow.")}`,
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, seedPath, draft);
  const admitted = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "Investigate slow start"),
  );
  assert.equal(
    admitted.receipt.status,
    "published",
    JSON.stringify(admitted.receipt),
  );
  const claimSha = admitted.receipt.publishedSha;
  const tipIs = async (sha) =>
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  const refusal = async (pattern, tip) => {
    const { receipt } = await startCliResult(trunk, "trunk", continueArgs);
    assert.equal(receipt.status, "source-refused", JSON.stringify(receipt));
    assert.match(receipt.error, pattern);
    await tipIs(tip);
  };

  // Investigation under Taken does not authorize implementation.
  await refusal(/approach is unselected/, claimSha);

  // A published plan without a ready assessment is still not authority.
  const plannedSha = await publishPlannedPreparation(trunk, story, { plan });
  await refusal(/published preparation is absent/, plannedSha);

  const readySha = await publishPlannedPreparation(trunk, story, {
    plan,
    ready: true,
  });

  // An unpublished local story edit stops continuation; the admission draft
  // left in the originating checkout does not.
  writeFileSync(
    join(trunk.integration, seedPath),
    draft.replace("Find why", "Locally, find why"),
  );
  await refusal(/unpublished selected story source/, readySha);
  writeFileSync(join(trunk.integration, seedPath), draft);

  const continued = await startCliResult(trunk, "trunk", continueArgs);
  assert.equal(
    continued.receipt.status,
    "existing",
    JSON.stringify(continued.receipt),
  );
  assert.equal(continued.receipt.publishedSha, claimSha);
  assert.equal(continued.receipt.plan, "slice-plans/N/PLAN.md");
  assert.equal(continued.receipt.created, false);
  await tipIs(readySha);

  // Another publisher cannot continue this claim.
  const rival = await startCliResult(trunk, "rival", [
    ...continueArgs,
    "--mode",
    "trunk",
  ]);
  assert.equal(rival.receipt.status, "conflict", JSON.stringify(rival.receipt));
  assert.equal(existsSync(rival.workspace), false);
  await tipIs(readySha);

  // One story, one Taken entry, one claim and one profile throughout.
  const seed = await remoteText(trunk, readySha, seedPath);
  assert.equal(seed.split('<a id="slow">').length, 2);
  assert.deepEqual(
    (await listed(trunk, readySha))
      .filter((entry) => entry.identity === identity)
      .map((entry) => entry.list),
    ["Taken"],
  );
  await neverQueued(trunk, readySha, identity);
  const log = (await git(trunk.origin, "log", "--format=%B", readySha)).stdout;
  assert.equal(log.split(`Claim-Identity: ${identity}`).length, 2);
  const profiles = (
    await git(
      trunk.origin,
      "ls-tree",
      "--name-only",
      readySha,
      ".planning/agents/",
    )
  ).stdout
    .trim()
    .split("\n");
  assert.deepEqual(profiles, [".planning/agents/yui-chan.json"]);
  assert.equal(readFileSync(join(trunk.integration, seedPath), "utf8"), draft);
});

test("the same publisher continues its admitted claim; another publisher is refused", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const fix = { identity: "SEED-N#fix", link: "seeds/N.md#fix" };
  writeDraft(
    trunk,
    ".planning/seeds/N.md",
    withFacts(
      `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("fix", fix.identity, "Fix N", "Repair N.")}`,
      fix.link,
      fix.identity,
      "planless",
    ),
  );
  const args = admitArgs(fix.identity, fix.link, "Fix N");
  const first = await startCliResult(trunk, "trunk", args);
  assert.equal(
    first.receipt.status,
    "published",
    JSON.stringify(first.receipt),
  );
  const again = await startCliResult(trunk, "trunk", args);
  assert.equal(again.receipt.status, "existing", JSON.stringify(again.receipt));
  assert.equal(again.receipt.publishedSha, first.receipt.publishedSha);
  const rival = await startCliResult(trunk, "rival", [
    ...args,
    "--mode",
    "trunk",
  ]);
  assert.equal(rival.receipt.status, "conflict", JSON.stringify(rival.receipt));
  assert.equal(rival.receipt.ownership, "other");
  assert.equal(existsSync(rival.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    first.receipt.publishedSha,
  );
});
