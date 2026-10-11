// The "Established session:" block an unattached session is handed: its
// fields in one fixed order, and nothing a later workflow decides for itself.
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatEstablishedSession } from "./established-session.mjs";

const session = {
  workspace: "/p",
  role: "default-checkout",
  branch: "main",
  remote: "origin",
  target: "main",
  landing: "auto-land",
};

test("the block lists the required fields in one fixed order, whatever order the caller holds them in", () => {
  const expected = [
    "Established session:",
    "- workspace: /p",
    "- workspace role: default-checkout",
    "- branch: main",
    "- remote: origin",
    "- target: main",
    "- landing: auto-land",
  ].join("\n");
  assert.equal(formatEstablishedSession(session), expected);
  assert.equal(
    formatEstablishedSession(
      Object.fromEntries(Object.entries(session).reverse()),
    ),
    expected,
  );
});

test("the starting revision and fetched trunk follow in order when known, and are omitted when not", () => {
  assert.match(
    formatEstablishedSession({
      fetched: "f1",
      ...session,
      startingRevision: "s1",
    }),
    /- landing: auto-land\n- startingRevision: s1\n- fetched: f1$/,
  );
  assert.match(
    formatEstablishedSession({ ...session, fetched: "f1" }),
    /- landing: auto-land\n- fetched: f1$/,
  );
  const unknown = formatEstablishedSession({
    ...session,
    startingRevision: undefined,
    fetched: "",
  });
  assert.doesNotMatch(unknown, /startingRevision|fetched|undefined/);
});

test("an isolated session waiting for review reads the same way", () => {
  assert.match(
    formatEstablishedSession({
      ...session,
      workspace: "/p/.worktrees/tidy",
      role: "isolated",
      branch: "claude/tidy",
      landing: "review",
    }),
    /^Established session:\n- workspace: \/p\/\.worktrees\/tidy\n- workspace role: isolated\n- branch: claude\/tidy\n- remote: origin\n- target: main\n- landing: review$/,
  );
});

test("the block names no tracking, identity, mode, or agent, even when the caller holds them", () => {
  const text = formatEstablishedSession({
    ...session,
    tracking: "one-shot",
    identity: "SEED-A#a",
    mode: "story-branch",
    agent: "claude-opus",
    publisherId: "pub-1",
    created: false,
    startingRevision: "s1",
  });
  assert.doesNotMatch(
    text,
    /tracking|identity|SEED-A|mode|story-branch|agent|claude-opus|publisher|created/,
  );
  assert.doesNotMatch(text, /^Established start:/);
});
