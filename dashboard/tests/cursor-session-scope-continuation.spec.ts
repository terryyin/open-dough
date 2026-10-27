// Continuing a scoped Cursor session (plan 329 slice 3): terminal
// attach/open, recovery resume, and cannot-load replacement each spawn
// with the recorded scope in CURSOR_CONFIG_DIR and no `--model` flag,
// a missing or unreadable recorded scope refuses with an explanation
// and spawns nothing, and a Default record's continuations carry no
// scope exactly as before.
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { keptAttempts, settledOutcome } from "./acceptedAttempts.ts";
import { parts } from "./dashboardPage.ts";
import {
  expectContinuationThroughScope,
  expectContinuationWithoutScope,
  recordedScope,
} from "./support/cursorScopeAssertions.ts";
import {
  expectNormalizedReading,
  expectReadingWithoutScreenLabel,
} from "./support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  endHeldClient,
  keptRecords,
  startCursorExecution,
  startScopedCursorExecution,
} from "./support/cursorSessionRecovery.ts";
import { expect, test } from "./support/cursorStart.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ cursorSubmitPaintMs: 300 });

const scopeRefusal =
  "The Cursor configuration saved for this session is missing or cannot be read";

test("recovery and terminal open resume a scoped session through its recorded scope, preserving a deliberate default change", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await startScopedCursorExecution(page, origin, cursor);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  const scope = recordedScope(record);
  const workspace =
    record.session.host === "cursor"
      ? record.session.continuation.workspace
      : "";
  await endHeldClient(page, cursor, dashboard.home);
  // The developer deliberately changes their Cursor default to another
  // model before resuming; the resume must neither use nor overwrite it.
  cursor.changeSharedModel("composer-2.5");
  const sharedAfterChange = cursor.sharedConfig();
  await reloadUntilRead(page);
  const entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
  const attachesBefore = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Ready for review", true);
  await expect.poll(() => cursor.attaches().length).toBe(attachesBefore + 1);
  const resumed = cursor.attaches().at(-1);
  expectContinuationThroughScope(resumed, scope);
  expect(resumed?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  expect(cursor.sharedConfig()).toBe(sharedAfterChange);
  expect(JSON.parse(cursor.configIn(scope)) as unknown).toMatchObject({
    model: "gpt-5.2",
  });

  // Terminal attach/open after the client is no longer held spawns a
  // fresh client through the same scope.
  await endHeldClient(page, cursor, dashboard.home);
  await page.reload();
  const attachesBeforeOpen = cursor.attaches().length;
  await entry.getByRole("button", { name: "Open terminal" }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("Add a follow-up");
  await expect
    .poll(() => cursor.attaches().length)
    .toBe(attachesBeforeOpen + 1);
  const attached = cursor.attaches().at(-1);
  expectContinuationThroughScope(attached, scope);
  expect(attached?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  expect(attached?.pid).not.toBe(resumed?.pid);
  expect(cursor.sharedConfig()).toBe(sharedAfterChange);
});

test("cannot-load replacement for a scoped session keeps the scope and sends no model flag", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await startScopedCursorExecution(page, origin, cursor);
  const [before] = keptRecords(dashboard.home);
  if (before?.session.host !== "cursor") throw new Error("Missing Cursor.");
  const scope = recordedScope(before);
  const workspace = before.session.continuation.workspace;
  const sharedBefore = cursor.sharedConfig();
  const replacementId = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
  // First-input acceptance can paint before the enclosing launch settles.
  // Stop only a confirmed launch, so recovery starts from a stopped session.
  const [accepted] = keptAttempts(dashboard);
  if (accepted === undefined) throw new Error("Missing accepted launch.");
  expect(await settledOutcome(dashboard, accepted.id)).toMatchObject({
    kind: "launched",
  });
  await endHeldClient(page, cursor, dashboard.home);
  cursor.setAttachMode("cannot-load");
  cursor.queueCreateChatId(replacementId);
  await reloadUntilRead(page);
  const entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Awaiting first instruction", false);
  const [after] = keptRecords(dashboard.home);
  if (after?.session.host !== "cursor") throw new Error("Missing Cursor.");
  expect(after.session.sessionId).toBe(replacementId);
  // The replacement record remembers the same scope for later resumes.
  expect(recordedScope(after)).toBe(scope);
  expect(after.session.continuation.args).toEqual([
    expect.any(String),
    "--workspace",
    workspace,
    "--resume",
    replacementId,
  ]);
  // The cannot-load resume attempt and the replacement client both ran
  // through the scope; the replacement needed no `--model` flag.
  const attempt = cursor.attaches().at(-2);
  expectContinuationThroughScope(attempt, scope);
  expect(attempt?.sessionId).toBe(before.session.sessionId);
  const replacement = cursor.attaches().at(-1);
  expectContinuationThroughScope(replacement, scope);
  expect(replacement?.sessionId).toBe(replacementId);
  expect(replacement?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    replacementId,
  ]);
  expect(cursor.sharedConfig()).toBe(sharedBefore);
  expect(JSON.parse(cursor.configIn(scope)) as unknown).toMatchObject({
    model: "gpt-5.2",
  });
});

test("a missing or unreadable recorded scope refuses recovery and terminal open, spawning nothing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await startScopedCursorExecution(page, origin, cursor);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  const scope = recordedScope(record);
  const sharedBefore = cursor.sharedConfig();
  await endHeldClient(page, cursor, dashboard.home);
  await reloadUntilRead(page);
  const entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);

  // Unreadable: the scope's configuration is no longer a readable file.
  rmSync(path.join(scope, "cli-config.json"), { force: true });
  mkdirSync(path.join(scope, "cli-config.json"));
  const attachesBefore = cursor.attaches().length;
  const callsBefore = cursor.calls().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expect(entry).toContainText(scopeRefusal);
  await expect(entry).toContainText(
    "not continued with your shared Cursor configuration",
  );
  expect(cursor.attaches()).toHaveLength(attachesBefore);
  expect(cursor.calls()).toHaveLength(callsBefore);
  expect(cursor.sharedConfig()).toBe(sharedBefore);

  // Missing: the whole scope is gone, so terminal open also refuses and
  // still spawns nothing against the shared configuration.
  rmSync(scope, { recursive: true, force: true });
  await entry.getByRole("button", { name: "Open terminal" }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel).toContainText(scopeRefusal);
  await expect(panel).toContainText(
    "not continued with your shared Cursor configuration",
  );
  await expect(panel).toContainText("Nothing was started.");
  await expect(panel).not.toContainText("The session could not be attached");
  expect(cursor.attaches()).toHaveLength(attachesBefore);
  expect(cursor.calls()).toHaveLength(callsBefore);
  expect(cursor.sharedConfig()).toBe(sharedBefore);
});

test("a Default session's recovery carries no scope, exactly as before", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await startCursorExecution(page, origin, cursor);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  await endHeldClient(page, cursor, dashboard.home);
  await reloadUntilRead(page);
  const entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
  const attachesBefore = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Ready for review", true);
  await expect.poll(() => cursor.attaches().length).toBe(attachesBefore + 1);
  expectContinuationWithoutScope(record, cursor, cursor.attaches().at(-1));
});
