// Admission onto moved trunk reconciles only the admitted story's own section
// of an existing seed: trunk's sibling sections keep trunk's text, local
// sibling drafts stay local, and a new section lands where it was drafted.
// Driven through the real startup CLI against a local bare remote.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  admitArgs,
  changedPaths,
  listed,
  neverQueued,
  pushFromElsewhere,
  remoteText,
  sectionText,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import { readStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";

test("a planned story added to an existing seed carries its plan and only its own section onto moved trunk", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seedPath = ".planning/seeds/A.md";
  const trunkSibling = await pushFromElsewhere(trunk, seedPath, (text) =>
    text.replace("Execute A.", "Execute A, as refined on trunk."),
  );
  const identity = "SEED-A#n";
  const link = "seeds/A.md#n";
  const planPath = ".planning/slice-plans/N/PLAN.md";
  const plan = "# Plan N\n\nExecute N.\n";
  writeDraft(trunk, planPath, plan);
  const local = readFileSync(join(trunk.integration, seedPath), "utf8");
  const drafted = withFacts(
    `${local.replace("Execute A.", "Local sibling draft.")}\n${storySection("n", identity, "Story N", "Deliver N.")}`,
    link,
    identity,
    "planned",
    "../slice-plans/N/PLAN.md",
  );
  writeDraft(trunk, seedPath, drafted);
  const { receipt } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "Story N"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.equal(receipt.plan, "slice-plans/N/PLAN.md");
  const sha = receipt.publishedSha;
  assert.equal(await revParse(trunk.origin, `${sha}^`), trunkSibling);
  await neverQueued(trunk, sha, identity);
  assert.deepEqual(await changedPaths(trunk, sha), [
    "A\t.planning/agents/yui-chan.json",
    `A\t${planPath}`,
    "M\t.planning/PRODUCT-BACKLOG.md",
    `M\t${seedPath}`,
  ]);
  const published = await remoteText(trunk, sha, seedPath);
  assert.match(published, /Execute A, as refined on trunk\./);
  assert.doesNotMatch(published, /Local sibling draft/);
  assert.equal(sectionText(published, "n"), sectionText(drafted, "n"));
  assert.equal(await remoteText(trunk, sha, planPath), plan);
  const entry = (await listed(trunk, sha)).find((e) => e.identity === identity);
  assert.deepEqual(
    [entry.list, entry.plan?.target],
    ["Taken", "slice-plans/N/PLAN.md"],
  );
  // Queued siblings keep their order.
  assert.deepEqual(
    (await listed(trunk, sha))
      .filter((e) => e.list === "Backlog list")
      .map((e) => e.identity),
    [identityA, "SEED-B#b"],
  );
  assert.equal(
    readFileSync(join(trunk.integration, seedPath), "utf8"),
    drafted,
  );
  const state = readStoryState(published, link, { planSource: plan });
  assert.deepEqual(
    [state.approach.kind, state.assessment.status],
    ["planned", "absent"],
  );
});

test("an unlisted story already on trunk is admitted with its locally recorded facts, replacing only its own section", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-B#tidy";
  const link = "seeds/B.md#tidy";
  const seedPath = ".planning/seeds/B.md";
  const unrecorded = `${readFileSync(join(trunk.integration, seedPath), "utf8")}\n${storySection("tidy", identity, "Tidy B", "Tidy the B wording.")}\n${storySection("after", "SEED-B#after", "After B", "Kept after.")}`;
  writeFileSync(join(trunk.integration, seedPath), unrecorded);
  await git(trunk.integration, "commit", "-qam", "story tidy without facts");
  await git(trunk.integration, "push", "-q", "origin", "main");
  const trunkSiblings = await pushFromElsewhere(trunk, seedPath, (text) =>
    text
      .replace("Execute B.", "Execute B, as refined on trunk.")
      .replace("Kept after.", "Kept after, as refined on trunk."),
  );
  const drafted = withFacts(
    unrecorded.replace("Execute B.", "Local sibling draft."),
    link,
    identity,
    "unselected",
  );
  writeFileSync(join(trunk.integration, seedPath), drafted);
  const { receipt } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "Tidy B"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.admitted, [seedPath]);
  const sha = receipt.publishedSha;
  assert.equal(await revParse(trunk.origin, `${sha}^`), trunkSiblings);
  const onTrunk = await remoteText(trunk, trunkSiblings, seedPath);
  const published = await remoteText(trunk, sha, seedPath);
  // Only the selected section changed: trunk's siblings, before and after it,
  // keep trunk's text, and the local sibling draft stays local.
  assert.equal(published, withFacts(onTrunk, link, identity, "unselected"));
  assert.equal(
    sectionText(published, "tidy", "after"),
    sectionText(drafted, "tidy", "after"),
  );
  assert.equal(readStoryState(published, link).status, "recorded");
  assert.equal(
    readFileSync(join(trunk.integration, seedPath), "utf8"),
    drafted,
  );
});

test("a new story drafted before an existing section is inserted before that section on trunk", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seedPath = ".planning/seeds/A.md";
  const trunkSibling = await pushFromElsewhere(trunk, seedPath, (text) =>
    text.replace("Execute A.", "Execute A, as refined on trunk."),
  );
  const identity = "SEED-A#first";
  const link = "seeds/A.md#first";
  const anchorA = '<a id="a"></a>';
  const drafted = withFacts(
    readFileSync(join(trunk.integration, seedPath), "utf8").replace(
      anchorA,
      `${storySection("first", identity, "First story", "Deliver first.")}\n${anchorA}`,
    ),
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, seedPath, drafted);
  const { receipt } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "First story"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.admitted, [seedPath]);
  const sha = receipt.publishedSha;
  assert.equal(await revParse(trunk.origin, `${sha}^`), trunkSibling);
  const section = sectionText(drafted, "first", "a");
  assert.equal(
    await remoteText(trunk, sha, seedPath),
    (await remoteText(trunk, trunkSibling, seedPath)).replace(
      anchorA,
      `${section}${anchorA}`,
    ),
  );
});
