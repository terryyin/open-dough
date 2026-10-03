import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { apiKey, save, status } from "./openAISettingsPage.ts";
import { settings, back } from "./systemSettingsPage.ts";

export const voiceKey = "synthetic-saved-voice-key";

export async function saveVoiceKey(page: Page) {
  await settings(page).click();
  await apiKey(page).fill(voiceKey);
  await save(page).click();
  await expect(status(page)).toHaveText("API key: Configured");
  await back(page).click();
}

export async function observeMicrophone(page: Page) {
  await page.addInitScript(() => {
    const voice = {
      tracks: [] as MediaStreamTrack[],
      bytes: 0,
      holdPermission: false,
      grant: undefined as (() => void) | undefined,
    };
    Object.assign(window, { voiceObservation: voice });
    const get = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await get(constraints);
      voice.tracks.push(...stream.getTracks());
      if (voice.holdPermission) {
        await new Promise<void>((resolve) => {
          voice.grant = resolve;
        });
      }
      return stream;
    };
    // The observer invokes this captured native method only with the actual
    // recording instance via .call(this), preserving its required receiver.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const start = MediaRecorder.prototype.start;
    MediaRecorder.prototype.start = function (timeslice) {
      this.addEventListener("dataavailable", (event) => {
        voice.bytes += event.data.size;
      });
      start.call(this, timeslice);
    };
    const delivery = {
      hold: false,
      ready: false,
      consumed: false,
      release: undefined as (() => void) | undefined,
    };
    Object.assign(window, { voiceDelivery: delivery });
    const fetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const response = await fetch(input, init);
      const requestURL = new URL(
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
        window.location.href,
      );
      if (
        requestURL.pathname === "/__instruction-transcription" &&
        delivery.hold
      ) {
        // Wait for the real local/provider response to arrive in full, then
        // delay only its delivery to the caller. No transcript is supplied here.
        const bytes = await response.arrayBuffer();
        const completed = new Response(bytes, {
          status: response.status,
          headers: response.headers,
        });
        const json = completed.json.bind(completed);
        completed.json = async () => {
          const value: unknown = await json();
          delivery.consumed = true;
          return value;
        };
        delivery.ready = true;
        await new Promise<void>((resolve) => {
          delivery.release = resolve;
        });
        return completed;
      }
      return response;
    };
  });
}

export async function recordClip(page: Page, dialog: Locator) {
  const before = await page.evaluate(
    () =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes,
  );
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Recording… Stop recording when you are finished.",
  );
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(dialog.locator("textarea")).toHaveAttribute("readonly", "");
  await page.waitForFunction(
    (previous) =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes > previous,
    before,
  );
  await dialog
    .getByRole("button", { name: "Stop recording", exact: true })
    .click();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
}

export function stoppedTracks(page: Page) {
  return page.evaluate(() => {
    const tracks = (
      window as unknown as { voiceObservation: { tracks: MediaStreamTrack[] } }
    ).voiceObservation.tracks;
    return (
      tracks.length > 0 && tracks.every((track) => track.readyState === "ended")
    );
  });
}
