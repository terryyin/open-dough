// Session-scope assertions for Cursor launches: where a chosen model's
// scope lives, what it holds, and that a Default launch has none.
import { existsSync, lstatSync, readFileSync, readlinkSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { CursorAttach, FakeCursor } from "./fakeCursor.ts";

function cursorSessionScopesHome(home: string): string {
  return path.join(home, ".open-dough", "dashboard", "cursor-session-scopes");
}

// The scope lives under the dashboard machine home, was cloned from the
// shared config (its fixture setting survived), and alone received the
// fake's persistence of the chosen model; the shared config is
// byte-unchanged and the first client was kept with the scope env.
export function expectChosenModelScope(
  record: LaunchRecord,
  home: string,
  cursor: FakeCursor,
  client: CursorAttach,
  sharedBefore: string,
): void {
  const scope = recordedScope(record);
  expect(scope.startsWith(`${cursorSessionScopesHome(home)}${path.sep}`)).toBe(
    true,
  );
  expect(JSON.parse(cursor.configIn(scope)) as unknown).toEqual({
    model: "gpt-5.2",
    hasChangedDefaultModel: true,
    fixtureSetting: "from-shared-config",
  });
  expect(cursor.sharedConfig()).toBe(sharedBefore);
  expect(client.env["CURSOR_CONFIG_DIR"]).toBe(scope);
  const scopeChats = path.join(scope, "chats");
  expect(lstatSync(scopeChats).isSymbolicLink()).toBe(true);
  expect(readlinkSync(scopeChats)).toBe(
    path.join(cursor.sharedConfigDir, "chats"),
  );
  expect(
    readFileSync(path.join(scopeChats, "saved-conversation.txt"), "utf8"),
  ).toBe("saved conversation\n");
}

// The recorded scope on a kept record, failing when there is none.
export function recordedScope(record: LaunchRecord): string {
  if (record.session.host !== "cursor") {
    throw new Error("The kept session is not a Cursor session.");
  }
  const scope = record.session.continuation.configScope;
  if (scope === undefined) {
    throw new Error("The kept Cursor session recorded no config scope.");
  }
  return scope;
}

// A continuation spawn (attach, recovery resume, or replacement) ran
// with the recorded scope in its environment and no model flag: the
// scope already carries the session's model.
export function expectContinuationThroughScope(
  attach: CursorAttach | undefined,
  scope: string,
): void {
  if (attach === undefined) {
    throw new Error("Cursor did not start a continuation client.");
  }
  expect(attach.env["CURSOR_CONFIG_DIR"]).toBe(scope);
  expect(attach.args).not.toContain("--model");
}

// A Default continuation carries no scope: it keeps the shared config
// environment the fake Cursor was installed with.
export function expectContinuationWithoutScope(
  record: LaunchRecord,
  cursor: FakeCursor,
  attach: CursorAttach | undefined,
): void {
  if (record.session.host !== "cursor") {
    throw new Error("The kept session is not a Cursor session.");
  }
  expect(record.session.continuation.configScope).toBeUndefined();
  if (attach === undefined) {
    throw new Error("Cursor did not start a continuation client.");
  }
  expect(attach.env["CURSOR_CONFIG_DIR"]).toBe(cursor.sharedConfigDir);
  expect(attach.args).not.toContain("--model");
}

// A Default launch creates no scope and keeps the shared config env.
export function expectDefaultLaunchHasNoScope(
  record: LaunchRecord,
  home: string,
  cursor: FakeCursor,
  client: CursorAttach,
): void {
  if (record.session.host !== "cursor") {
    throw new Error("The kept session is not a Cursor session.");
  }
  expect(record.session.continuation.configScope).toBeUndefined();
  expect(client.env["CURSOR_CONFIG_DIR"]).toBe(cursor.sharedConfigDir);
  expect(existsSync(cursorSessionScopesHome(home))).toBe(false);
}
