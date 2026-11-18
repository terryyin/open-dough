// Terminal dictation and retained-transcript protocol. Ordinary screen,
// status, input, prompts and reconnect stay on ../terminalScreenPage.ts.
// Provider hold/release, native attach lines and sent-byte traffic remain
// caller facts; helpers never submit Enter or complete a held provider read.
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { launched } from "../agentTerminalBoundary.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import {
  openSessionsSidebar,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
import {
  expectTerminalIdentity,
  expectTerminalText,
  activateTerminalControl,
  focusTerminalDictation,
  type TerminalInteraction,
  terminalPanel,
  terminalPromptsControl,
  terminalStatus,
} from "../terminalScreenPage.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { stoppedTracks } from "./voicePage.ts";

// Safari buttons do not take pointer focus. Model that native default after
// the page handles mousedown, while respecting cancellation of that default.
export async function unfocusedPromptButtons(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener("mousedown", (event) => {
      if (
        !event.defaultPrevented &&
        event.target instanceof Element &&
        event.target.closest('[role="menuitem"]') &&
        document.activeElement instanceof HTMLElement
      ) {
        event.preventDefault();
        document.activeElement.blur();
      }
    });
  });
}

export async function openTerminalVoice(
  page: Page,
  dashboard: DashboardServer,
  journey: LaunchJourney,
) {
  const first = await launched(dashboard, "open-dough", {
    title: "Voice session A",
  });
  const second = await launched(dashboard, "open-dough", {
    title: "Voice session B",
  });
  await openTakenBacklog(page, journey);
  const panel = terminalPanel(page);
  const open = async (title = "Voice session A") => {
    await openSessionsSidebar(page);
    await sessionsSidebarParts(page).entry(title).click();
    await expectTerminalText(panel, "Claude Code");
    await expectTerminalIdentity(panel, title);
  };
  await open();
  return { panel, open, first, second };
}

export function dictateIntoTerminalControl(panel: Locator) {
  return panel.getByRole("button", {
    name: "Dictate into terminal",
    exact: true,
  });
}

export function stopRecordingControl(panel: Locator) {
  return panel.getByRole("button", { name: "Stop recording", exact: true });
}

export function unsentTranscript(panel: Locator) {
  return panel.getByRole("textbox", { name: "Unsent transcript" });
}

export function insertTranscriptControl(panel: Locator) {
  return panel.getByRole("button", { name: "Insert transcript", exact: true });
}

export function discardTranscriptControl(panel: Locator) {
  return panel.getByRole("button", { name: "Discard transcript", exact: true });
}

export function voiceAlert(panel: Locator) {
  return panel.getByRole("alert");
}

export function voiceSettingsControl(panel: Locator) {
  return panel.getByRole("button", { name: "Open OpenAI settings" });
}

export async function expectVoiceStatus(panel: Locator, text: string | RegExp) {
  await expect(terminalStatus(panel)).toContainText(text);
}

export async function expectVoiceStatusText(
  panel: Locator,
  text: string | RegExp,
) {
  await expect(terminalStatus(panel)).toHaveText(text);
}

export async function expectVoiceStatusEmpty(panel: Locator) {
  await expect(terminalStatus(panel)).toBeEmpty();
}

export async function expectUnsentTranscript(panel: Locator, text: string) {
  await expect(unsentTranscript(panel)).toHaveValue(text);
}

export async function expectNoUnsentTranscript(panel: Locator) {
  await expect(unsentTranscript(panel)).toHaveCount(0);
}

export async function insertRetainedTranscript(panel: Locator) {
  await insertTranscriptControl(panel).click();
}

export async function discardRetainedTranscript(panel: Locator) {
  await discardTranscriptControl(panel).click();
}

export async function chooseTerminalDictation(panel: Locator) {
  await dictateIntoTerminalControl(panel).click();
}

// These actions wait only for capture progress. Scenarios own status, toolbar,
// transcript, and sent-byte observations when those are their subject.
export async function startTerminalDictation(
  panel: Locator,
  { using = "mouse" }: { using?: TerminalInteraction } = {},
) {
  const page = panel.page();
  const before = await page.evaluate(
    () =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes,
  );
  if (using === "keyboard") await focusTerminalDictation(panel);
  await activateTerminalControl(dictateIntoTerminalControl(panel), using);
  await expect(stopRecordingControl(panel)).toBeVisible();
  await awaitRecordingBytes(page, before);
}

export async function finishTerminalDictation(
  panel: Locator,
  { using = "mouse" }: { using?: TerminalInteraction } = {},
) {
  if (using === "keyboard") await focusTerminalDictation(panel);
  const stop = stopRecordingControl(panel);
  if (using === "keyboard") await stop.press("Space");
  else await activateTerminalControl(stop, using);
  await expect.poll(() => stoppedTracks(panel.page())).toBe(true);
}

export async function expectTerminalDictationAvailable(
  panel: Locator,
  enabled: boolean,
) {
  const choice = dictateIntoTerminalControl(panel);
  if (enabled) await expect(choice).toBeEnabled();
  else await expect(choice).toBeDisabled();
}

export async function awaitRecordingBytes(page: Page, previous = 0) {
  await page.waitForFunction(
    (prior) =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes > prior,
    previous,
  );
}

export async function expectClipStopped(page: Page, panel: Locator) {
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  await expect(terminalPromptsControl(panel)).toBeVisible();
  await expect(dictateIntoTerminalControl(panel)).toBeVisible();
}

export async function beginTerminalClip(page: Page, panel: Locator) {
  const before = await page.evaluate(
    () =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes,
  );
  await chooseTerminalDictation(panel);
  await expect(stopRecordingControl(panel)).toBeVisible();
  await expect(terminalPromptsControl(panel)).toBeVisible();
  await expectVoiceStatusText(
    panel,
    "Recording… Stop recording when you are finished.",
  );
  await awaitRecordingBytes(page, before);
}

export async function stopTerminalClip(page: Page, panel: Locator) {
  await stopRecordingControl(panel).click();
  await expectClipStopped(page, panel);
}
