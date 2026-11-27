// Explicit removal of a session the host no longer lists hides it and retires
// its Cursor scope, and history holds one `removed` entry across later
// writes; when history cannot accept that move, deletion is refused and the
// record, its scope and existing history stay. Each test owns a private
// machine home; only the observed native state is substituted.
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launchResponse } from "../../server/agentLaunchResponse.ts";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { launchHost } from "../../server/launchHosts.ts";
import {
  appendLaunchHistory,
  launchHistoryDirectory,
  readLaunchHistory,
} from "../../server/launchHistory.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { deleted } from "../../server/launchRecordDeletion.ts";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { admittedDelete } from "../../server/sessionAdmission.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-001#first",
  title: "First story",
};
const removedId = "a0000000-0000-4000-8000-000000000201";
const keptId = "a0000000-0000-4000-8000-000000000202";

let machine: string;
let home: string;
let launches: AgentLaunches;

beforeEach(() => {
  machine = mkdtempSync(path.join(tmpdir(), "dough-launch-history-remove-"));
  home = path.join(machine, "home");
  vi.stubEnv("HOME", home);
  const unmount = mountProjectConfiguration("production");
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
  // The host no longer lists any session: each record is removable.
  vi.spyOn(launches, "stateOf").mockImplementation((...[, record]) =>
    Promise.resolve({ ...record, sessionState: { kind: "unavailable" } }),
  );
  mkdirSync(executionCheckout(source).path, { recursive: true });
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    await launches.drain();
    unmount();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
});

// The shared Cursor configuration every scope was cloned from, with its
// saved conversation under `chats`.
function sharedCursorConfiguration() {
  const directory = path.join(machine, "shared-cursor-config");
  mkdirSync(path.join(directory, "chats"), { recursive: true });
  const conversation = path.join(directory, "chats", "saved-conversation.txt");
  writeFileSync(conversation, "saved conversation\n");
  return { directory, conversation };
}

// A scope cloned from the shared config with `chats` linked to the shared
// chats, as a launch leaves it.
function cursorScope(name: string, sharedDirectory: string): string {
  const scope = machineDashboardPath("cursor-session-scopes", name);
  mkdirSync(scope, { recursive: true });
  writeFileSync(
    path.join(scope, "cli-config.json"),
    `${JSON.stringify(makeMe.aCursorCliConfig.withModel("gpt-5.2").please())}\n`,
  );
  symlinkSync(
    path.join(sharedDirectory, "chats"),
    path.join(scope, "chats"),
    "dir",
  );
  return scope;
}

const scopedRecord = (sessionId: string, configScope: string) =>
  makeMe.aLaunchRecord
    .executing(story)
    .inCursorSession({
      sessionId,
      continuation: { workspace: "/tmp", configScope },
    })
    .please();

const deletion = async (record: LaunchRecord) =>
  deleted(
    await admittedDelete(
      { source: source.id, session: record.session.sessionId, host: "cursor" },
      launches,
    ),
    launches,
  );

const keptIds = async () =>
  (await keptRecords(source.id)).map((record) => record.session.sessionId);

test("moves a removed session into history once, hides it, and retires its Cursor scope", async () => {
  const shared = sharedCursorConfiguration();
  const removedScope = cursorScope("removed-scope", shared.directory);
  const keptScope = cursorScope("kept-scope", shared.directory);
  const removed = scopedRecord(removedId, removedScope);
  const kept = scopedRecord(keptId, keptScope);
  await replaceRecords(() => ({ [source.id]: [removed, kept] }));

  const deletedFrom = Date.now();
  expect(await deletion(removed)).toEqual({ kind: "deleted" });

  expect(await keptIds()).toEqual([keptId]);
  expect(existsSync(removedScope)).toBe(false);
  expect(existsSync(keptScope)).toBe(true);
  expect(readFileSync(shared.conversation, "utf8")).toBe(
    "saved conversation\n",
  );
  const history = await readLaunchHistory(home);
  expect(history).toEqual([
    {
      project: source.id,
      reason: "removed",
      record: removed,
      leftAt: expect.any(String) as unknown,
    },
  ]);
  expect(Date.parse(history[0]?.leftAt ?? "")).toBeGreaterThanOrEqual(
    deletedFrom,
  );

  await setRecordDoneAt(source.id, kept.session, new Date().toISOString());

  expect(await keptIds()).toEqual([keptId]);
  expect(await readLaunchHistory(home)).toEqual(history);
});

test("refuses removal when history is unwritable and keeps the record, its scope and existing history", async () => {
  const shared = sharedCursorConfiguration();
  const scope = cursorScope("removed-scope", shared.directory);
  const record = scopedRecord(removedId, scope);
  await replaceRecords(() => ({ [source.id]: [record] }));
  const earlier = {
    project: source.id,
    reason: "removed" as const,
    record: scopedRecord(keptId, machineDashboardPath("earlier-scope")),
    // An earlier month, so this removal needs a new monthly file.
    leftAt: "2025-06-01T00:00:00.000Z",
  };
  await appendLaunchHistory([earlier], home);
  const before = await keptRecords(source.id);
  const historyDir = launchHistoryDirectory(home);
  chmodSync(historyDir, 0o500);

  let refusal: unknown;
  try {
    await deletion(record);
  } catch (error) {
    refusal = error;
  } finally {
    chmodSync(historyDir, 0o700);
  }

  if (!(refusal instanceof RefusedRequest)) throw new Error("Not refused");
  const refused = await launchResponse(undefined, {
    status: refusal.status,
    body: { error: refusal.message },
  });
  expect(refused.status).toBe(500);
  expect(refused.headers["Content-Type"]).toBe("application/json");
  expect(JSON.parse(refused.body.toString("utf8"))).toEqual({
    error: expect.stringMatching(
      /^The session record could not be deleted: .*EACCES/,
    ) as unknown,
  });
  expect(await keptRecords(source.id)).toEqual(before);
  expect(existsSync(scope)).toBe(true);
  expect(await readLaunchHistory(home)).toEqual([earlier]);
});
