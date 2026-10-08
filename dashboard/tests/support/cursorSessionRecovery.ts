// Journey helpers for Recover on an unfinished Cursor session the runner
// does not hold: stop the held client, open the stopped entry, start an
// execution launch that confirms first input, and read kept launch records.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { cursorHeldLabel } from "../../src/cursorHeldLabel.ts";
import { cursorRunnerSessionsEndpoint } from "../../src/cursorRunnerSessions.ts";
import { agentNotRunningLabel } from "../../src/sessionRecovery.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { parts } from "../dashboardPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  agentCalls,
  expectHeldLabel,
  expectReadingWithoutScreenLabel,
  openTakenCursorSession,
} from "./cursorSessionReading.ts";
import { expect } from "./cursorStart.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import { launchWaitMs } from "./launchWait.ts";

export { agentNotRunningLabel };

// Ends the held attach the way the runner does (SIGHUP) and waits until the
// runner lists no held sessions. The fake client exits on SIGHUP, not SIGTERM.
export async function endHeldClient(
  page: Page,
  cursor: FakeCursor,
): Promise<void> {
  // Launch may paint the card before the attach log line is flushed.
  await expect
    .poll(() => cursor.attaches().at(-1)?.pid ?? 0, { timeout: 15_000 })
    .toBeGreaterThan(0);
  const pid = cursor.attaches().at(-1)?.pid ?? 0;
  try {
    process.kill(pid, "SIGHUP");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
  }
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
) {
  const recent = await openTakenCursorSession(page, origin);
  await expectHeldLabel(recent, cursorHeldLabel.followUp);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await endHeldClient(page, cursor);
  await page.reload();
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(1);
  expect(agentCalls(cursor)).toEqual(calls);
  expect(cursor.attaches()).toHaveLength(attaches);
  return entry;
}

export async function startCursorExecution(
  page: Parameters<typeof openTakenCursorSession>[0],
  origin: Parameters<typeof openTakenCursorSession>[1],
  cursor: FakeCursor,
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
  return entry;
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
