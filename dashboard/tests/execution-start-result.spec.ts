// The one reader of `execution-start.mjs`'s JSON result
// (../server/executionStart.ts `readStartResult`): an accepted start's
// published facts, a stop's status, error, and recovery, and anything else
// as unreadable.

import { expect, test } from "@playwright/test";
import { readStartResult } from "../server/executionStart.ts";

test("reads an accepted start's published facts", () => {
  const line = JSON.stringify({
    ok: true,
    status: "published",
    publishedSha: "abc123",
    startingRevision: "def456",
    candidateSha: "abc123",
    agent: "Yui-chan",
    created: true,
  });
  expect(readStartResult(`${line}\n`)).toEqual({
    kind: "accepted",
    publishedSha: "abc123",
    startingRevision: "def456",
    candidateSha: "abc123",
    agent: "Yui-chan",
  });
});

test("reads a stop's status, error, and recovery", () => {
  const line = JSON.stringify({
    ok: false,
    status: "setup-failed",
    implemented: false,
    error: "trouble",
    recovery: {
      workspace: "/w",
      branch: "claude/x",
      startingRevision: "1",
      candidateSha: "2",
    },
  });
  expect(readStartResult(line)).toEqual({
    kind: "stopped",
    status: "setup-failed",
    error: "trouble",
    recovery: { workspace: "/w", branch: "claude/x" },
  });
  expect(
    readStartResult(
      JSON.stringify({ ok: false, status: "authority-required" }),
    ),
  ).toEqual({ kind: "stopped", status: "authority-required" });
});

test("reads output that is not a result as unreadable", () => {
  for (const stdout of [
    "",
    "usage: execution-start.mjs",
    "{}",
    '{"ok":true}',
  ]) {
    expect(readStartResult(stdout)).toEqual({ kind: "unreadable" });
  }
});
