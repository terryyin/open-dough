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

test("the reference skips workspace and start, keeps the fields, and leaves the no-block path", () => {
  assert.match(reference, /Skip the workspace selection/);
  assert.match(reference, /`start` call/);
  assert.match(reference, /no second announcement or workspace/i);
  assert.match(reference, /named workspace and branch/);
  assert.match(reference, /`release` or `abandon`/);
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
