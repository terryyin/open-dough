// Journey helpers for Recover on an unfinished Cursor session the runner
// does not hold: stop the held client, open the stopped entry, start an
// execution launch that confirms first input, and read kept launch records.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { cursorRunnerSessionsEndpoint } from "../../src/cursorRunnerSessions.ts";
import { agentNotRunningLabel } from "../../src/sessionRecovery.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { hangupCursorClient } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerLastHeld } from "../../server/hosts/cursor/runnerPaths.ts";
import { parts } from "../dashboardPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  agentCalls,
  expectNormalizedReading,
  expectReadingWithoutScreenLabel,
  openTakenCursorSession,
} from "./cursorSessionReading.ts";
import { expect } from "./cursorStart.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import { launchWaitMs } from "./launchWait.ts";

export { agentNotRunningLabel };

// Ends the held attach through the runner hangup path and waits until the
// runner lists no held sessions. An out-of-band signal does not always clear
// the runner's held list on CI.
export async function endHeldClient(
  page: Page,
  cursor: FakeCursor,
  home: string,
): Promise<void> {
  // Launch may paint the card before the attach log line is flushed.
  await expect
    .poll(() => cursor.attaches().at(-1)?.pid ?? 0, { timeout: 15_000 })
    .toBeGreaterThan(0);
  const [record] = keptRecords(home);
  if (record?.session.host !== "cursor") {
    throw new Error("Expected a Cursor session.");
  }
  await hangupCursorClient(record.session, home);
  await expect
    .poll(
      () =>
        page.evaluate(async (endpoint) => {
          const response = await fetch(endpoint);
          if (!response.ok) throw new Error("The runner could not be read.");
          const body = (await response.json()) as {
            runner: string;
            sessions: readonly unknown[];
          };
          return body.sessions.length;
        }, cursorRunnerSessionsEndpoint),
      { timeout: 15_000 },
    )
    .toBe(0);
}

export async function openStoppedCursorEntry(
  page: Parameters<typeof openTakenCursorSession>[0],
  origin: Parameters<typeof openTakenCursorSession>[1],
  cursor: FakeCursor,
  home: string,
) {
  const recent = await openTakenCursorSession(page, origin);
  await expectNormalizedReading(recent, "Ready for review", true);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await endHeldClient(page, cursor, home);
  await page.reload();
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(1);
  expect(agentCalls(cursor)).toEqual(calls);
  expect(cursor.attaches()).toHaveLength(attaches);
  return entry;
}

// Returns once the start has settled with its client kept, so a caller may
// end, stop, or replace that client without leaving the start in need of
// reconciliation.
export async function startCursorExecution(
  page: Parameters<typeof openTakenCursorSession>[0],
  origin: Parameters<typeof openTakenCursorSession>[1],
  cursor: FakeCursor,
  home: string,
  model?: string,
) {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const queued = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await queued.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  if (model !== undefined) {
    await dialog.getByRole("combobox", { name: "Model" }).selectOption(model);
  }
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Implement the selected slice.");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const entry = page.getByRole("article", {
    name: "Execution session",
    exact: true,
  });
  await expect(entry).toContainText("First input accepted", {
    timeout: launchWaitMs,
  });
  await expect(entry).toContainText(cursor.sessionId);
  // The entry can show the accepted first input while the runner still
  // waits for Cursor's answer to it.
  await expectRunnerKeeps(home, cursor.sessionId);
  return entry;
}

// The runner lists a session as last held once it keeps the client, which
// settles that session's start.
async function expectRunnerKeeps(
  home: string,
  sessionId: string,
): Promise<void> {
  await expect
    .poll(() => readCursorRunnerLastHeld(home), { timeout: launchWaitMs })
    .toContain(sessionKey({ host: "cursor", sessionId }));
}

// The same execution launch with a model chosen in the dialog, so the
// session is launched in its own configuration scope (slice 2).
export async function startScopedCursorExecution(
  page: Parameters<typeof openTakenCursorSession>[0],
  origin: Parameters<typeof openTakenCursorSession>[1],
  cursor: FakeCursor,
  home: string,
  model = "gpt-5.2",
) {
  return startCursorExecution(page, origin, cursor, home, model);
}

// A second execution launch (Story B), with its own queued chat id so the
// two sessions' records stay distinct. Without a model it is the unscoped
// of the two sessions a stale runner can hold.
export async function launchSecondHeldSession(
  page: Page,
  origin: Parameters<typeof openTakenCursorSession>[1],
  cursor: FakeCursor,
  home: string,
  sessionId: string,
  model?: string,
): Promise<void> {
  cursor.queueCreateChatId(sessionId);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await parts(page)
    .backlog.getByRole("article", { name: "Story B", exact: true })
    .getByRole("button", { name: "Start execution" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  if (model !== undefined) {
    await dialog.getByRole("combobox", { name: "Model" }).selectOption(model);
  }
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Implement the selected slice.");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => keptRecords(home).length, { timeout: launchWaitMs })
    .toBe(2);
  await expect
    .poll(
      () =>
        cursor.attaches().filter((each) => each.sessionId === sessionId).length,
      { timeout: launchWaitMs },
    )
    .toBe(1);
  // The attach is logged before the runner settles its first instruction.
  await expectRunnerKeeps(home, sessionId);
}

export function keptRecords(home: string): LaunchRecord[] {
  return (
    (
      JSON.parse(
        readFileSync(
          path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
          "utf8",
        ),
      ) as Record<string, LaunchRecord[]>
    )["open-dough"] ?? []
  );
}
