import { test, expect } from "./support/voiceTest.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { startSessionField } from "./launchCardPage.ts";
import { observeMicrophone, recordClip } from "./support/voicePage.ts";
import {
  openVoiceDraft,
  recovered,
  typedStart,
  voiceBrowserOptions,
  originalDraft,
} from "./support/voiceRecovery.ts";
import { instructionProblems } from "../src/instructionTranscription.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

for (const failure of ["permission", "device", "format"] as const) {
  test(`${failure} unavailability makes no provider call and recovers within the same dialog`, async ({
    page,
    dashboard,
    provider,
  }) => {
    const dialog = await openVoiceDraft(page, journey);
    await page.evaluate((kind) => {
      const get = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices,
      );
      const supported = MediaRecorder.isTypeSupported.bind(MediaRecorder);
      Object.assign(window, {
        restoreCapture: () => {
          navigator.mediaDevices.getUserMedia = get;
          MediaRecorder.isTypeSupported = supported;
        },
      });
      if (kind === "format") MediaRecorder.isTypeSupported = () => false;
      else
        navigator.mediaDevices.getUserMedia = () =>
          Promise.reject(
            new DOMException(
              "private-provider-diagnostic",
              kind === "permission" ? "NotAllowedError" : "NotFoundError",
            ),
          );
    }, failure);
    await dialog.getByRole("button", { name: "Record", exact: true }).click();
    await recovered(
      page,
      dashboard,
      provider,
      dialog,
      instructionProblems[failure],
      0,
      false,
    );
    if (failure === "permission") {
      await page.evaluate(() => {
        (window as unknown as { restoreCapture: () => void }).restoreCapture();
      });
      await recordClip(page, dialog);
      await expect(startSessionField(dialog)).toHaveValue(
        `${originalDraft}\n\nDo not implement yet`,
      );
      expect(provider.calls).toHaveLength(1);
      await expect(dialog.getByRole("alert")).toHaveCount(0);
    }
    await typedStart(dashboard, dialog);
    expect(provider.calls).toHaveLength(failure === "permission" ? 1 : 0);
  });
}
