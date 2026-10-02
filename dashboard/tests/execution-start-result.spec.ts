// The one reader of `execution-start.mjs`'s JSON result
// (../server/startResult.ts `readStartResult`): an accepted start's
// published facts, a stop's status, error, and recovery, and anything else
// as unreadable.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { establishedStart } from "../server/startRecording.ts";
import { establishedStartSchema } from "../src/launchRecord.ts";
import { lostStartArguments } from "../server/startGit.ts";
import { readStartResult, refusal } from "../server/startResult.ts";

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

test("change indication survives result reading, durable records and retained existing starts", () => {
  const parsed = readStartResult(
    JSON.stringify({
      ok: true,
      status: "published",
      publishedSha: "abc",
      changedSinceReview: true,
    }),
  );
  expect(parsed).toEqual({
    kind: "accepted",
    publishedSha: "abc",
    changedSinceReview: true,
  });
  if (parsed.kind !== "accepted") throw new Error("Missing accepted result");
  const facts = {
    identity: "SEED-A#a",
    publisherId: "p",
    workspace: "/w",
    branch: "codex/a",
    mode: "story-branch" as const,
    remote: "origin",
    target: "main",
  };
  const kept = establishedStartSchema.parse(
    establishedStart(facts, parsed, undefined),
  );
  expect(kept).toHaveProperty("changedSinceReview", true);
  expect(
    establishedStart(facts, { kind: "accepted", publishedSha: "abc" }, kept),
  ).toHaveProperty("changedSinceReview", true);
  expect(
    establishedStart(
      facts,
      { kind: "accepted", publishedSha: "abc", changedSinceReview: false },
      kept,
    ),
  ).toHaveProperty("changedSinceReview", false);
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
    recovery: {
      workspace: "/w",
      branch: "claude/x",
      startingRevision: "1",
      candidateSha: "2",
    },
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
    "The Take could not be committed: e. The start was kept; pressing Start again resumes it. Nothing was launched.",
  );
  expect(stop("unpublished", "push rejected", recovery)).toBe(
    "The Take could not be confirmed on origin, so the story may or may not be Taken: push rejected. Workspace /w on branch claude/x. The start was kept; pressing Start again resumes it. Nothing was launched.",
  );
  // A start that was kept names where, though the stop reported none.
  expect(
    refusal({ kind: "stopped", status: "claim-failed" }, undefined, {
      workspace: "~/git/p/.worktrees/x",
      branch: "claude/x",
    }),
  ).toBe(
    "The Take could not be committed. Workspace ~/git/p/.worktrees/x on branch claude/x. The start was kept; pressing Start again resumes it. Nothing was launched.",
  );
  expect(stop("unchanged")).toBe(
    "The start changed nothing. Nothing was launched.",
  );
  expect(stop("something-new", "e")).toBe(
    "The start stopped (something-new): e. Nothing was launched.",
  );
  expect(refusal({ kind: "unreadable" })).toBe(
    "The start command gave no result this dashboard could read, so the story may or may not be Taken. The start was kept; pressing Start again resumes it. Nothing was launched.",
  );
});

test.describe("the arguments that resume a start lost with the server", () => {
  let repository: string;
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", repository, ...args], {
      encoding: "utf8",
    }).trim();

  test.beforeEach(() => {
    repository = mkdtempSync(path.join(tmpdir(), "dough-lost-start-"));
    execFileSync("git", ["init", "-q", "-b", "claude/x", repository]);
    git("config", "user.name", "T");
    git("config", "user.email", "t@example.test");
    git("commit", "-q", "--allow-empty", "-m", "start");
    git("commit", "-q", "--allow-empty", "-m", "claim");
  });

  test.afterEach(() => {
    rmSync(repository, { recursive: true, force: true });
  });

  test("the candidate is the workspace HEAD and the starting revision its parent", async () => {
    expect(await lostStartArguments(repository, "claude/x")).toEqual([
      "--starting-revision",
      git("rev-parse", "HEAD^"),
      "--candidate-sha",
      git("rev-parse", "HEAD"),
    ]);
  });

  test("a workspace on another branch, or a missing one, yields none", async () => {
    expect(await lostStartArguments(repository, "claude/other")).toEqual([]);
    expect(
      await lostStartArguments(path.join(repository, "missing"), "claude/x"),
    ).toEqual([]);
  });
});
