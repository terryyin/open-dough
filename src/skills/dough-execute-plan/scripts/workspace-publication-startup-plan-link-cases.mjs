// Startup reads an entry's plan link by the backlog's one plan-link rule: a
// link to a section of the declared plan links that plan and is taken as
// written, a declared plan naming the story's own seed is never linked, and a
// link to a different plan file is refused naming the entry's list. A plan
// requested with `--plan` is compared by the same rule: a section requests its
// plan, which the entry then links as preparation declares it.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import {
  admitArgs,
  listed,
  pushFromElsewhere,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  remoteBacklog,
  startCliResult,
  storyA,
} from "./workspace-publication-fixtures.mjs";

const backlogFile = ".planning/PRODUCT-BACKLOG.md";
const linking = (target) => `${storyA} ([plan](${target}))`;

// Publishes trunk's backlog with `from` replaced by `to`.
async function publishEntry(trunk, from, to) {
  const backlog = join(trunk.integration, backlogFile);
  writeFileSync(backlog, readFileSync(backlog, "utf8").replace(from, to));
  await git(trunk.integration, "add", ".planning");
  await git(trunk.integration, "commit", "-m", `list ${to}`);
  await git(trunk.integration, "push", "origin", "main");
  return revParse(trunk.integration, "HEAD");
}

// Starts story A from a workspace not yet made, expecting a refusal that
// names the entry's `list`, leaves trunk at `tip` and makes no workspace.
async function assertRefused(trunk, list, tip) {
  const workspace = join(trunk.fixture, `start-${list}`);
  const { receipt } = await startCliResult(trunk, "trunk", [
    "--workspace",
    workspace,
    "--branch",
    `exec/${list}`,
  ]);
  assert.equal(receipt.status, "source-refused", JSON.stringify(receipt));
  assert.match(receipt.error, new RegExp(`^${list} plan link disagrees`));
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(existsSync(workspace), false);
}

test("a queued entry linking a section of its declared plan is taken with its link unchanged", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const entry = linking("slice-plans/A/PLAN.md#ordered-slices");
  await publishEntry(trunk, storyA, entry);
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  const backlog = await remoteBacklog(workspace);
  assert.deepEqual(
    backlog.split("\n").filter((line) => line.startsWith("- [Story A]")),
    [entry],
  );
  assert.ok(backlog.indexOf(entry) < backlog.indexOf("## Backlog list"));
});

test("queued and Taken entries linking a different plan file are refused naming their list", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const queuedTip = await publishEntry(
    trunk,
    storyA,
    linking("slice-plans/B/PLAN.md"),
  );
  await assertRefused(trunk, "queued", queuedTip);
  await publishEntry(trunk, linking("slice-plans/B/PLAN.md"), storyA);
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  const takenTip = await pushFromElsewhere(trunk, backlogFile, (text) =>
    text.replace("(slice-plans/A/PLAN.md)", "(slice-plans/B/PLAN.md)"),
  );
  // The claim's own publisher continuing it.
  await assertRefused(trunk, "Taken", takenTip);
});

test("a story whose declared plan is a section of its own seed is taken without a plan link", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-E#e";
  const link = "seeds/E.md#e";
  const entry = `- [Story E](${link}) — ${identity}`;
  const seed = `---\nid: SEED-E\n---\n\n# Seed E\n\n${storySection("e", identity, "Story E", "Deliver E.")}`;
  const recorded = recordStoryState(
    seed,
    {
      href: link,
      identity,
      refinement: "refined",
      approach: "planned",
      plan: "E.md#e",
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed),
    },
    { planIsCanonical: true },
  ).source;
  writeDraft(trunk, ".planning/seeds/E.md", recorded);
  await publishEntry(
    trunk,
    "## Backlog list\n\n",
    `## Backlog list\n\n${entry}\n`,
  );
  const { receipt, workspace } = await startCliResult(trunk, "trunk", [
    "--identity",
    identity,
  ]);
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.equal(receipt.plan, undefined);
  const backlog = await remoteBacklog(workspace);
  assert.deepEqual(
    backlog.split("\n").filter((line) => line.includes(identity)),
    [entry],
  );
});

// Starts with `args` as `name`, expecting the requested plan's refusal with
// trunk unchanged and no workspace.
async function assertRequestRefused(trunk, args, name) {
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
  const { receipt, workspace } = await startCliResult(trunk, "trunk", args, {
    name,
  });
  assert.equal(receipt.status, "source-refused", JSON.stringify(receipt));
  assert.match(receipt.error, /^requested plan disagrees/);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(existsSync(workspace), false);
}

test("queued work requesting a section of its declared plan is taken linking that plan", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await assertRequestRefused(trunk, ["--plan", "slice-plans/B/PLAN.md"], "B");
  const { receipt } = await startCliResult(trunk, "trunk", [
    "--plan",
    "slice-plans/A/PLAN.md#ordered-slices",
  ]);
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  const entry = (await listed(trunk, receipt.publishedSha)).find(
    (item) => item.identity === identityA,
  );
  assert.deepEqual(
    [entry.list, entry.plan?.target],
    ["Taken", "slice-plans/A/PLAN.md"],
  );
});

test("admitted work requesting a section of its declared plan is taken linking that plan", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-A#n";
  const link = "seeds/A.md#n";
  const seedPath = ".planning/seeds/A.md";
  writeDraft(trunk, ".planning/slice-plans/N/PLAN.md", "# Plan N\n");
  const local = readFileSync(join(trunk.integration, seedPath), "utf8");
  const section = storySection("n", identity, "Story N", "Deliver N.");
  writeDraft(
    trunk,
    seedPath,
    withFacts(
      `${local}\n${section}`,
      link,
      identity,
      "planned",
      "../slice-plans/N/PLAN.md",
    ),
  );
  const admit = (plan) => admitArgs(identity, link, "Story N", "--plan", plan);
  await assertRequestRefused(trunk, admit("slice-plans/B/PLAN.md"), "B");
  const { receipt } = await startCliResult(
    trunk,
    "trunk",
    admit("slice-plans/N/PLAN.md#ordered-slices"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  const entry = (await listed(trunk, receipt.publishedSha)).find(
    (item) => item.identity === identity,
  );
  assert.deepEqual(
    [entry.list, entry.plan?.target],
    ["Taken", "slice-plans/N/PLAN.md"],
  );
});
