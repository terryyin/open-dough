// The "Established preparation:" block a coordinator hands a refinement: its
// fields in one fixed order, optional fields only when present.
import assert from "node:assert/strict";
import { test } from "node:test";

import { formatEstablishedPreparation } from "./established-preparation.mjs";

const preparation = {
  identity: "SEED-052#script-refinement-preparation",
  workspace: "/p/.worktrees/x",
  branch: "claude/x",
  remote: "origin",
  target: "main",
  agent: "chaifeng-chan",
};

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
