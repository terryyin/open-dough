// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Work admitted by the real startup CLI closes through ordinary Trunk Mode
// wrap-up: the before-cleanup publication brings the owned workspace onto
// current trunk, the spent story section (or seed), plan, Taken entry and
// agent profile go through the real backlog `complete` CLI and the closure
// publication, and the remote tree keeps result commits, enduring knowledge,
// unfinished sibling stories and another agent's assignment.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
import { createQueuedTrunk } from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  admitArgs,
  appendSiblingElsewhere,
  draftLateStory,
  remoteText,
  storySection,
  withFacts,
  writeDraft,
} from "../../dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import {
  admit,
  closeInTrunkMode,
  completeCli,
  lists,
  profileOf,
  remoteProfileNames,
  seedA,
  withoutStory,
} from "./closure-admitted-work-fixtures.mjs";
import {
  commitFile,
  git,
  lsRemoteSha,
} from "./closure-publication-fixtures.mjs";

test("an admitted planned mission and a new correction story close in turn, keeping the unfinished sibling", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const originalSeed = await remoteText(trunk, "main", seedA);
  const late = draftLateStory(trunk);
  const lateOwned = await admit(trunk, "late", late.args);

  // A retrospective's new correction: a minimal story after Late in seed A,
  // linked to its correction plan, admitted by another agent.
  const correction = "SEED-A#order-notes";
  const correctionPlan = ".planning/slice-plans/R/PLAN.md";
  writeDraft(trunk, correctionPlan, "# Order notes\n\nFinding: file order.\n");
  writeDraft(
    trunk,
    seedA,
    withFacts(
      `${readFileSync(join(trunk.integration, seedA), "utf8")}\n${storySection("order-notes", correction, "Order notes", "List notes in release order.")}`,
      "seeds/A.md#order-notes",
      correction,
      "planned",
      "../slice-plans/R/PLAN.md",
    ),
  );
  const correctionOwned = await admit(
    trunk,
    "correction",
    admitArgs(correction, "seeds/A.md#order-notes", "Order notes"),
  );
  const correctionProfile = await profileOf(trunk, "main", correction);

  // The late mission delivers its result as an ordinary increment.
  await commitFile(lateOwned.workspace, "late.txt", "late result\n", "Late");
  const increment = await publishExecutionIncrement({
    workspace: lateOwned.workspace,
    branch: lateOwned.branch,
    previouslyPublishedBase: lateOwned.sha,
    targetRef: "refs/heads/main",
    validate: async () => ({ ok: true }),
  });
  assert.equal(increment.ok, true, JSON.stringify(increment));

  mkdirSync(join(lateOwned.workspace, "docs"));
  const closed = await closeInTrunkMode(
    trunk,
    lateOwned,
    increment.receipt.sha,
    late.identity,
    {
      cleanup(workspace) {
        writeFileSync(join(workspace, "docs/late.md"), "Late behavior.\n");
        rmSync(join(workspace, ".planning/slice-plans/late"), {
          recursive: true,
        });
        const path = join(workspace, seedA);
        writeFileSync(path, withoutStory(readFileSync(path, "utf8"), "late"));
      },
    },
  );
  const { tip } = closed;
  const seed = await remoteText(trunk, tip, seedA);
  assert.doesNotMatch(seed, /SEED-A#late/);
  assert.match(seed, /\*\*Identity:\*\* SEED-A#a\n/);
  assert.match(seed, /\*\*Identity:\*\* SEED-A#order-notes\n/);
  assert.equal(await remoteText(trunk, tip, late.planPath), null);
  assert.equal(await remoteText(trunk, tip, "late.txt"), "late result\n");
  assert.equal(
    await remoteText(trunk, tip, "docs/late.md"),
    "Late behavior.\n",
  );
  assert.ok(await remoteText(trunk, tip, correctionPlan));
  assert.ok(await remoteText(trunk, tip, ".planning/slice-plans/A/PLAN.md"));
  assert.deepEqual(await lists(trunk, tip), [
    ["Taken", correction],
    ["Backlog list", "SEED-A#a"],
    ["Backlog list", "SEED-B#b"],
  ]);
  assert.deepEqual(await remoteProfileNames(trunk, tip), [correctionProfile]);

  // Repeating completion and publication changes nothing and removes no
  // other assignment.
  const again = await completeCli(lateOwned.workspace, late.identity);
  assert.equal(again.code, 1);
  assert.match(again.stderr, /Nothing was removed/);
  const repeated = await closed.publish(tip);
  assert.equal(repeated.ok, true, JSON.stringify(repeated));
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);

  // The correction closes the same way from its own admission base; Story A
  // still needs seed A, so the seed stays with that section as it was.
  const last = await closeInTrunkMode(
    trunk,
    correctionOwned,
    correctionOwned.sha,
    correction,
    {
      cleanup(workspace) {
        rmSync(join(workspace, ".planning/slice-plans/R"), { recursive: true });
        const path = join(workspace, seedA);
        writeFileSync(
          path,
          withoutStory(readFileSync(path, "utf8"), "order-notes"),
        );
      },
    },
  );
  assert.equal(await remoteText(trunk, last.tip, seedA), originalSeed);
  assert.equal(await remoteText(trunk, last.tip, correctionPlan), null);
  assert.equal(await remoteText(trunk, last.tip, "late.txt"), "late result\n");
  assert.deepEqual(await lists(trunk, last.tip), [
    ["Backlog list", "SEED-A#a"],
    ["Backlog list", "SEED-B#b"],
  ]);
  assert.deepEqual(await remoteProfileNames(trunk, last.tip), []);
});

test("a no-change investigation closes its whole new seed while another agent's claim and trunk advances stay", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-N#slow";
  const seedN = ".planning/seeds/N.md";
  writeDraft(
    trunk,
    seedN,
    withFacts(
      `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("slow", identity, "Investigate slow start", "Find why startup is slow.")}`,
      "seeds/N.md#slow",
      identity,
      "unselected",
    ),
  );
  const owned = await admit(
    trunk,
    "slow",
    admitArgs(identity, "seeds/N.md#slow", "Investigate slow start"),
  );
  const late = draftLateStory(trunk);
  const other = await admit(trunk, "late", late.args);
  const otherProfile = await profileOf(trunk, other.sha, late.identity);
  // Until closure, the concluded investigation keeps its Taken claim.
  assert.deepEqual((await lists(trunk, other.sha)).slice(0, 2), [
    ["Taken", identity],
    ["Taken", late.identity],
  ]);

  // Nothing was changed: the before-cleanup revision is the admission itself.
  const { tip } = await closeInTrunkMode(trunk, owned, owned.sha, identity, {
    cleanup(workspace) {
      rmSync(join(workspace, seedN));
    },
    beforeFinal: () => appendSiblingElsewhere(trunk, seedA, "kept"),
  });
  assert.equal(await remoteText(trunk, tip, seedN), null);
  assert.match(
    await remoteText(trunk, tip, seedA),
    /SEED-A#late[\s\S]*SEED-A#kept/,
  );
  assert.deepEqual(await lists(trunk, tip), [
    ["Taken", late.identity],
    ["Backlog list", "SEED-A#a"],
    ["Backlog list", "SEED-B#b"],
  ]);
  assert.deepEqual(await remoteProfileNames(trunk, tip), [otherProfile]);
  assert.equal(await remoteText(trunk, tip, late.planPath), late.plan);
  const log = (await git(trunk.origin, "log", "--format=%s", tip)).stdout;
  assert.match(log, /^Close SEED-N#slow$/m);
  assert.match(log, /^Admit accepted work: SEED-N#slow/m);
});
