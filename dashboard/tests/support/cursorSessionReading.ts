// How a spec opens one Cursor session from the story card and reads what
// that entry shows. A held screen is named by the runner's label. Any other
// reading shows its own words and none of those labels.
import { readFileSync } from "node:fs";
import { expect, type Locator, type Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts, sessionStateOf } from "../dashboardPage.ts";
import { startSessionField } from "../launchCardPage.ts";
import { cursorHeldLabels } from "../../src/cursorHeldLabel.ts";
import { hostDescriptions } from "../../src/hostDescription.ts";
import { agentLaunchEndpoint } from "../../src/launchRequest.ts";
import type { HostOperations } from "../../src/sessionCapabilities.ts";
import type { StartOrigin } from "./startOrigin.ts";

export const instruction = "inspect this session";

export const unknownWords =
  "Activity unknown: Cursor has no passive status for this session";

export function expectCursorUnknownWording(): void {
  expect(hostDescriptions.cursor.unknownObservation).toEqual({
    label: "Activity unknown",
    note: "Cursor has no passive status for this session",
  });
  expect(unknownWords).not.toContain("session list could not be read");
  expect(unknownWords).not.toContain("Continue this conversation in Codex");
}

type SessionsAnswer = {
  readonly hostOperations: HostOperations;
  readonly records: readonly {
    readonly session: { readonly host: string; readonly sessionId: string };
    readonly sessionState: {
      readonly kind: string;
      readonly activity?: string;
      readonly label?: string;
    };
  }[];
};

export function readLog(file: string | undefined): string {
  if (file === undefined) return "";
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw error;
  }
}

export function projectedSessions(page: Page): Promise<SessionsAnswer> {
  return page.evaluate(async (endpoint) => {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Sessions could not be read.");
    return (await response.json()) as SessionsAnswer;
  }, agentLaunchEndpoint);
}

export function cursorRecord(answer: SessionsAnswer, sessionId: string) {
  return answer.records.find(
    (record) =>
      record.session.host === "cursor" &&
      record.session.sessionId === sessionId,
  );
}

export async function openRecentCursorSession(
  page: Page,
  origin: StartOrigin,
): Promise<Locator> {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const recent = parts(page).recentSessions.getByRole("article");
  await expect(recent).toHaveCount(1);
  return recent;
}

export async function expectCursorSessionActions(
  page: Page,
  entry: Locator,
): Promise<void> {
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(1);
  await expect(
    entry.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: /rename/i })).toHaveCount(0);
}

export async function expectNoBorrowedActivity(entry: Locator): Promise<void> {
  await expect(entry).not.toContainText("session list could not be read");
  await expect(entry).not.toContainText("Continue this conversation in Codex");
  await expect(entry).not.toContainText("Working");
  await expect(entry).not.toContainText("Needs input");
  await expect(entry).not.toContainText("Ready for review");
}

export async function expectHeldLabel(
  entry: Locator,
  label: string,
): Promise<void> {
  await expect(sessionStateOf(entry)).toHaveText(label);
  await expect(sessionStateOf(entry)).not.toContainText("Activity unknown");
  await expect(sessionStateOf(entry)).not.toContainText("Needs input");
  await expect(sessionStateOf(entry)).not.toContainText("Working");
  await expect(entry).not.toHaveClass(/needs-attention/);
}

// The entry shows these words and none of the runner's screen labels.
export async function expectReadingWithoutScreenLabel(
  entry: Locator,
  words: string,
): Promise<void> {
  await expect(sessionStateOf(entry)).toHaveText(words);
  for (const label of cursorHeldLabels) {
    await expect(sessionStateOf(entry)).not.toContainText(label);
  }
}

export function agentCalls(cursor: {
  calls(): readonly { readonly args: readonly string[] }[];
}): string[][] {
  return cursor.calls().map((call) => [...call.args]);
}
