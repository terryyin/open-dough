// Retention expiry is a record removal too (plan 329 slice 4): a scoped
// Cursor record a write drops past its 30-day retention retires exactly
// its configuration scope through the production default retirement
// listener, the same host dispatch an explicit deletion uses, while
// retained records keep their scopes and the shared Cursor configuration
// and saved conversation stay untouched. Marking a Claude session Done is
// the write that drops the expired Cursor record, so retention dispatch
// remains host-neutral. The test owns a private machine home.
import {
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
import { beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readStoredRecords,
  replaceRecords,
} from "../../server/launchRecordDocument.ts";
import { installRecordRemovalDispatch } from "../../server/launchRecordRemoval.ts";
import { setRecordDoneAt } from "../../server/launchRecordStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { daysAgo } from "../../test-support/machineLaunchRecords.ts";

const project = "open-dough";
const story = { identity: "SEED-001#first", title: "First story" };

let machine: string;

beforeEach(() => {
  machine = mkdtempSync(path.join(tmpdir(), "dough-retention-scope-"));
  vi.stubEnv("HOME", path.join(machine, "home"));
  return () => {
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  };
});

test("removes only the expired record's scope, leaving retained scopes, the shared configuration, and the saved conversation untouched", async () => {
  // The shared Cursor configuration every scope was cloned from, with its
  // saved conversation under `chats`.
  const sharedConfigDir = path.join(machine, "shared-cursor-config");
  mkdirSync(path.join(sharedConfigDir, "chats"), { recursive: true });
  const sharedConfig = `${JSON.stringify(makeMe.aCursorCliConfig.please())}\n`;
  writeFileSync(path.join(sharedConfigDir, "cli-config.json"), sharedConfig);
  const savedConversation = path.join(
    sharedConfigDir,
    "chats",
    "saved-conversation.txt",
  );
  writeFileSync(savedConversation, "saved conversation\n");

  // One scope per seeded record, cloned from the shared config with its
  // `chats` linked to the shared chats, as a launch leaves it.
  const makeScope = (name: string, model: string): string => {
    const scope = machineDashboardPath("cursor-session-scopes", name);
    mkdirSync(scope, { recursive: true });
    writeFileSync(
      path.join(scope, "cli-config.json"),
      `${JSON.stringify(makeMe.aCursorCliConfig.withModel(model).please())}\n`,
    );
    symlinkSync(
      path.join(sharedConfigDir, "chats"),
      path.join(scope, "chats"),
      "dir",
    );
    return scope;
  };
  const expiredScope = makeScope("expired-scope", "gpt-5.2");
  const recentlyDoneScope = makeScope("recently-done-scope", "composer-2.5");
  const unclosedScope = makeScope("unclosed-scope", "auto");

  // A Cursor execution launched 60 days ago with this configuration scope.
  const scopedRecord = (sessionId: string, configScope: string) =>
    makeMe.aLaunchRecord
      .executing(story)
      .inCursorSession({
        sessionId,
        continuation: { workspace: "/tmp", configScope },
      })
      .launchedAt(daysAgo(60));
  const expiredId = "a0000000-0000-4000-8000-000000000031";
  const recentlyDoneId = "a0000000-0000-4000-8000-000000000029";
  const unclosedId = "a0000000-0000-4000-8000-000000000040";
  const marked = makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession({ sessionId: "a0000000-0000-4000-8000-000000000001" })
    .please();
  await replaceRecords(() => ({
    [project]: [
      scopedRecord(expiredId, expiredScope).markedDoneAt(daysAgo(31)).please(),
      scopedRecord(recentlyDoneId, recentlyDoneScope)
        .markedDoneAt(daysAgo(29))
        .please(),
      scopedRecord(unclosedId, unclosedScope).please(),
      marked,
    ],
  }));

  // The production default listener the launch boundary installs.
  installRecordRemovalDispatch();

  await setRecordDoneAt(project, marked.session, new Date().toISOString());

  const read = await readStoredRecords();
  if (read.kind === "unreadable") throw new Error("Unreadable records");
  expect(
    (read.document[project] ?? []).flatMap((entry) =>
      "session" in entry ? [entry.session.sessionId] : [],
    ),
  ).toEqual([recentlyDoneId, unclosedId, marked.session.sessionId]);
  // Exactly the expired record's scope was retired; every retained
  // record's scope stays.
  expect(existsSync(expiredScope)).toBe(false);
  expect(existsSync(recentlyDoneScope)).toBe(true);
  expect(existsSync(unclosedScope)).toBe(true);
  // Scope removal did not follow the `chats` symlink: the shared
  // configuration and saved conversation are intact.
  expect(
    readFileSync(path.join(sharedConfigDir, "cli-config.json"), "utf8"),
  ).toBe(sharedConfig);
  expect(readFileSync(savedConversation, "utf8")).toBe("saved conversation\n");
});
