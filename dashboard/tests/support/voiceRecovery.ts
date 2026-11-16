import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { realpathSync } from "node:fs";
import path from "node:path";
import { dashboardBrowserArgs } from "./browserArgs.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { voiceProvider } from "./voiceProvider.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { seedVoiceKey, stoppedTracks, voiceKey } from "./voicePage.ts";

export const originalDraft = "Keep this work local";
// Every voice journey takes one of these objects: `launchOptions` is a
// worker-scoped option, so literal copies would be worker populations that
// never share a worker (./pageTest.ts says why). A frontend journey takes
// the browser's microphone alone; a journey against dashboardServer also
// names the project folder it serves.
export const microphoneBrowserOptions = {
  permissions: ["microphone"],
  launchOptions: {
    args: [
      ...dashboardBrowserArgs,
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  },
};
export const voiceBrowserOptions = {
  projectFolders: ["open-dough"],
  ...microphoneBrowserOptions,
};

export async function openVoiceDraft(
  page: Page,
  dashboard: DashboardServer,
  journey: LaunchJourney,
  configure = true,
) {
  if (configure) seedVoiceKey(dashboard.home);
  await openTakenBacklog(page, journey);
  return startVoiceDraft(page);
}

// Opens Start session on the open board and types the original draft.
export async function startVoiceDraft(page: Page) {
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill(originalDraft);
  return dialog;
}

// The dialog after a failed recording: `message` alerts, the original draft
// stays editable, Start and Record are offered again, and the microphone is
// released, its transcription request aborted when the clip was `captured`,
// or never opened otherwise. No private diagnostic reaches the dialog.
export async function recoveredDialog(
  page: Page,
  dialog: Locator,
  message: string,
  captured = true,
) {
  await expect(dialog.getByRole("alert")).toHaveText(message);
  await expect(startSessionField(dialog)).toHaveValue(originalDraft);
  await expect(startSessionField(dialog)).toBeEditable();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await expect(
    dialog.getByRole("button", { name: "Record", exact: true }),
  ).toBeEnabled();
  await expect(
    dialog.getByRole("button", { name: "Stop recording", exact: true }),
  ).toBeDisabled();
  await expect(dialog.getByRole("status")).toHaveText(
    "Dictate, then review or edit the text before Start.",
  );
  if (captured) {
    expect(await stoppedTracks(page)).toBe(true);
    expect(
      await page.evaluate(
        () =>
          (
            window as unknown as {
              voiceObservation: { requests: AbortSignal[] };
            }
          ).voiceObservation.requests.at(-1)?.aborted,
      ),
    ).toBe(true);
  } else
    expect(
      await page.evaluate(
        () =>
          (
            window as unknown as {
              voiceObservation: { tracks: MediaStreamTrack[] };
            }
          ).voiceObservation.tracks.length,
      ),
    ).toBe(0);
  expect(await dialog.textContent()).not.toContain(voiceKey);
  expect(await dialog.textContent()).not.toContain(
    "private-provider-diagnostic",
  );
}

// The recovered dialog, with nothing transcribed beyond `calls`, launched or
// written to GitHub, and no key or diagnostic in the server's output. Each
// caller's later count of provider calls observes that the recovered
// operation stays quiet.
export async function recovered(
  page: Page,
  dashboard: DashboardServer,
  provider: Awaited<ReturnType<typeof voiceProvider>>,
  dialog: Locator,
  message: string,
  calls: number,
  captured = true,
) {
  await recoveredDialog(page, dialog, message, captured);
  expect(provider.calls).toHaveLength(calls);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(
    dashboard
      .ghCalls()
      .some((call) => call.includes("POST") || call.includes("PATCH")),
  ).toBe(false);
  expect(dashboard.output()).not.toContain(voiceKey);
  expect(dashboard.output()).not.toContain("private-provider-diagnostic");
}

export async function typedStart(dashboard: DashboardServer, dialog: Locator) {
  const text = `${originalDraft}\n\nReview before implementing`;
  await startSessionField(dialog).fill(text);
  expect(dashboard.claudeCalls()).toEqual([]);
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(() => dashboard.claudeLaunchCalls())
    .toEqual([
      {
        argv: [
          "--bg",
          "--name",
          "Open Dough · Ad hoc · Keep this work local Review before imple…",
          "--effort",
          "medium",
          text,
        ],
        cwd: realpathSync(path.join(dashboard.home, "git", "open-dough")),
      },
    ]);
}
