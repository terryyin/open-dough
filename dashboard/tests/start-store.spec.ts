// This machine's kept starts (../server/startStore.ts): written ahead of the
// script, updated with what it reports, one per story, removed when done, and
// the arguments a resume passes back to the script.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  keepStart,
  keptStart,
  keptStartsByProject,
  removeStart,
  resumeArguments,
  updateStart,
  type StartRecord,
} from "../server/startStore.ts";

const written: StartRecord = {
  host: "claude",
  identity: "SEED-A#a",
  publisherId: "dashboard-host-open-dough",
  workspace: "/p/.worktrees/a",
  branch: "claude/a",
  model: "opus",
  startedAt: "2026-09-30T10:00:00.000Z",
};

let home: string;
let previousHome: string | undefined;

test.beforeEach(() => {
  previousHome = process.env["HOME"];
  home = mkdtempSync(path.join(tmpdir(), "dough-start-store-"));
  process.env["HOME"] = home;
});

test.afterEach(() => {
  if (previousHome === undefined) {
    delete process.env["HOME"];
  } else {
    process.env["HOME"] = previousHome;
  }
  rmSync(home, { recursive: true, force: true });
});

test("keeps a start written ahead, by project and story, and none for another story", async () => {
  expect(await keptStart("open-dough", written.identity)).toBeUndefined();
  await keepStart("open-dough", written);
  expect(await keptStart("open-dough", written.identity)).toEqual(written);
  expect(await keptStart("open-dough", "SEED-B#b")).toBeUndefined();
  expect(await keptStart("other", written.identity)).toBeUndefined();
});

test("updates the kept start with what the script reported, and ignores a start no longer kept", async () => {
  await keepStart("open-dough", written);
  await updateStart("open-dough", written.identity, {
    startingRevision: "aaa",
    candidateSha: "bbb",
  });
  expect(await keptStart("open-dough", written.identity)).toEqual({
    ...written,
    startingRevision: "aaa",
    candidateSha: "bbb",
  });
  await updateStart("open-dough", "SEED-B#b", { candidateSha: "ccc" });
  expect(await keptStart("open-dough", "SEED-B#b")).toBeUndefined();
});

test("keeps one start per story, replaced when written again, and removes one alone", async () => {
  await keepStart("open-dough", written);
  await keepStart("open-dough", { ...written, identity: "SEED-B#b" });
  await keepStart("open-dough", { ...written, branch: "claude/a-again" });
  expect(await keptStart("open-dough", written.identity)).toMatchObject({
    branch: "claude/a-again",
  });
  await removeStart("open-dough", written.identity);
  expect(await keptStart("open-dough", written.identity)).toBeUndefined();
  expect(await keptStartsByProject()).toEqual(
    new Map([["open-dough", [{ ...written, identity: "SEED-B#b" }]]]),
  );
});

test("resumes a retained claim commit only with both SHAs and no result reported", () => {
  const start = {
    identity: written.identity,
    publisherId: "dashboard-publisher",
    workspace: written.workspace,
    branch: written.branch,
    mode: "story-branch" as const,
    remote: "origin",
    target: "main",
    publishedSha: "bbb",
  };
  expect(resumeArguments(written)).toEqual([]);
  expect(resumeArguments({ ...written, candidateSha: "bbb" })).toEqual([]);
  const retained = { ...written, startingRevision: "aaa", candidateSha: "bbb" };
  expect(resumeArguments(retained)).toEqual([
    "--starting-revision",
    "aaa",
    "--candidate-sha",
    "bbb",
  ]);
  expect(resumeArguments({ ...retained, start })).toEqual([]);
});
