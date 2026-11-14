// The "Established start:" block a coordinator hands an execution: its fields
// in one fixed order, optional fields only when present.
import assert from "node:assert/strict";
import { test } from "node:test";

import { formatEstablishedStart } from "./established-start.mjs";

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

test("an established one-shot start names its role and landing, and no claim", () => {
  const text = formatEstablishedStart({
    fetched: "f1",
    tracking: "one-shot",
    identity: "SEED-A#a",
    workspace: "/p",
    role: "default-checkout",
    branch: "main",
    mode: "story-branch",
    remote: "origin",
    target: "main",
    landing: "auto-land",
    startingRevision: "s1",
  });
  assert.equal(
    text,
    [
      "Established start:",
      "- tracking: one-shot",
      "- identity: SEED-A#a",
      "- workspace: /p",
      "- workspace role: default-checkout",
      "- branch: main",
      "- mode: story-branch",
      "- remote: origin",
      "- target: main",
      "- landing: auto-land",
      "- startingRevision: s1",
      "- fetched: f1",
    ].join("\n"),
  );
  assert.doesNotMatch(text, /publisher|publishedSha|agent/);
});

test("established start passes a change indication without altering its claim", () => {
  assert.equal(
    formatEstablishedStart({ ...start, changedSinceReview: true }),
    `${formatEstablishedStart(start)}\n- readiness: Changed since readiness review`,
  );
  assert.equal(
    formatEstablishedStart({ ...start, changedSinceReview: false }),
    formatEstablishedStart(start),
  );
});
