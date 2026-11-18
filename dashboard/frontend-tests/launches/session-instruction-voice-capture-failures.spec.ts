// Dictating into Start session when the browser cannot capture: a refused
// microphone permission, no usable device or no supported recording format
// alerts within the same dialog, keeps the typed draft and Start, posts no
// clip, and a typed instruction is still what Start sends; once permission is
// allowed, an explicit retry records. Built frontend against controlled
// transcription and launch answers; the saved key the server reads and the
// started session are ../../../e2e/launches/session-instruction-voice-key-failures.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { frontendAttempt } from "../../test-support/support/frontendLaunchAttempts.ts";
import { installFrontendTranscription } from "../../test-support/support/frontendTranscriptionSubstitutes.ts";
import { startSessionField } from "../../test-support/launchStoryCardPage.ts";
import {
  observeMicrophone,
  recordClip,
} from "../../test-support/support/voicePage.ts";
import {
  microphoneBrowserOptions,
  originalDraft,
  recoveredDialog,
  startVoiceDraft,
} from "../../test-support/support/voiceRecovery.ts";
import { instructionProblems } from "../../src/instructionTranscription.ts";

test.use(microphoneBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

for (const failure of ["permission", "device", "format"] as const) {
  test(`${failure} unavailability makes no transcription request and recovers within the same dialog`, async ({
    page,
    frontendServices,
  }) => {
    const transcription = await installFrontendTranscription(
      page,
      frontendServices,
    );
    const boundary = await installFrontendLaunchBoundary(page, {
      accept: frontendAttempt(frontendServices).accept,
    });
    await openFrontendTakenBacklog(page);
    const dialog = await startVoiceDraft(page);
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
    await recoveredDialog(page, dialog, instructionProblems[failure], false);
    expect(transcription.clips()).toBe(0);
    if (failure === "permission") {
      await page.evaluate(() => {
        (window as unknown as { restoreCapture: () => void }).restoreCapture();
      });
      await recordClip(page, dialog);
      await expect(startSessionField(dialog)).toHaveValue(
        `${originalDraft}\n\nDo not implement yet`,
      );
      expect(transcription.clips()).toBe(1);
      await expect(dialog.getByRole("alert")).toHaveCount(0);
    }
    const typed = `${originalDraft}\n\nReview before implementing`;
    await startSessionField(dialog).fill(typed);
    expect(boundary.acceptances).toEqual([]);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(boundary.acceptances.map((request) => request.instruction)).toEqual([
      typed,
    ]);
    expect(transcription.clips()).toBe(failure === "permission" ? 1 : 0);
  });
}
