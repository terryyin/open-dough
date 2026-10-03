import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { realpathSync } from "node:fs";
import path from "node:path";
import type { DashboardServer } from "./dashboardServer.ts";
import type { voiceProvider } from "./voiceProvider.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../launchCardPage.ts";
import { saveVoiceKey, stoppedTracks, voiceKey } from "./voicePage.ts";

export const originalDraft = "Keep this work local";
export const voiceBrowserOptions = {
  projectFolders: ["open-dough"],
  permissions: ["microphone"],
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  },
};

export async function openVoiceDraft(
  page: Page,
  journey: LaunchJourney,
  configure = true,
) {
  await openTakenBacklog(page, journey);
  if (configure) await saveVoiceKey(page);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill(originalDraft);
  return dialog;
}

export async function recovered(
  page: Page,
  dashboard: DashboardServer,
  provider: Awaited<ReturnType<typeof voiceProvider>>,
  dialog: Locator,
  message: string,
  calls: number,
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
  // Observe a quiet recovered operation before the developer explicitly acts.
  await page.waitForTimeout(200);
  expect(provider.calls).toHaveLength(calls);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(
    dashboard
      .ghCalls()
      .some((call) => call.includes("POST") || call.includes("PATCH")),
  ).toBe(false);
  expect(await dialog.textContent()).not.toContain(voiceKey);
  expect(await dialog.textContent()).not.toContain(
    "private-provider-diagnostic",
  );
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
          text,
        ],
        cwd: realpathSync(path.join(dashboard.home, "git", "open-dough")),
      },
    ]);
}
