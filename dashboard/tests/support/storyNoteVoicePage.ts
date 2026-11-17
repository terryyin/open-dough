// Note composer voice mechanics; native microphone observations stay shared.
import { expect, type Page } from "@playwright/test";
import { stoppedTracks } from "./voicePage.ts";

export function storyNoteVoicePage(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Story notes", exact: true });
  const form = dialog.locator("form");
  const field = form.getByRole("textbox", { name: "Note text", exact: true });
  const button = (name: string) =>
    form.getByRole("button", { name, exact: true });
  const candidate = form.getByRole("textbox", {
    name: "Transcript to shorten",
  });
  return {
    dictate: () => button("Dictate").click(),
    expectStatus: async (message: string) => {
      await expect(form.getByRole("status")).toHaveText(message);
    },
    expectBusy: async () => {
      await expect(button("Save note")).toBeDisabled();
      await expect(button("Dictate")).toBeDisabled();
      await expect(field).toHaveAttribute("readonly", "");
      await expect(button("Cancel")).toBeEnabled();
    },
    expectReady: async () => {
      await expect(field).toBeEditable();
      await expect(button("Save note")).toBeEnabled();
      await expect(button("Dictate")).toBeEnabled();
    },
    record: async () => {
      const before = await page.evaluate(
        () =>
          (window as unknown as { voiceObservation: { bytes: number } })
            .voiceObservation.bytes,
      );
      await button("Dictate").click();
      await expect(form.getByRole("status")).toHaveText(
        "Recording… Stop recording when you are finished.",
      );
      await expect(button("Save note")).toBeDisabled();
      await expect(field).toHaveAttribute("readonly", "");
      await page.waitForFunction(
        (previous) =>
          (window as unknown as { voiceObservation: { bytes: number } })
            .voiceObservation.bytes > previous,
        before,
      );
      await button("Stop recording").click();
      await expect.poll(() => stoppedTracks(page)).toBe(true);
    },
    expectTranscript: async (text: string) => {
      await expect(candidate).toHaveValue(text);
      await expect(candidate).toBeFocused();
    },
    shorten: (text: string) => candidate.fill(text),
    addTranscript: () => button("Add transcript").click(),
    discardTranscript: () => button("Discard transcript").click(),
    expectAddDisabled: async () => {
      await expect(button("Add transcript")).toBeDisabled();
    },
    expectNoTranscript: async () => {
      await expect(candidate).toHaveCount(0);
    },
    openSettings: () => button("Open OpenAI settings").click(),
    expectKeyboardOrder: async (actions: readonly string[]) => {
      await field.focus();
      for (const name of actions) {
        await page.keyboard.press("Tab");
        await expect(
          dialog.getByRole("button", { name, exact: true }),
        ).toBeFocused();
      }
    },
  };
}
