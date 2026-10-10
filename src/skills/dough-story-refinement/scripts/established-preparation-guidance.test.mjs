import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { formatEstablishedPreparation } from "./established-preparation.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(skill, path), "utf8");
const skillText = read("SKILL.md");
const workspace = read("references/preparation-workspace.md");
const reference = read("references/established-preparation.md");

const preparation = {
  identity: "SEED-052#script-refinement-preparation",
  workspace: "/p/.worktrees/x",
  branch: "claude/x",
  remote: "origin",
  target: "main",
  agent: "chaifeng-chan",
};

test("SKILL.md and the workspace rule point a supplied block away from their own setup", () => {
  assert.match(
    skillText,
    /carries an established preparation[\s\S]+\(references\/established-preparation\.md\)[\s\S]+instead of the\s+workspace and announcement steps/,
  );
  assert.match(workspace, /established preparation[\s\S]+skip this selection/);
});

test("the reference skips workspace and start, keeps the fields, continues to the journey's end, and leaves the no-block path", () => {
  assert.match(reference, /Skip the workspace selection/);
  assert.match(reference, /`start` call/);
  assert.match(reference, /no second announcement or workspace/i);
  assert.match(reference, /named workspace and branch/);
  assert.match(
    reference,
    /for the later `release` or `abandon` commands and the\s+landing\./,
  );
  assert.match(
    reference,
    /Continue with refinement and the record write, through to\s+\[land at the end of preparation\]\(preparation-journey\.md#land-at-the-end-of-preparation\)\./,
  );
  assert.match(reference, /`continued`/);
  for (const field of [
    "identity",
    "workspace",
    "branch",
    "remote",
    "target",
    "agent",
    "publishedSha",
    "integration checkout",
  ]) {
    assert.ok(reference.includes(field), `reference names ${field}`);
  }
  assert.match(reference, /Without the block/);
});

test("formatEstablishedPreparation lists fields in fixed order", () => {
  assert.equal(
    formatEstablishedPreparation(preparation),
    [
      "Established preparation:",
      "- identity: SEED-052#script-refinement-preparation",
      "- workspace: /p/.worktrees/x",
      "- branch: claude/x",
      "- remote: origin",
      "- target: main",
      "- agent: chaifeng-chan",
    ].join("\n"),
  );
});

test("formatEstablishedPreparation appends optional fields in order and omits absent ones", () => {
  const text = formatEstablishedPreparation({
    integration: "/p",
    ...preparation,
    publishedSha: "abc123",
  });
  assert.match(
    text,
    /agent: chaifeng-chan\n- publishedSha: abc123\n- integration checkout: \/p$/,
  );
  assert.doesNotMatch(
    formatEstablishedPreparation(preparation),
    /publishedSha|integration/,
  );
});

test("an established one-shot preparation names its role and landing, and no assignment", () => {
  const text = formatEstablishedPreparation({
    integration: "/p",
    tracking: "one-shot",
    identity: "SEED-A#a",
    workspace: "/p/.worktrees/a",
    role: "isolated",
    branch: "claude/a",
    remote: "origin",
    target: "main",
    landing: "review",
    startingRevision: "s1",
  });
  assert.equal(
    text,
    [
      "Established preparation:",
      "- tracking: one-shot",
      "- identity: SEED-A#a",
      "- workspace: /p/.worktrees/a",
      "- workspace role: isolated",
      "- branch: claude/a",
      "- remote: origin",
      "- target: main",
      "- landing: review",
      "- startingRevision: s1",
      "- integration checkout: /p",
    ].join("\n"),
  );
  assert.doesNotMatch(text, /agent|publishedSha/);
});

test("the reference continues an established one-shot preparation without an announcement", () => {
  const at = reference.indexOf(
    "## Continue an established one-shot preparation",
  );
  assert.ok(at > 0);
  const oneShot = reference.slice(at);
  assert.match(oneShot, /`tracking: one-shot`/);
  assert.match(oneShot, /make no\s+announcement or second start/);
  assert.match(oneShot, /one-shot-refinement\.md#refine-record-and-commit/);
  assert.match(oneShot, /`landing: review`\s+stops for review/);
});
