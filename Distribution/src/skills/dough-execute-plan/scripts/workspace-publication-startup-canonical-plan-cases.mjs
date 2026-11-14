// A plan declared as the canonical home itself is read as that home: the
// Taken entry never links it, whether the work was queued or admitted.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { direction } from "../../../../tests/support/product-backlog-fixture.mjs";
import { renderPublishedBacklog } from "../../../../tests/support/published-backlog.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
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

// Correction C in the legacy shape a correction had before corrections got
// stories: its backlog link is its own recorded plan. Such work keeps its
// identity and stays executable without migration.
test("a legacy correction whose plan is its canonical home is Taken without a plan link", async (t) => {
  const identity = "slice-plans/C";
  const href = "slice-plans/C/PLAN.md";
  const entry = `- [Correction C](${href}) — ${identity}`;
  const plan = `# Correction C\n\n**Identity:** ${identity}\n\nCorrect C.\n`;
  const backlog = renderPublishedBacklog({
    direction,
    queued: [storyA, storyB],
  }).replace("## Backlog list\n\n", `## Backlog list\n\n${entry}\n`);
  const repository = queuedReadyRepository()
    .withRevision("queue legacy correction", {
      files: {
        ".planning/PRODUCT-BACKLOG.md": backlog,
        [`.planning/${href}`]: readyAsItsOwnPlan(
          plan,
          href,
          identity,
          "PLAN.md",
        ),
      },
    })
    .please();
  for (const selectPlan of [false, true]) {
    const trunk = await materializeRepository(repository);
    t.after(trunk.cleanup);
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
  const storyD = makeMe.aBacklogEntry
    .with({ identity, href: link, title: "Story D" })
    .please();
  const entry = `- [Story D](${link}) — ${identity}`;
  const seed = `---\nid: SEED-D\n---\n\n# Seed D\n\n${storySection("d", identity, "Story D", "Deliver D.")}`;
  for (const admitted of [false, true]) {
    const readySeed = readyAsItsOwnPlan(seed, link, identity, "D.md");
    const repository = queuedReadyRepository();
    const trunk = await materializeRepository(
      admitted
        ? repository.please()
        : repository
            .withRevision("queue Story D", {
              backlog: { direction, queued: [storyD, storyA, storyB] },
              files: { ".planning/seeds/D.md": readySeed },
            })
            .please(),
    );
    t.after(trunk.cleanup);
    if (admitted) writeDraft(trunk, ".planning/seeds/D.md", readySeed);
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
