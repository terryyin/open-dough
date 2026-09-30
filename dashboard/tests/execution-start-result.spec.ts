// The one reader of `execution-start.mjs`'s JSON result
// (../server/executionStart.ts `readStartResult`): an accepted start's
// published facts, a stop's status, error, and recovery, and anything else
// as unreadable.

import { expect, test } from "@playwright/test";
import { readStartResult, refusal } from "../server/executionStart.ts";

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

test("words every stop status the start command reports, keeping a stop's workspace", () => {
  const recovery = { workspace: "/w", branch: "claude/x" };
  const stop = (status: string, error?: string, kept?: typeof recovery) =>
    refusal({
      kind: "stopped",
      status,
      ...(error === undefined ? {} : { error }),
      ...(kept === undefined ? {} : { recovery: kept }),
    });
  expect(refusal({ kind: "stopped", status: "conflict" }, "Yui-chan")).toBe(
    "Taken by Yui-chan, so this dashboard did not start it. Nothing was launched.",
  );
  expect(stop("conflict")).toBe(
    "Taken by another agent, so this dashboard did not start it. Nothing was launched.",
  );
  expect(
    stop("source-refused", "identity is not queued on fetched trunk"),
  ).toBe(
    "The story is not queued in Backlog on origin, so it cannot be started. Nothing was launched.",
  );
  expect(stop("source-refused", "published preparation is not-ready")).toBe(
    "The story's published source cannot be started: published preparation is not-ready. Nothing was launched.",
  );
  expect(stop("source-conflict", "x")).toBe(
    "The story's published source conflicts with origin: x. Nothing was launched.",
  );
  expect(stop("invalid-request", "missing branch")).toBe(
    "The start command refused the request: missing branch. Nothing was launched.",
  );
  expect(stop("authority-required")).toBe(
    "The start command needs authority it was not given. Nothing was launched.",
  );
  expect(stop("setup-failed", "dirty", recovery)).toBe(
    "The workspace could not be set up: dirty. Workspace /w on branch claude/x. Nothing was launched.",
  );
  expect(stop("carry-conflict", "c", recovery)).toBe(
    "Uncommitted changes could not be carried into the workspace: c. Workspace /w on branch claude/x. Nothing was launched.",
  );
  expect(stop("developer-identity-refused")).toBe(
    "Git has no usable developer identity for the Take. Nothing was launched.",
  );
  expect(stop("claim-failed", "e")).toBe(
    "The Take could not be committed: e. Nothing was launched.",
  );
  expect(stop("unpublished", "push rejected", recovery)).toBe(
    "The Take could not be confirmed on origin, so the story may or may not be Taken: push rejected. Workspace /w on branch claude/x. Nothing was launched.",
  );
  expect(stop("unchanged")).toBe(
    "The start changed nothing. Nothing was launched.",
  );
  expect(stop("something-new", "e")).toBe(
    "The start stopped (something-new): e. Nothing was launched.",
  );
  expect(refusal({ kind: "unreadable" })).toBe(
    "The start command gave no result this dashboard could read, so the story may or may not be Taken. Check origin before starting again. Nothing was launched.",
  );
});
