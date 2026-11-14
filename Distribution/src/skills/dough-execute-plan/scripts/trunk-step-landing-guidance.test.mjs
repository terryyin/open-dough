// Guidance structure, not native agent evidence: a Story Branch slice that acts
// from trunk gets its retained landing named in the plan's human checkpoint,
// and execution lands it under that go-ahead without a separate stop.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const decisions = read("dough-execute-plan/references/execution-decisions.md");

test("slice planning names the retained landing inside the trunk step's checkpoint, or Trunk Mode", () => {
  const write = section(
    read("dough-slice-planning/SKILL.md"),
    "## Write the plan",
  );
  assert.match(
    write,
    /A Story Branch Mode slice that must act from trunk, such as a release from\s+trunk, needs a human checkpoint before that step\. Write it in the plan: it names\s+the slice, the trunk step, and a\s+\[Dough Land\]\(\.\.\/dough-land\/SKILL\.md\) `--keep-worktree` landing of the story\s+branch before the step, so one go-ahead covers both and execution asks no\s+separate landing question\./,
  );
  assert.match(
    write,
    /Alternatively, record in Current decisions that the\s+story executes in Trunk Mode \(`--trunk`\)\./,
  );
  assert.match(
    write,
    /The trunk step stays that slice's\s+work, not a lifecycle owner, and keeps its own procedure and gates\./,
  );
});

test("execution lands the named retained landing under the checkpoint's go-ahead", () => {
  const land = section(
    decisions,
    "## Land before a trunk step under its checkpoint",
  );
  assert.match(
    land,
    /human checkpoint names a\s+\[Dough Land\]\(\.\.\/\.\.\/dough-land\/SKILL\.md\) `--keep-worktree` landing before a step\s+that acts from trunk[\s\S]+go-ahead for\s+that checkpoint authorizes both/,
  );
  assert.match(
    land,
    /run Dough Land with `--keep-worktree` on this execution checkout, asking no\s+separate landing question/,
  );
  assert.match(
    land,
    /only\s+after Dough Land reports the landing accepted; a refused or unfinished landing\s+stops that step/,
  );
  assert.match(
    land,
    /needs trunk without such a named landing stops for that checkpoint decision\s+under \[human judgment\]\(#stop-for-human-judgment\)/,
  );
  assert.match(
    land,
    /does not\s+observe a `landing` lifecycle commitment; closure still integrates the story\s+branch\. The trunk step's own procedure, CI and release gates apply unchanged\./,
  );
});

test("the human-judgment stop sends a checkpoint-named landing to that decision", () => {
  assert.match(
    section(decisions, "## Stop for human judgment"),
    /A retained landing that the plan's human checkpoint\s+names is not a separate stop: \[land it under that go-ahead\]\(#land-before-a-trunk-step-under-its-checkpoint\)\./,
  );
});
