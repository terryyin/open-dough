// Retention writes own kept-start expiry; refusal, replacement failure and a
// restored attempt preserve its start. Late script evidence cannot recreate it.
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "./support/pageTest.ts";
import type {
  LaunchAttemptRecord,
  EstablishedSession,
} from "../src/agentLaunch.ts";
import { replaceAttempts } from "../server/launchAttemptStore.ts";
import { leaveMachineJson } from "../server/machineJsonStore.ts";
import {
  keepEstablishedSession,
  keptSessionStart,
  type SessionStart,
} from "../server/sessionStartStore.ts";

let home: string;
let previousHome: string | undefined;
let file: string;
let startsFile: string;
let attempt: LaunchAttemptRecord;
const session: EstablishedSession = {
  workspace: "/project/.worktrees/session",
  role: "isolated",
  branch: "claude/session",
  remote: "origin",
  target: "main",
  landing: "review",
};
let start: SessionStart;

test.beforeEach(() => {
  previousHome = process.env["HOME"];
  home = mkdtempSync(path.join(tmpdir(), "dough-attempt-retention-"));
  process.env["HOME"] = home;
  const directory = path.join(home, ".open-dough/dashboard");
  mkdirSync(directory, { recursive: true });
  file = path.join(directory, "launch-attempts.json");
  startsFile = path.join(directory, "session-starts.json");
  const expiredAt = new Date(Date.now() - 31 * 86_400_000).toISOString();
  attempt = {
    id: randomUUID(),
    request: { source: "open-dough", workflow: "ad-hoc", host: "claude" },
    acceptedAt: expiredAt,
    settledAt: expiredAt,
    publication: { kind: "none" },
    outcome: {
      kind: "uncertain",
      reason: "timed-out",
      explanation: "Start still runs.",
    },
  };
  start = {
    host: "claude",
    workspace: session.workspace,
    branch: session.branch,
    startedAt: expiredAt,
  };
  writeFileSync(file, JSON.stringify({ "open-dough": [attempt] }));
  writeFileSync(
    startsFile,
    JSON.stringify({ "open-dough": { [attempt.id]: start } }),
  );
});

test.afterEach(() => {
  if (previousHome === undefined) delete process.env["HOME"];
  else process.env["HOME"] = previousHome;
  rmSync(home, { recursive: true, force: true });
});

test("refusal and an expired attempt restored by the write keep its start until an actual pruning replacement", async () => {
  const before = readFileSync(file, "utf8");
  const startsBefore = readFileSync(startsFile, "utf8");
  await replaceAttempts((kept) => {
    expect(kept["open-dough"]).toEqual([]);
    return leaveMachineJson;
  });
  expect(readFileSync(file, "utf8")).toBe(before);
  expect(readFileSync(startsFile, "utf8")).toBe(startsBefore);

  await replaceAttempts((kept) => ({ ...kept, "open-dough": [attempt] }));
  expect(await keptSessionStart("open-dough", attempt.id)).toEqual(start);
  await replaceAttempts((kept) => kept);
  expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({ "open-dough": [] });
  expect(await keptSessionStart("open-dough", attempt.id)).toBeUndefined();

  // This is the late script-result operation, after retention removed its key.
  await keepEstablishedSession("open-dough", attempt.id, session);
  expect(JSON.parse(readFileSync(startsFile, "utf8"))).toEqual({
    "open-dough": {},
  });
});

test("a failed attempt-file replacement leaves the expired attempt and its start unchanged", async () => {
  const before = readFileSync(file, "utf8");
  const startsBefore = readFileSync(startsFile, "utf8");
  const module = new URL("../server/launchAttemptStore.ts", import.meta.url)
    .href;
  const script = `
    import assert from 'node:assert/strict';
    import promises from 'node:fs/promises';
    import {syncBuiltinESMExports} from 'node:module';
    const {replaceAttempts} = await import(${JSON.stringify(module)});
    const original = promises.rename;
    promises.rename = async (...args) => {
      if (String(args[1]).endsWith('/launch-attempts.json')) throw new Error('Injected attempt replacement failure');
      return original(...args);
    };
    syncBuiltinESMExports();
    await assert.rejects(replaceAttempts(kept => kept), /Injected attempt replacement failure/);
  `;
  const { stdout, stderr } = await promisify(execFile)(
    process.execPath,
    [
      "--experimental-transform-types",
      "--disable-warning=ExperimentalWarning",
      "--input-type=module",
      "-e",
      script,
    ],
    { env: { ...process.env, HOME: home } },
  );
  expect(stdout).toBe("");
  expect(stderr).toBe("");
  expect(readFileSync(file, "utf8")).toBe(before);
  expect(readFileSync(startsFile, "utf8")).toBe(startsBefore);
});

test("reads an older kept session start without retaining its unread creation fact", async () => {
  writeFileSync(
    startsFile,
    JSON.stringify({
      "open-dough": {
        [attempt.id]: { ...start, session: { ...session, created: true } },
      },
    }),
  );
  const kept = await keptSessionStart("open-dough", attempt.id);
  expect(kept).toEqual({ ...start, session });
  expect(kept?.session).not.toHaveProperty("created");
});
