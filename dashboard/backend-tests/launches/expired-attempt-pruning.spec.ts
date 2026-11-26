// Retention prunes a settled attempt past `launchRetentionDays` on the next
// attempt write (../../server/launchAttemptStore.ts), and only after that
// write succeeds removes the pruned attempt's kept start and launch
// attachments, per project. Its launch record and Git workspace remain; the
// retained landing reader is ./retained-landing-after-expiry.spec.ts.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launchRetentionDays } from "../../src/launchRecord.ts";
import {
  keepAttempt,
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import {
  bindRecord,
  keptRecordsByProject,
} from "../../server/launchRecordStore.ts";
import { leaveMachineJson } from "../../server/machineJsonStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  keepSessionStart,
  keptSessionStart,
} from "../../server/sessionStartStore.ts";
import { git } from "../../test-support/support/launchLanding.ts";

const day = 86_400_000;
const settled = Date.parse("2026-01-01T00:00:00.000Z");
const pruning = settled + (launchRetentionDays + 1) * day;
const ids = {
  expired: "00000000-0000-4000-8000-0000000e0001",
  current: "00000000-0000-4000-8000-0000000e0002",
  unsettled: "00000000-0000-4000-8000-0000000e0003",
  otherExpired: "00000000-0000-4000-8000-0000000e0004",
};

let machine: string;
let checkout: string;
let workspace: string;

beforeEach(() => {
  machine = mkdtempSync(path.join(tmpdir(), "expired-attempt-pruning-"));
  vi.stubEnv("HOME", path.join(machine, "home"));
  checkout = path.join(machine, "open-dough");
  workspace = path.join(machine, "session");
  mkdirSync(checkout);
  git(checkout, "init", "--quiet", "--initial-branch=main");
  git(
    checkout,
    "-c",
    "user.name=T",
    "-c",
    "user.email=t@example.org",
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    "base",
  );
  git(
    checkout,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "claude/session",
    workspace,
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  rmSync(machine, { recursive: true, force: true });
});

const attempt = (id: string, source: string) =>
  makeMe.anAcceptedAttempt
    .withId(id)
    .requesting(makeMe.aLaunchRequest.adHoc({ source }).please())
    .acceptedAt(new Date(settled).toISOString());
const settledAttempt = (id: string, source: string, at: number) =>
  attempt(id, source)
    .launched({ host: "claude", sessionId: id })
    .settledAt(new Date(at).toISOString())
    .please();
const start = {
  host: "claude" as const,
  workspace: "",
  branch: "claude/session",
  startedAt: new Date(settled).toISOString(),
};
const attachments = (id: string) =>
  machineDashboardPath("launch-attachments", id);
const inventory = () => ({
  worktrees: git(checkout, "worktree", "list", "--porcelain"),
  refs: git(checkout, "for-each-ref", "--format=%(refname) %(objectname)"),
});

// Kept attempts across two projects, each with its own kept start and
// attachment directory, plus the expired launch's open record.
async function keptEvidence() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(settled);
  const kept = { ...start, workspace };
  const placed = [
    ["open-dough", settledAttempt(ids.expired, "open-dough", settled)],
    ["open-dough", attempt(ids.unsettled, "open-dough").please()],
    [
      "other-project",
      settledAttempt(ids.otherExpired, "other-project", settled),
    ],
  ] as const;
  for (const [source, entry] of placed) {
    await keepAttempt(entry);
    await keepSessionStart(source, entry.id, kept);
  }
  // The same attempt key in another project is unrelated evidence.
  await keepSessionStart("other-project", ids.expired, kept);
  for (const id of [...Object.values(ids)]) {
    mkdirSync(attachments(id), { recursive: true });
    writeFileSync(path.join(attachments(id), "0.png"), id);
  }
  await bindRecord(
    "open-dough",
    makeMe.aLaunchRecord
      .adHoc({ instruction: "Session", title: "Session" })
      .launchedAt(new Date(settled).toISOString())
      .please(),
  );
  return kept;
}

const surviving = async () => ({
  attempts: (await keptAttempts())?.map(({ id }) => id),
  starts: {
    expired: await keptSessionStart("open-dough", ids.expired),
    unsettled: await keptSessionStart("open-dough", ids.unsettled),
    otherExpired: await keptSessionStart("other-project", ids.otherExpired),
    otherSameKey: await keptSessionStart("other-project", ids.expired),
  },
  attachments: Object.values(ids).filter((id) => existsSync(attachments(id))),
});

test("a refused or failed attempt write past retention removes no startup evidence", async () => {
  const kept = await keptEvidence();
  const before = await surviving();
  vi.setSystemTime(pruning);
  await replaceAttempts(() => leaveMachineJson);
  await expect(
    replaceAttempts(() => {
      throw new Error("write refused");
    }),
  ).rejects.toThrow("write refused");
  expect(await surviving()).toEqual(before);
  expect(before.starts.expired).toEqual(kept);
});

test("the next attempt write prunes only the expired attempts' starts and attachments, per project, and keeps their launch record and workspace", async () => {
  const kept = await keptEvidence();
  const records = await keptRecordsByProject();
  const checkoutBefore = inventory();

  vi.setSystemTime(pruning);
  await keepAttempt(settledAttempt(ids.current, "open-dough", pruning));
  await keepSessionStart("open-dough", ids.current, kept);

  expect(await surviving()).toEqual({
    attempts: [ids.unsettled, ids.current],
    starts: {
      expired: undefined,
      unsettled: kept,
      otherExpired: undefined,
      otherSameKey: kept,
    },
    attachments: [ids.current, ids.unsettled],
  });
  expect(await keptRecordsByProject()).toEqual(records);
  expect(inventory()).toEqual(checkoutBefore);
  expect(git(workspace, "branch", "--show-current")).toBe("claude/session");
});
