import { test, expect } from "./support/voiceTest.ts";
import { voiceBrowserOptions } from "./support/voiceRecovery.ts";
import { observeMicrophone, seedVoiceKey } from "./support/voicePage.ts";
import {
  beginTerminalClip,
  openTerminalVoice,
  stopTerminalClip,
} from "./support/terminalVoicePage.ts";
import {
  noteTerminalTraffic,
  expectFittedInput,
  focusByTouch,
} from "./touchTerminalPage.ts";
import { tapWhereShown, box } from "./pageLayout.ts";

test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("keyboard dictation preserves typed input, offers one safe transcript, then edits and submits only on Enter", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  provider.setText("the header\nthen \u001b[31mthe controls\u0007");
  provider.hold();
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  const input = panel.locator(".xterm-helper-textarea");
  await expect(panel.getByRole("status")).toBeEmpty();
  await page.keyboard.type("Review ");
  // The explicit toolbar escape preserves ordinary native Tab and Escape.
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-describedby", /.+/);
  await page.keyboard.press("Tab");
  await expect.poll(() => sent).toContain("\t");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Alt+F10");
  await expect(
    panel.getByRole("group", { name: "Session actions", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("button", { name: "Dictate into terminal" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("status")).toContainText("Recording…");
  await input.focus();
  await page.keyboard.type("also ");
  await expect(
    panel.getByRole("button", { name: "Close", exact: true }),
  ).toBeEnabled();
  await page.waitForFunction(
    () =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes > 0,
  );
  await page.keyboard.press("Alt+F10");
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("button", { name: "Stop recording" }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await expect(panel.getByRole("status")).toHaveText("Transcribing…");
  await input.focus();
  await page.keyboard.type("later ");
  await expect.poll(() => provider.calls.length).toBe(1);
  provider.release();
  await expect(panel.getByRole("status")).toBeEmpty();
  const transcript = "the header then the controls";
  await expect
    .poll(() => sent.filter((value) => value === transcript))
    .toEqual([transcript]);
  await expect(panel.locator(".xterm-rows")).toContainText(transcript);
  await expect(panel.locator(".xterm-rows")).toContainText("Review");
  await expect(input).toBeFocused();
  expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  await page.keyboard.press("Backspace");
  await page.keyboard.type("!");
  await page.keyboard.press("Enter");
  await expect
    .poll(() => dashboard.claudeAttaches()[0]?.lines)
    .toEqual(["Review also later the header then the control!"]);
  expect(provider.calls).toHaveLength(1);
});

test("terminal dictation preserves a transcript beyond the launch field limit without submitting", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  const text = `${"spoken ".repeat(600)}end`;
  provider.setText(text);
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect
    .poll(() => sent.filter((value) => value === text))
    .toEqual([text]);
  await expect(panel.locator(".xterm-rows")).toContainText("end");
  expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  await page.keyboard.press("Enter");
  await expect.poll(() => dashboard.claudeAttaches()[0]?.lines).toEqual([text]);
});

test.describe("phone terminal microphone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test("touch records and stops with compact ordered actions and input room at reduced height", async ({
    page,
    dashboard,
    provider,
    launchJourney,
  }) => {
    seedVoiceKey(dashboard.home);
    provider.setText("the session header");
    const { sizes, sent } = noteTerminalTraffic(page);
    const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
    const mic = panel.getByRole("button", { name: "Dictate into terminal" });
    const done = panel.getByRole("button", {
      name: "Mark as done",
      exact: true,
    });
    const close = panel.getByRole("button", { name: "Close", exact: true });
    expect((await box(mic)).x).toBeLessThan((await box(done)).x);
    await focusByTouch(panel);
    await page.keyboard.type("Review ");
    await tapWhereShown(mic);
    await expect(panel.getByRole("status")).toContainText("Recording…");
    await page.waitForFunction(
      () =>
        (window as unknown as { voiceObservation: { bytes: number } })
          .voiceObservation.bytes > 0,
    );
    await tapWhereShown(panel.getByRole("button", { name: "Stop recording" }));
    await expect
      .poll(() => sent.filter((value) => value === "the session header"))
      .toEqual(["the session header"]);
    await expect(panel.locator(".xterm-rows")).toContainText("header");
    await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
    expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
    await page.keyboard.type("X");
    await page.keyboard.press("Backspace");
    await page.keyboard.type(" please");
    await page.keyboard.press("Enter");
    await expect
      .poll(() => dashboard.claudeAttaches()[0]?.lines)
      .toEqual(["Review the session header please"]);
    await page.setViewportSize({ width: 390, height: 400 });
    await expectFittedInput(panel, sizes);
    for (const control of [mic, done, close]) {
      await expect(control).toBeInViewport({ ratio: 1 });
      const bounds = await box(control);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await tapWhereShown(close);
    await expect(panel).toHaveCount(0);
  });
});
