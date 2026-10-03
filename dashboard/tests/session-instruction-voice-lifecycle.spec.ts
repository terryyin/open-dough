import { test, expect } from "./support/voiceTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchCardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import {
  observeMicrophone,
  recordClip,
  saveVoiceKey,
  stoppedTracks,
} from "./support/voicePage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use({
  projectFolders: ["open-dough"],
  permissions: ["microphone"],
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  },
});
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("held provider result is aborted on Cancel; reopening stays empty and microphone tracks are released", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  provider.hold();
  const action = startSession(page, "Open Dough");
  await action.click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("Discard this draft");
  await recordClip(page, dialog);
  await expect.poll(() => provider.calls.length).toBe(1);
  await expect(dialog.getByRole("status")).toHaveText("Transcribing…");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(startSessionField(dialog)).toHaveAttribute("readonly", "");
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect.poll(provider.disconnected).toBe(1);
  await action.click();
  provider.release();
  await expect(startSessionField(dialog)).toHaveValue("");
  await expect(dialog.getByRole("status")).toHaveText(
    "Dictate, then review or edit the text before Start.",
  );
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(await stoppedTracks(page)).toBe(true);
});

test("Escape stops active capture; a late permission grant after dismissal cannot record into a reopened dialog", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  const action = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await action.click();
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Recording…");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  await page.evaluate(() => {
    (
      window as unknown as { voiceObservation: { holdPermission: boolean } }
    ).voiceObservation.holdPermission = true;
  });
  await action.click();
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await page.waitForFunction(() =>
    Boolean(
      (window as unknown as { voiceObservation: { grant?: () => void } })
        .voiceObservation.grant,
    ),
  );
  await expect(dialog.getByRole("status")).toHaveText(
    "Waiting for microphone permission…",
  );
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(startSessionField(dialog)).toHaveAttribute("readonly", "");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await action.click();
  await page.evaluate(() => {
    (
      window as unknown as { voiceObservation: { grant?: () => void } }
    ).voiceObservation.grant?.();
  });
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  await expect(startSessionField(dialog)).toHaveValue("");
  expect(provider.calls).toHaveLength(0);
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("unexpected real microphone track end preserves typed text and makes no transcription request", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("Keep this work local");
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Recording…");
  await page.evaluate(() => {
    (
      window as unknown as { voiceObservation: { tracks: MediaStreamTrack[] } }
    ).voiceObservation.tracks.forEach((track) => {
      track.stop();
    });
  });
  await expect(dialog.getByRole("alert")).toContainText("ended before Stop");
  await expect(startSessionField(dialog)).toHaveValue("Keep this work local");
  await expect(startSessionField(dialog)).toBeEditable();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  expect(await stoppedTracks(page)).toBe(true);
  expect(provider.calls).toHaveLength(0);
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("a completed real response delivered after Cancel cannot populate the next launch dialog", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  await page.evaluate(() => {
    (
      window as unknown as { voiceDelivery: { hold: boolean } }
    ).voiceDelivery.hold = true;
  });
  const action = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await action.click();
  await startSessionField(dialog).fill("Discard the first draft");
  await recordClip(page, dialog);
  await page.waitForFunction(
    () =>
      (window as unknown as { voiceDelivery: { ready: boolean } }).voiceDelivery
        .ready,
  );
  expect(provider.calls).toHaveLength(1);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await action.click();
  await page.evaluate(() => {
    (
      window as unknown as { voiceDelivery: { release?: () => void } }
    ).voiceDelivery.release?.();
  });
  await page.waitForFunction(
    () =>
      (window as unknown as { voiceDelivery: { consumed: boolean } })
        .voiceDelivery.consumed,
  );
  await expect(startSessionField(dialog)).toHaveValue("");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(await stoppedTracks(page)).toBe(true);
});
