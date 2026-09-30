import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";
import { formatEstablishedStart } from "./established-start.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(skill, path), "utf8");
const take = section(read("SKILL.md"), "## Take or admit work");
const reference = read("references/established-start.md");

const start = {
  identity: "SEED-052#script-execution-preparation",
  publisherId: "pub-1",
  workspace: "/p/.worktrees/x",
  branch: "claude/x",
  mode: "story-branch",
  remote: "origin",
  target: "main",
  publishedSha: "abc123",
};

test("Take or admit work points a supplied established start away from the start command", () => {
  assert.match(
    take,
    /carries an established start[\s\S]+\(references\/established-start\.md\) instead of the start command/,
  );
});

test("the reference replaces the start command, keeps publishedSha, and lists the fields", () => {
  assert.match(reference, /Skip the `execution-start\.mjs start` call/);
  assert.match(reference, /no second claim/i);
  assert.match(reference, /Retain `publishedSha`/);
  assert.match(reference, /named workspace/);
  assert.match(reference, /execution-location\.md/);
  for (const field of [
    "identity",
    "publisher ID",
    "workspace",
    "branch",
    "mode",
    "remote",
    "target",
    "publishedSha",
    "agent",
    "plan",
    "startingRevision",
    "candidateSha",
  ]) {
    assert.ok(reference.includes(field), `reference names ${field}`);
  }
  assert.match(reference, /Without the block/);
});

test("formatEstablishedStart lists required fields in fixed order", () => {
  assert.equal(
    formatEstablishedStart(start),
    [
      "Established start:",
      "- identity: SEED-052#script-execution-preparation",
      "- publisher ID: pub-1",
      "- workspace: /p/.worktrees/x",
      "- branch: claude/x",
      "- mode: story-branch",
      "- remote: origin",
      "- target: main",
      "- publishedSha: abc123",
    ].join("\n"),
  );
});

test("formatEstablishedStart appends optional fields in order and omits absent ones", () => {
  const text = formatEstablishedStart({
    candidateSha: "c1",
    ...start,
    agent: "claude-opus",
  });
  assert.match(
    text,
    /publishedSha: abc123\n- agent: claude-opus\n- candidateSha: c1$/,
  );
  assert.doesNotMatch(text, /plan:|startingRevision:/);
});
