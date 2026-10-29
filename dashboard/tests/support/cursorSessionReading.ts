// How a spec opens one Cursor session from the story card and reads what
// that entry shows. A held screen is named by the runner's label. Any other
// reading shows its own words and none of those labels.
import { readFileSync } from "node:fs";
import { expect, type Locator, type Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts, sessionStateOf } from "../dashboardPage.ts";
import { startSessionField } from "../launchStoryCardPage.ts";
import { cursorHeldLabels } from "../../src/cursorHeldLabel.ts";
import { hostDescriptions } from "../../src/hostDescription.ts";
import { agentLaunchEndpoint } from "../../src/launchRequest.ts";
import type { HostOperations } from "../../src/sessionCapabilities.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { sessionActions } from "./sessionEntryDisclosure.ts";

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

export async function openTakenCursorSession(
  page: Page,
  origin: StartOrigin,
  model?: string,
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
  if (model !== undefined)
    await dialog.getByRole("combobox", { name: "Model" }).selectOption(model);
  await startSessionField(dialog).fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const recent = parts(page).taken.locator(".session-entry");
  await expect(recent).toHaveCount(1);
  // The start presents the session's terminal. Its socket joins the held
  // client once that terminal shows the screen. A join arriving after a later
  // hangup or runner stop would attach a new client instead.
  await expect(
    page.getByRole("region", { name: "Terminal" }).locator(".xterm-rows"),
  ).toContainText(/\S/u);
  return recent;
}

// Actions on a held Cursor session's entry: Open terminal and Stop, and,
// because its state is now known, no Delete record (that stays for unknown
// or unavailable readings, as for every host); no rename.
export async function expectCursorSessionActions(
  page: Page,
  entry: Locator,
): Promise<void> {
  await sessionActions(entry);
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(1);
  await expect(
    entry.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(0);
  await expect(entry.getByRole("button", { name: "Stop" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /rename/i })).toHaveCount(0);
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

// The question text a native clarifying-question screen yields, numbered
// line included, as the entry's Needs input note shows it.
export const cursorQuestion = "1. Which color do you prefer, Red or Blue?";

// The entry shows this normalized reading (not a runner screen label), and
// needs attention exactly when the reading says so.
export async function expectNormalizedReading(
  entry: Locator,
  words: string,
  needsAttention: boolean,
): Promise<void> {
  await expectReadingWithoutScreenLabel(entry, words);
  if (needsAttention) {
    await expect(entry).toHaveClass(/needs-attention/);
  } else {
    await expect(entry).not.toHaveClass(/needs-attention/);
  }
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
