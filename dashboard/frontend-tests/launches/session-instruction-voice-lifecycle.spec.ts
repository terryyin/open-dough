// Dictating into Start session never outlives the dialog it began in:
// Cancel while transcribing abandons the request, Escape stops capture, and a
// late permission grant or answer cannot record into the reopened dialog; a
// track that ends before Stop keeps the typed draft and posts nothing. The
// microphone is released each time. Built frontend against controlled
// transcription answers and the browser's synthetic microphone; that the
// server ends the provider's work when Cancel abandons the request is
// ../../../e2e/launches/session-instruction-voice-provider-failures.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { installFrontendTranscription } from "../../test-support/support/frontendTranscriptionSubstitutes.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../test-support/launchStoryCardPage.ts";
import {
  holdCompletedVoiceResponse,
  holdMicrophonePermission,
  observeMicrophone,
  recordClip,
  stoppedTracks,
} from "../../test-support/support/voicePage.ts";
import {
  microphoneBrowserOptions,
  originalDraft,
  startVoiceDraft,
} from "../../test-support/support/voiceRecovery.ts";

test.use(microphoneBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("a held transcription is abandoned on Cancel; reopening stays empty and microphone tracks are released", async ({
  page,
  frontendServices,
}) => {
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const held = transcription.holdNext();
  const action = startSession(page, "Open Dough");
  await action.click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("Discard this draft");
  await recordClip(page, dialog);
  await held.received;
  await expect(dialog.getByRole("status")).toHaveText("Transcribing…");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(startSessionField(dialog)).toHaveAttribute("readonly", "");
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect.poll(transcription.abandoned).toBe(1);
  await action.click();
  held.release();
  await held.delivered;
  await expect(startSessionField(dialog)).toHaveValue("");
  await expect(dialog.getByRole("status")).toHaveText(
    "Dictate, then review or edit the text before Start.",
  );
  expect(transcription.clips()).toBe(1);
  expect(boundary.acceptances).toEqual([]);
  expect(await stoppedTracks(page)).toBe(true);
});

test("Escape stops active capture; a late permission grant after dismissal cannot record into a reopened dialog", async ({
  page,
  frontendServices,
}) => {
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const action = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await action.click();
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Recording…");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  const permission = await holdMicrophonePermission(page);
  await action.click();
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await permission.requested();
  await expect(dialog.getByRole("status")).toHaveText(
    "Waiting for microphone permission…",
  );
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(startSessionField(dialog)).toHaveAttribute("readonly", "");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await action.click();
  await permission.grant();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  await expect(startSessionField(dialog)).toHaveValue("");
  expect(transcription.clips()).toBe(0);
  expect(boundary.acceptances).toEqual([]);
});

test("unexpected real microphone track end preserves typed text and makes no transcription request", async ({
  page,
  frontendServices,
}) => {
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const dialog = await startVoiceDraft(page);
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
  await expect(startSessionField(dialog)).toHaveValue(originalDraft);
  await expect(startSessionField(dialog)).toBeEditable();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  expect(await stoppedTracks(page)).toBe(true);
  expect(transcription.clips()).toBe(0);
  expect(boundary.acceptances).toEqual([]);
});

test("a completed response delivered after Cancel cannot populate the next launch dialog", async ({
  page,
  frontendServices,
}) => {
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const delivery = await holdCompletedVoiceResponse(page);
  const action = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await action.click();
  await startSessionField(dialog).fill("Discard the first draft");
  await recordClip(page, dialog);
  await delivery.ready();
  expect(transcription.clips()).toBe(1);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await action.click();
  await delivery.release();
  await expect(startSessionField(dialog)).toHaveValue("");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  expect(boundary.acceptances).toEqual([]);
  expect(await stoppedTracks(page)).toBe(true);
});
