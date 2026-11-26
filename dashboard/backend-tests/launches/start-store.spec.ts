// This machine's kept starts (../../server/startStore.ts): written ahead of the
// script, updated with what it reports, one per story, removed when done, and
// the arguments a resume passes back to the script.

import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { fsSyncHook } from "../../test-support/support/serverFsHook.ts";
import {
  keptStart,
  keptStartsByProject,
  resumeArguments,
  startStore,
  type StartRecord,
} from "../../server/startStore.ts";

const written = makeMe.aStartRecord
  .with({
    host: "claude",
    identity: "SEED-A#a",
    publisherId: "dashboard-host-open-dough",
    workspace: "/p/.worktrees/a",
    branch: "claude/a",
    model: "opus",
    startedAt: "2026-09-30T10:00:00.000Z",
  })
  .please();

let home: string;
let starts: ReturnType<typeof startStore>;

beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "dough-start-store-"));
  vi.stubEnv("HOME", home);
  starts = startStore("execution", home);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(home, { recursive: true, force: true });
});

test("keeps a start written ahead, by project and story, and none for another story", async () => {
  expect(await keptStart("open-dough", written.identity)).toBeUndefined();
  await starts.keep("open-dough", written);
  expect(await keptStart("open-dough", written.identity)).toEqual(written);
  expect(await keptStart("open-dough", "SEED-B#b")).toBeUndefined();
  expect(await keptStart("other", written.identity)).toBeUndefined();
});

test("updates the kept start with what the script reported, and ignores a start no longer kept", async () => {
  await starts.keep("open-dough", written);
  await starts.update("open-dough", written.identity, {
    startingRevision: "aaa",
    candidateSha: "bbb",
  });
  expect(await keptStart("open-dough", written.identity)).toEqual({
    ...written,
    startingRevision: "aaa",
    candidateSha: "bbb",
  });
  await starts.update("open-dough", "SEED-B#b", { candidateSha: "ccc" });
  expect(await keptStart("open-dough", "SEED-B#b")).toBeUndefined();
});

test("a held write lock refuses without changing the document or removing the holder's lock", async () => {
  await starts.keep("open-dough", written);
  const file = path.join(
    home,
    ".open-dough",
    "dashboard",
    "execution-starts.json",
  );
  const lock = `${file}.lock`;
  const before = readFileSync(file, "utf8");
  mkdirSync(lock);
  // The store waits at most 10 s for a held lock; each clock reading here
  // passes that bound, so the refusal comes on the first retry.
  const now = Date.now();
  let readings = 0;
  vi.spyOn(Date, "now").mockImplementation(() => now + 11_000 * readings++);

  await expect(
    starts.update("open-dough", written.identity, {
      candidateSha: "must-not-be-written",
    }),
  ).rejects.toThrow(
    `The session store is locked: ${lock}. Nothing was written.`,
  );
  expect(readFileSync(file, "utf8")).toBe(before);
  expect(readdirSync(path.dirname(file)).sort()).toEqual([
    "execution-starts.json",
    "execution-starts.json.lock",
  ]);

  // Only the owner releases the lock; a subsequent writer then succeeds.
  vi.mocked(Date.now).mockRestore();
  rmSync(lock, { recursive: true });
  await starts.update("open-dough", written.identity, {
    candidateSha: "accepted",
  });
  expect(await keptStart("open-dough", written.identity)).toEqual({
    ...written,
    candidateSha: "accepted",
  });
});

test("a lock whose recorded owner process is gone is reclaimed so the write proceeds", async () => {
  await starts.keep("open-dough", written);
  const file = path.join(
    home,
    ".open-dough",
    "dashboard",
    "execution-starts.json",
  );
  const lock = `${file}.lock`;
  mkdirSync(lock);
  // A pid that cannot be alive on this machine: larger than any kernel pid.
  writeFileSync(path.join(lock, "owner"), "2147483647\n");

  await starts.update("open-dough", written.identity, {
    candidateSha: "reclaimed",
  });
  expect(await keptStart("open-dough", written.identity)).toEqual({
    ...written,
    candidateSha: "reclaimed",
  });
  expect(readdirSync(path.dirname(file))).toEqual(["execution-starts.json"]);
});

// A dashboard server ends by `process.exit` once its close settles, whatever
// write it is in; here it ends having taken the lock, before its owner
// record is written.
test("a writer that ends before recording itself as the lock's owner leaves no lock, so the next write proceeds", async () => {
  await starts.keep("open-dough", written);
  const writer = path.join(home, "writer.mjs");
  writeFileSync(
    writer,
    `import { startStore } from ${JSON.stringify(fileURLToPath(new URL("../../server/startStore.ts", import.meta.url)))};
await startStore("execution").update("open-dough", ${JSON.stringify(written.identity)}, { candidateSha: "lost" });`,
  );
  const endAtOwner = fsSyncHook(
    path.join(home, "end-at-owner.mjs"),
    "writeFileSync",
    `(file, ...args) => {
 if (String(file).endsWith("/execution-starts.json.lock/owner")) process.exit(0);
 return original(file, ...args);
}`,
  );
  execFileSync(process.execPath, [writer], {
    env: { ...process.env, HOME: home, ...endAtOwner },
  });

  await starts.update("open-dough", written.identity, {
    candidateSha: "written",
  });
  expect(await keptStart("open-dough", written.identity)).toEqual({
    ...written,
    candidateSha: "written",
  });
  expect(readdirSync(path.join(home, ".open-dough", "dashboard"))).toEqual([
    "execution-starts.json",
  ]);
});

test("keeps one start per story, replaced when written again, and removes one alone", async () => {
  await starts.keep("open-dough", written);
  await starts.keep("open-dough", { ...written, identity: "SEED-B#b" });
  await starts.keep("open-dough", { ...written, branch: "claude/a-again" });
  expect(await keptStart("open-dough", written.identity)).toMatchObject({
    branch: "claude/a-again",
  });
  await starts.remove("open-dough", written.identity);
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

test("a predecessor hostless file decodes as Claude without quarantine and keeps its claim model", async () => {
  const directory = path.join(home, ".open-dough/dashboard");
  mkdirSync(directory, { recursive: true });
  const file = path.join(directory, "refinement-starts.json");
  const predecessor = Object.fromEntries(
    Object.entries(written).filter(([key]) => key !== "host"),
  );
  writeFileSync(
    file,
    JSON.stringify({ "open-dough": { [written.identity]: predecessor } }),
  );
  expect(await keptStart("open-dough", written.identity, "refinement")).toEqual(
    written,
  );
  await startStore("refinement", home).update("open-dough", written.identity, {
    candidateSha: "bbb",
  });
  expect(await keptStart("open-dough", written.identity, "refinement")).toEqual(
    { ...written, candidateSha: "bbb" },
  );
  expect(readdirSync(directory)).toEqual(["refinement-starts.json"]);
  const stored = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    Record<string, StartRecord>
  >;
  expect(stored["open-dough"]?.[written.identity]).toMatchObject({
    host: "claude",
    model: "opus",
  });
});
