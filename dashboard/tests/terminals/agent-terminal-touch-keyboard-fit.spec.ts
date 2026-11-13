import { control } from "../sidePanelFrame.ts";
// Soft-keyboard and orientation fit for the Side panel terminal on the
// ordinary page/xterm/WebSocket/PTY path. Simulated visualViewport / reduced
// height / rotate keep toolbar, composer actions, and Close reachable; the
// attachment and unsent draft survive; hide-keyboard dismisses focus; desktop
// keeps today's layout without the fit override.
import { expect, test } from "../dashboardTest.ts";
import { launched } from "../agentTerminalBoundary.ts";
import {
  expectTerminalInputFocused,
  expectTerminalInputNotFocused,
  expectTerminalText,
  terminalPanel,
} from "../terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import { expectCovering, resizeUntilArranged } from "../sidePanelWidthPage.ts";
import {
  clearSoftKeyboardViewport,
  expectControlInVisualViewport,
  expectFittedInput,
  expectMinTouchTarget,
  focusByTouch,
  hideKeyboardControl,
  insertDraftButton,
  noteTerminalTraffic,
  openTerminalComposer,
  simulateSoftKeyboardViewport,
  terminalComposerDraft,
  terminalKey,
  terminalKeyToolbar,
} from "../touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const title = "Phone terminal keyboard fit session";
const { portrait, landscape } = phoneLaunchTouchViewport;

test.describe("phone terminal soft-keyboard and orientation fit", () => {
  test.use({
    viewport: portrait,
    hasTouch: true,
  });

  test("visualViewport fit, hide-keyboard, and rotate keep controls, attachment, and draft", async ({
    page,
    dashboard,
  }) => {
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#phone-terminal-keyboard-fit",
      title,
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const { sizes } = noteTerminalTraffic(page);
    await tapWhereShown(sidebar.entry(title));
    const panel = terminalPanel(page);
    const close = control(panel, "Close");
    const hide = hideKeyboardControl(panel);
    await expectTerminalText(panel, `attached ${native.shortId}`);
    await expect(terminalKeyToolbar(panel)).toBeVisible();
    await expect(hide).toHaveCount(0);
    await expectFittedInput(panel, sizes);
    expect(dashboard.claudeAttaches()).toHaveLength(1);

    await openTerminalComposer(panel);
    await expect(hide).toBeVisible();
    await expectMinTouchTarget(hide);
    const draft = terminalComposerDraft(panel);
    const insert = insertDraftButton(panel);
    const held = "unsent draft across keyboard fit";
    await draft.fill(held);
    await expect(draft).toHaveValue(held);
    await expect(insert).toBeVisible();

    await test.step("simulated soft keyboard fits the panel; controls stay reachable; draft and attachment survive", async () => {
      await focusByTouch(panel);
      await expectTerminalInputFocused(panel);
      await simulateSoftKeyboardViewport(page, 320);
      await expectCovering(panel);
      await expectFittedInput(panel, sizes);
      for (const control of [
        hide,
        close,
        terminalKey(panel, "Enter"),
        terminalKey(panel, "Paste"),
        insert,
        draft,
      ]) {
        await expect(control).toBeVisible();
        await expectControlInVisualViewport(control);
      }
      await expectMinTouchTarget(hide);
      await expectMinTouchTarget(insert);
      await expect(draft).toHaveValue(held);
      expect(dashboard.claudeAttaches()).toHaveLength(1);
      expect(dashboard.claudeAttaches()[0]?.id).toBe(native.shortId);
    });

    await test.step("hide-keyboard blurs focused input without reconnect", async () => {
      await focusByTouch(panel);
      await expectTerminalInputFocused(panel);
      await tapWhereShown(hideKeyboardControl(panel));
      await expectTerminalInputNotFocused(panel);
      await expect(draft).toHaveValue(held);
      expect(dashboard.claudeAttaches()).toHaveLength(1);
      await clearSoftKeyboardViewport(page);
      await expectFittedInput(panel, sizes);
      await expect(draft).toHaveValue(held);
    });

    await test.step("reduced height and orientation keep fit, draft, and reachable controls", async () => {
      await page.setViewportSize({ width: portrait.width, height: 400 });
      await expectCovering(panel);
      await expectFittedInput(panel, sizes);
      await expect(draft).toHaveValue(held);
      for (const control of [
        hideKeyboardControl(panel),
        close,
        insert,
        draft,
      ]) {
        await expect(control).toBeVisible();
        await expectControlInVisualViewport(control);
      }

      // Extreme short phone: composer + toolbar leave little screen room; chrome
      // and Close must stay in the visible area without reconnecting to re-fit.
      await page.setViewportSize({ width: portrait.width, height: 240 });
      await expectCovering(panel);
      // The panel re-fits after the resize; read its height once it has.
      await expect
        .poll(async () => (await box(panel)).height)
        .toBeCloseTo(240, 0);
      await expect(draft).toHaveValue(held);
      for (const control of [
        hideKeyboardControl(panel),
        close,
        insert,
        draft,
      ]) {
        await expect(control).toBeVisible();
        await expectControlInVisualViewport(control);
      }
      await tapWhereShown(hideKeyboardControl(panel));
      await expect(draft).toHaveValue(held);
      expect(dashboard.claudeAttaches()).toHaveLength(1);

      for (const view of [landscape, portrait]) {
        await resizeUntilArranged(panel, view);
        if (view.width <= 800) await expectCovering(panel);
        await expectFittedInput(panel, sizes);
        await expect(draft).toHaveValue(held);
        await expect(hideKeyboardControl(panel)).toBeVisible();
        await expectControlInVisualViewport(hideKeyboardControl(panel));
        await expectControlInVisualViewport(close);
        await expectControlInVisualViewport(insert);
      }
      expect(dashboard.claudeAttaches()).toHaveLength(1);
      expect(dashboard.claudeAttaches()[0]?.id).toBe(native.shortId);
    });
  });
});

test.describe("desktop terminal without soft-keyboard fit chrome", () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
  });

  test("fine-pointer desktop keeps panel height CSS and omits hide-keyboard", async ({
    page,
    dashboard,
  }) => {
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#desktop-no-keyboard-fit",
      title: "Desktop terminal without keyboard fit",
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry("Desktop terminal without keyboard fit").click();
    const panel = terminalPanel(page);
    await expectTerminalText(panel, `attached ${native.shortId}`);
    await expect(terminalKeyToolbar(panel)).toBeHidden();
    await expect(hideKeyboardControl(panel)).toBeHidden();
    expect(
      await panel.evaluate((element) =>
        element.style.getPropertyValue("--side-panel-height"),
      ),
    ).toBe("");
    expect(await panel.evaluate((element) => element.style.top)).toBe("");
    await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
  });
});
