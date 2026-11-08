// The run prepares the story-columns history before completion once
// (../../tests/launchJourney.ts); each worker's copy owns its completion
// and its mutable state (../../../tests/support/repository-fixture.mjs).
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  commitsTraced,
  fixtureFiles,
} from "../../../tests/support/fixture-observation.mjs";
import { materializeRepository } from "../../../tests/support/repository-fixture.mjs";
import {
  storyColumnsPrefixArtifactKey,
  storyColumnsRepository,
} from "../../tests/launchJourney.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { requestRunArtifact } from "../../tests/support/runArtifacts.ts";

const exec = promisify(execFile);
const git = async (cwd: string, ...args: string[]) =>
  (await exec("git", ["-C", cwd, ...args])).stdout.trim();

test("two workers' story-columns histories start from the run's prepared revisions and each answers its own completion from its own copy", async () => {
  const firstCompletedAt = "2026-04-01T10:00:00.000Z";
  const secondCompletedAt = "2026-04-02T10:00:00.000Z";
  const [first, second] = await Promise.all([
    materializeRepository(storyColumnsRepository(firstCompletedAt)),
    materializeRepository(storyColumnsRepository(secondCompletedAt)),
  ]);
  try {
    const prepared = await requestRunArtifact(storyColumnsPrefixArtifactKey);
    assert(prepared);
    const before = fixtureFiles(prepared);
    const preparedTaken = await git(
      path.join(prepared, "remote.git"),
      "rev-parse",
      "main",
    );
    for (const copy of [first, second]) {
      expect(copy.revisions.taken).toBe(preparedTaken);
      expect(await git(copy.origin, "rev-parse", "main")).toBe(
        copy.revisions.completed,
      );
      expect(await git(copy.origin, "rev-parse", "main^")).toBe(preparedTaken);
      expect(await git(copy.origin, "rev-list", "--count", "main")).toBe("5");
      expect(
        await git(copy.origin, "for-each-ref", "--format=%(refname)"),
      ).toBe("refs/heads/main");
      expect(
        await git(copy.integration, "config", "--get", "remote.origin.url"),
      ).toBe(copy.origin);
    }
    expect(first.revisions.completed).not.toBe(second.revisions.completed);
    // Only the copy's own done record and catalog name its completion.
    const doneRecords = /^main:\.planning\/done\/[^/]+\.json$/;
    for (const [copy, completedAt] of [
      [first, firstCompletedAt],
      [second, secondCompletedAt],
    ] as const) {
      const naming = (
        await git(copy.origin, "grep", "-l", completedAt, "main")
      ).split("\n");
      expect(naming.length).toBeGreaterThan(0);
      for (const file of naming) expect(file).toMatch(doneRecords);
    }
    await expect(
      git(first.origin, "grep", "-l", secondCompletedAt, "main"),
    ).rejects.toMatchObject({ code: 1 });

    const peer = fixtureFiles(second.fixture);
    await git(first.integration, "commit", "--allow-empty", "-m", "advance");
    await git(first.integration, "push", "--quiet", "origin", "main");
    await git(first.integration, "config", "test.private", "first");
    writeFileSync(path.join(first.integration, "private"), "first\n");
    await git(first.integration, "add", "private");
    expect(fixtureFiles(second.fixture)).toEqual(peer);
    await first.cleanup();
    expect(existsSync(first.fixture)).toBe(false);
    expect(fixtureFiles(second.fixture)).toEqual(peer);
    await git(second.origin, "fsck", "--full");
    expect(fixtureFiles(prepared)).toEqual(before);
  } finally {
    await Promise.allSettled([first.cleanup(), second.cleanup()]);
  }
});

test("without the run owner a worker builds the whole story-columns history itself", async () => {
  const owner = process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  assert(owner);
  const traces = mkdtempSync(path.join(tmpdir(), "dough-git-trace-"));
  const trace = path.join(traces, "trace");
  delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  process.env["GIT_TRACE"] = trace;
  try {
    const built = await materializeRepository(
      storyColumnsRepository("2026-04-03T10:00:00.000Z"),
    );
    try {
      expect(commitsTraced(trace)).toBe(5);
      expect(await git(built.origin, "rev-list", "--count", "main")).toBe("5");
      expect(await git(built.origin, "rev-parse", "main")).toBe(
        built.revisions.completed,
      );
    } finally {
      await built.cleanup();
    }
  } finally {
    process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"] = owner;
    delete process.env["GIT_TRACE"];
    rmSync(traces, { recursive: true, force: true });
  }
});
