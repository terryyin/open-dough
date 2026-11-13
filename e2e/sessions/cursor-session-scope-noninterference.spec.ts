import { sessionAction } from "../../dashboard/tests/support/sessionEntryDisclosure.ts";
// Non-interference across scoped Cursor sessions and scope lifetime:
// overlapping chosen-model launches keep separate scopes and models with
// the shared configuration untouched; a subsequent Default launch follows
// a deliberate new shared default without creating a scope while a stopped
// scoped session keeps its recorded scope (Recover through that default
// change stays in cursor-session-scope-continuation.spec.ts); and deleting
// a scoped session's launch record removes exactly its scope while the
// shared configuration and saved conversation stay untouched.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { recordedScope } from "../../dashboard/tests/support/cursorScopeAssertions.ts";
import { expectReadingWithoutScreenLabel } from "../../dashboard/tests/support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  endHeldClient,
  keptRecords,
  launchSecondHeldSession,
  startScopedCursorExecution,
} from "../../dashboard/tests/support/cursorSessionRecovery.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";
import { cursorModels } from "../../dashboard/tests/support/fakeCursor.ts";

test.use({ cursorSubmitPaintMs: 300 });

const secondSessionId = "b2c3d4e5-f6a7-489a-bcde-f0123456789a";

function scopesHome(home: string): string {
  return path.join(home, ".open-dough", "dashboard", "cursor-session-scopes");
}

test("two overlapping chosen-model launches keep separate scopes and models, with the shared configuration untouched", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  cursor.listModels([
    ...cursorModels,
    { model: "composer-2.5", name: "Composer 2.5" },
  ]);
  const sharedBefore = cursor.sharedConfig();
  await startScopedCursorExecution(
    page,
    origin,
    cursor,
    dashboard.home,
    "gpt-5.2",
  );
  await launchSecondHeldSession(
    page,
    origin,
    cursor,
    dashboard.home,
    secondSessionId,
    "composer-2.5",
  );

  const records = keptRecords(dashboard.home);
  expect(records).toHaveLength(2);
  const first = records.find(
    (record) => record.session.sessionId === cursor.sessionId,
  );
  const second = records.find(
    (record) => record.session.sessionId === secondSessionId,
  );
  if (first === undefined || second === undefined) {
    throw new Error("Missing a kept Cursor session.");
  }
  const firstScope = recordedScope(first);
  const secondScope = recordedScope(second);
  expect(secondScope).not.toBe(firstScope);
  for (const scope of [firstScope, secondScope]) {
    expect(scope.startsWith(`${scopesHome(dashboard.home)}${path.sep}`)).toBe(
      true,
    );
    // Both scopes are retained while both records keep their sessions
    // resumable.
    expect(existsSync(scope)).toBe(true);
  }
  expect(JSON.parse(cursor.configIn(firstScope)) as unknown).toMatchObject({
    model: "gpt-5.2",
  });
  expect(JSON.parse(cursor.configIn(secondScope)) as unknown).toMatchObject({
    model: "composer-2.5",
  });
  const firstClient = cursor
    .attaches()
    .find((each) => each.sessionId === cursor.sessionId);
  const secondClient = cursor
    .attaches()
    .find((each) => each.sessionId === secondSessionId);
  expect(firstClient?.env["CURSOR_CONFIG_DIR"]).toBe(firstScope);
  expect(firstClient?.args).toContain("gpt-5.2");
  expect(secondClient?.env["CURSOR_CONFIG_DIR"]).toBe(secondScope);
  expect(secondClient?.args).toContain("composer-2.5");
  // Neither launch wrote outside its own scope.
  expect(cursor.sharedConfig()).toBe(sharedBefore);
});

test("a subsequent Default launch follows a deliberate new shared default while a stopped scoped session keeps its scope", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  // Scoped Recover through a deliberate default change is proved in
  // cursor-session-scope-continuation.spec.ts; this case asserts only that
  // a later Default launch follows the new shared default without creating
  // a scope, leaving the first session's recorded scope alone.
  await startScopedCursorExecution(
    page,
    origin,
    cursor,
    dashboard.home,
    "gpt-5.2",
  );
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  const scope = recordedScope(record);
  await endHeldClient(page, cursor, dashboard.home);
  cursor.changeSharedModel("composer-2.5");
  const sharedAfterChange = cursor.sharedConfig();
  await reloadUntilRead(page);
  await expectReadingWithoutScreenLabel(
    parts(page).taken.locator(".session-entry"),
    agentNotRunningLabel,
  );
  expect(JSON.parse(cursor.configIn(scope)) as unknown).toMatchObject({
    model: "gpt-5.2",
  });

  // A subsequent Default launch creates no scope and runs against the
  // shared configuration, whose model is now the deliberate new default.
  await launchSecondHeldSession(
    page,
    origin,
    cursor,
    dashboard.home,
    secondSessionId,
  );
  const records = keptRecords(dashboard.home);
  expect(records).toHaveLength(2);
  const defaulted = records.find(
    (each) => each.session.sessionId === secondSessionId,
  );
  if (defaulted?.session.host !== "cursor") {
    throw new Error("Missing the Default Cursor session.");
  }
  expect(defaulted.session.continuation.configScope).toBeUndefined();
  const defaultClient = cursor
    .attaches()
    .find((each) => each.sessionId === secondSessionId);
  expect(defaultClient?.env["CURSOR_CONFIG_DIR"]).toBe(cursor.sharedConfigDir);
  expect(defaultClient?.args).not.toContain("--model");
  expect(defaultClient?.args).toEqual([
    "--workspace",
    path.join(origin.project, ".worktrees", "story-b"),
    "--resume",
    secondSessionId,
  ]);
  // Exactly the first session's scope exists; the Default launch made none.
  expect(readdirSync(scopesHome(dashboard.home))).toEqual([
    path.basename(scope),
  ]);
  expect(cursor.sharedConfig()).toBe(sharedAfterChange);
  expect(JSON.parse(cursor.sharedConfig()) as unknown).toMatchObject({
    model: "composer-2.5",
  });
});

test("deleting a scoped session's launch record removes exactly its scope, leaving the shared configuration and saved conversation untouched", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await startScopedCursorExecution(
    page,
    origin,
    cursor,
    dashboard.home,
    "gpt-5.2",
  );
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  const scope = recordedScope(record);
  const sharedBefore = cursor.sharedConfig();
  const savedConversation = path.join(
    cursor.sharedConfigDir,
    "chats",
    "saved-conversation.txt",
  );
  expect(readFileSync(savedConversation, "utf8")).toBe("saved conversation\n");
  expect(existsSync(scope)).toBe(true);
  await endHeldClient(page, cursor, dashboard.home);
  await reloadUntilRead(page);
  const entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
  // The record still keeps the session resumable, so its scope is
  // retained until the record itself is removed, never before.
  expect(existsSync(scope)).toBe(true);

  await (await sessionAction(entry, "Delete record…")).click();
  await entry
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(entry).toHaveCount(0);

  expect(keptRecords(dashboard.home)).toEqual([]);
  expect(existsSync(scope)).toBe(false);
  // Removal did not follow the scope's `chats` symlink: the shared
  // configuration and the saved conversation evidence are intact.
  expect(cursor.sharedConfig()).toBe(sharedBefore);
  expect(readFileSync(savedConversation, "utf8")).toBe("saved conversation\n");
});
