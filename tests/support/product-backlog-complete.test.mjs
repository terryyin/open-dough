// Runs the real backlog CLI to remove completed work from a scratch project,
// observing both persisted lists and the canonical homes the removed entries
// name, which the operation must leave exactly as it found them.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  added,
  addArguments,
  addedLine,
  architecture,
  backlog,
  occurrences,
  projectFile,
  queued,
  run,
  scratchProject,
  skipRetrospective,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

const seedPath = "seeds/SEED-008-worktree-branch-trunk-sync.md";
const planPath = "quick/057-script-product-backlog/PLAN.md";
// Status text a script that judged completion might read. Nothing here may
// make an entry removable, and nothing here may be rewritten or deleted.
const seedSource = `---
id: SEED-008
---

### 4. Update the product backlog without hand-editing the shared list

**Identity:** SEED-008#script-product-backlog-list-updates

Status: refined and planned.
`;
const planSource = "# Safely edit the product backlog\n\nStatus: executing.\n";

const removal = (identity) => ["complete", "--identity", identity];

// Supplies only the starting precondition: the canonical homes the backlog's
// taken entry names, and a check that their bytes survived the removal.
function canonicalHomes(project) {
  const homes = [
    [projectFile(project, seedPath, seedSource), seedSource],
    [projectFile(project, planPath, planSource), planSource],
  ];
  return () => {
    for (const [path, before] of homes) {
      assert.ok(existsSync(path), `${path} was deleted`);
      assert.equal(readFileSync(path, "utf8"), before, `${path} changed`);
    }
  };
}

test("complete removes only the named queued entry and keeps every other byte", async (t) => {
  const removals = [
    { identity: trunkQueue, line: queued[0] },
    { identity: skipRetrospective, line: queued[1] },
    { identity: architecture, line: queued[2] },
  ];

  for (const { identity, line } of removals) {
    const project = scratchProject(t);
    const homesUnchanged = canonicalHomes(project);
    const result = await run(project, removal(identity));
    assert.equal(result.code, 0, `${identity}: ${result.stderr}`);
    assert.equal(project.read(), backlog.replace(`${line}\n`, ""), identity);
    assert.match(result.stdout, /from "## Backlog list"/);
    homesUnchanged();
  }
});

test("complete closes a taken entry without touching its story or plan files", async (t) => {
  const project = scratchProject(t);
  const homesUnchanged = canonicalHomes(project);

  const result = await run(project, removal(takenStory));
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.equal(occurrences(project.read(), "script-product-backlog"), 0);
  assert.match(result.stdout, /Removed .* from "## Taken"/);
  assert.match(result.stdout, /canonical home .* was not changed/);
  homesUnchanged();
});

test("complete empties a list without disturbing the text around it", async (t) => {
  const project = scratchProject(t);
  for (const identity of [trunkQueue, skipRetrospective, architecture]) {
    const result = await run(project, removal(identity));
    assert.equal(result.code, 0, `${identity}: ${result.stderr}`);
  }
  assert.equal(
    project.read(),
    backlog.replace(`${queued.join("\n")}\n`, ""),
    "the emptied queue disturbed the surrounding text",
  );

  // The direction, the title, and both headings are still exactly as supplied
  // even once neither list holds anything.
  const empty = await run(project, removal(takenStory));
  assert.equal(empty.code, 0, empty.stderr);
  assert.equal(
    project.read(),
    backlog
      .replace(`${queued.join("\n")}\n`, "")
      .replace(`${takenEntry}\n\n`, ""),
  );
});

test("complete on a repeated request removes nothing and never another item", async (t) => {
  const project = scratchProject(t);
  const first = await run(project, removal(skipRetrospective));
  assert.equal(first.code, 0, first.stderr);
  const applied = project.read();

  const again = await run(project, removal(skipRetrospective));
  assert.equal(again.code, 1);
  assert.match(
    again.stderr,
    /is in neither "## Taken" nor "## Backlog list"\. Nothing was removed\./,
  );
  assert.match(again.stderr, /an earlier run already removed it/);
  assert.match(again.stderr, /The backlog was not changed\./);
  assert.equal(project.read(), applied);

  // The siblings the caller did not name are all still listed, in order.
  assert.equal(applied, backlog.replace(`${queued[1]}\n`, ""));
  for (const line of [takenEntry, queued[0], queued[2]]) {
    assert.equal(occurrences(applied, line), 1);
  }
});

test("complete refuses missing input and an unusable backlog unchanged", async (t) => {
  const refusals = [
    {
      why: "no identity",
      arguments_: ["complete"],
      expect: /Missing identity: supply --identity\./,
    },
    {
      why: "an identity the backlog does not carry",
      arguments_: removal("SEED-777#nowhere"),
      expect: /"SEED-777#nowhere" is in neither "## Taken"/,
    },
    {
      why: "a canonical home named instead of the adopted identity",
      arguments_: removal(
        "seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue",
      ),
      expect: /is in neither "## Taken" nor "## Backlog list"/,
    },
    {
      why: "prose inside the queue",
      source: `${backlog}\nUnexpected note about priority.\n`,
      arguments_: removal(trunkQueue),
      expect: /Unsupported text in "## Backlog list" at line \d+/,
    },
    {
      why: "the same work already listed twice",
      source: `${backlog}${queued[0]}\n`,
      arguments_: removal(trunkQueue),
      expect: /already lists the same work twice: lines \d+ and \d+/,
    },
    {
      why: "no backlog file at the named path",
      arguments_: [
        ...removal(trunkQueue),
        "--file",
        ".planning/OTHER-BACKLOG.md",
      ],
      expect: /Backlog file not found: .*OTHER-BACKLOG\.md/,
    },
  ];

  for (const refusal of refusals) {
    const source = refusal.source ?? backlog;
    const project = scratchProject(t, source);
    const homesUnchanged = canonicalHomes(project);
    const result = await run(project, refusal.arguments_);
    assert.equal(result.code, 1, `${refusal.why}: expected a refusal`);
    assert.match(result.stderr, refusal.expect, refusal.why);
    assert.match(result.stderr, /The backlog was not changed\./, refusal.why);
    assert.equal(project.read(), source, `${refusal.why}: file changed`);
    homesUnchanged();
  }
});

test("complete happens only when asked, never as another operation's effect", async (t) => {
  const project = scratchProject(t);
  const homesUnchanged = canonicalHomes(project);
  const claimedPlan = "quick/058-queue-trunk-integration/PLAN.md";
  projectFile(project, claimedPlan);
  const titleOf = (line) => line.slice(0, line.indexOf("]"));

  // A claim, a resume of that claim, and an addition: the operations a paused,
  // failed, or finished execution actually runs. None of them removes an entry.
  const others = [
    ["take", "--identity", trunkQueue, "--plan", claimedPlan],
    ["take", "--identity", trunkQueue, "--plan", claimedPlan],
    addArguments(added, ["--position", "last"]),
  ];
  for (const arguments_ of others) {
    const result = await run(project, arguments_);
    assert.equal(result.code, 0, `${arguments_.join(" ")}: ${result.stderr}`);
    const current = project.read();
    for (const line of [takenEntry, ...queued]) {
      assert.equal(occurrences(current, titleOf(line)), 1, titleOf(line));
    }
  }
  assert.equal(occurrences(project.read(), titleOf(addedLine)), 1);
  homesUnchanged();

  // Removal is not reachable under another name either.
  const unknown = await run(project, ["remove", "--identity", architecture]);
  assert.equal(unknown.code, 1);
  assert.match(unknown.stderr, /Unknown operation: remove/);
  assert.equal(occurrences(project.read(), queued[2]), 1);
});
