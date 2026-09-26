// A plan declared as the canonical home itself is read as that home: the
// Taken entry never links it, whether the work was queued or admitted.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "./publication-test-fixtures.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import {
  admitArgs,
  storySection,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  createQueuedTrunk,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";

// `source` with ready preparation that declares `plan`, the home itself, as
// its plan.
function readyAsItsOwnPlan(source, href, identity, plan) {
  return recordStoryState(
    source,
    {
      href,
      identity,
      refinement: "refined",
      approach: "planned",
      plan,
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(source),
    },
    { planIsCanonical: true },
  ).source;
}

// Publishes `entry` at the top of trunk's backlog list with the drafted home.
async function queue(trunk, entry) {
  const backlog = join(trunk.integration, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8").replace(
      "## Backlog list\n\n",
      `## Backlog list\n\n${entry}\n`,
    ),
  );
  await git(trunk.integration, "add", ".planning");
  await git(trunk.integration, "commit", "-m", `queue ${entry}`);
  await git(trunk.integration, "push", "origin", "main");
}

// Correction C in the legacy shape a correction had before corrections got
// stories: its backlog link is its own recorded plan. Such work keeps its
// identity and stays executable without migration.
test("a legacy correction whose plan is its canonical home is Taken without a plan link", async (t) => {
  const identity = "slice-plans/C";
  const href = "slice-plans/C/PLAN.md";
  const entry = `- [Correction C](${href}) — ${identity}`;
  const plan = `# Correction C\n\n**Identity:** ${identity}\n\nCorrect C.\n`;
  for (const selectPlan of [false, true]) {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    writeDraft(
      trunk,
      `.planning/${href}`,
      readyAsItsOwnPlan(plan, href, identity, "PLAN.md"),
    );
    await queue(trunk, entry);
    const { receipt, workspace } = await startCliResult(trunk, "story-branch", [
      "--identity",
      identity,
      ...(selectPlan ? ["--plan", href] : []),
    ]);
    assert.equal(receipt.status, "published", JSON.stringify(receipt));
    const backlog = await remoteBacklog(workspace);
    assert.deepEqual(
      backlog.split("\n").filter((line) => line.endsWith(identity)),
      [entry],
    );
    assert.ok(
      backlog.indexOf(entry) < backlog.indexOf("## Backlog list"),
      backlog,
    );
  }
});

// Story D in its own seed D declares that seed as its plan, with a ready
// assessment of the seed alone.
test("a story whose seed is its own plan is Taken without a plan link, queued or admitted", async (t) => {
  const identity = "SEED-D#d";
  const link = "seeds/D.md#d";
  const entry = `- [Story D](${link}) — ${identity}`;
  const seed = `---\nid: SEED-D\n---\n\n# Seed D\n\n${storySection("d", identity, "Story D", "Deliver D.")}`;
  for (const admitted of [false, true]) {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    writeDraft(
      trunk,
      ".planning/seeds/D.md",
      readyAsItsOwnPlan(seed, link, identity, "D.md"),
    );
    if (!admitted) await queue(trunk, entry);
    const { receipt, workspace } = await startCliResult(
      trunk,
      "story-branch",
      admitted
        ? admitArgs(identity, link, "Story D")
        : ["--identity", identity],
    );
    const how = admitted ? "admitted" : "queued";
    assert.equal(
      receipt.status,
      "published",
      `${how}: ${JSON.stringify(receipt)}`,
    );
    assert.equal(receipt.plan, undefined, how);
    const backlog = await remoteBacklog(workspace);
    assert.deepEqual(
      backlog.split("\n").filter((line) => line.includes(identity)),
      [entry],
      how,
    );
  }
});
