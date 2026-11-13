import {
  closeSidePanel,
  control as frameControl,
  expectTitleOnOneCutLine,
  expectTitleWrapped,
} from "../../dashboard/tests/sidePanelFrame.ts";
// Ordinary page/xterm/WebSocket/PTY touch path; native stand-in supplies replies.
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { launched } from "../../dashboard/tests/agentTerminalBoundary.ts";
import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  expectRowRestsShowing,
  scrollYOf,
} from "../../dashboard/tests/boardPage.ts";
import {
  expectNoTerminalText,
  expectTerminalText,
  insertTerminalText,
  pressTerminalKey,
  terminalPanel,
  terminalScreenParts,
  typeLine,
} from "../../dashboard/tests/terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../../dashboard/tests/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/tests/storyColumnsPage.ts";
import { sessionsSidebarParts } from "../../dashboard/tests/sessionsSidebarPage.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  box,
  expectTopBarsShareHeight,
  tapWhereShown,
} from "../../dashboard/tests/pageLayout.ts";
import {
  expectBoardUnreachableBehindCovering,
  expectCovering,
  expectCoveringFillsWindow,
  resizeUntilArranged,
} from "../../dashboard/tests/sidePanelWidthPage.ts";
import { phoneLaunchTouchViewport } from "../../dashboard/tests/touchLaunchPage.ts";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";
import {
  expectFittedInput,
  focusByTouch,
  noteTerminalTraffic,
  scrollByTouch,
} from "../../dashboard/tests/touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const title =
  "Continue the intended terminal session with a long title whose final words identify the work that should remain attached";

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} terminal input`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch continues the same session through covering, editing, reduced height, rotation and close/reopen", async ({
    page,
    dashboard,
  }) => {
    // Earlier sessions above it in Taken keep the Board scrolling behind the
    // covering panel, so the revealed card holds a real reading place (E3).
    for (const earlier of [1, 2, 3]) {
      await launched(dashboard, "open-dough", {
        identity: `SEED-901#earlier-${String(earlier)}`,
        title: `Earlier session ${String(earlier)}`,
      });
    }
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#continue-touch-terminal",
      title,
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const { banner, board } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const opener = sidebar.entry(title);
    const { sent, sizes } = noteTerminalTraffic(page);
    await tapWhereShown(opener);
    const panel = terminalPanel(page);
    const { rows } = terminalScreenParts(panel);
    const control = (label: string) => frameControl(panel, label);
    const attaches = () => dashboard.claudeAttaches();
    const assertIdentity = async (count = 1) => {
      await expect(panel.locator(".side-panel-names p")).toHaveText(
        "Execution session",
      );
      await expect(panel.locator(".side-panel-names code")).toHaveCount(0);
      expect(attaches()).toHaveLength(count);
      expect(attaches().every(({ id }) => id === native.shortId)).toBe(true);
      // The three earlier sessions and this one; nothing launches again.
      expect(dashboard.claudeLaunchCalls()).toHaveLength(4);
      expect(dashboard.claudeStopCalls()).toEqual([]);
    };
    await expectTerminalText(panel, `attached ${native.shortId}`);
    await expectTerminalText(panel, "Claude Code");
    await expectCoveringFillsWindow(panel, { banner, board });
    // Reveal may move the Board; Close must return that same place (E3),
    // read once Taken, holding the session's card, rests in view.
    await expectRowRestsShowing(page, "Taken");
    const scrollWhileCovering = await scrollYOf(page);
    expect(scrollWhileCovering).toBeGreaterThan(0);
    await expect(control("Mark as done")).toBeVisible();
    await expect(control("Close")).toBeVisible();
    await expectBoardUnreachableBehindCovering(panel, board);
    const heading = panel.getByRole("heading", { level: 2, name: title });
    const titleToggle = panel.getByRole("button", { name: title, exact: true });
    await expect(heading).toHaveAccessibleName(title);
    await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
    // The banner keeps its place behind the covering panel.
    await expectTopBarsShareHeight(page, 2);
    await expectTitleOnOneCutLine(titleToggle);
    if (name === "phone") {
      await tapWhereShown(titleToggle);
      await expect(titleToggle).toHaveAttribute("aria-expanded", "true");
      await expect(heading).toHaveAccessibleName(title);
      await expectTitleWrapped(titleToggle);
      await tapWhereShown(titleToggle);
      await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
      await expect(heading).toHaveAccessibleName(title);
    }
    await expectFittedInput(panel, sizes);
    await focusByTouch(panel);
    await insertTerminalText(page, "carry onX");
    await pressTerminalKey(page, "Backspace");
    await insertTerminalText(page, " please");

    await test.step("a moderately reduced height keeps fitted input", async () => {
      await page.setViewportSize({ width: portrait.width, height: 400 });
      await expectCovering(panel);
      await expect(control("Close")).toBeVisible();
      await expectFittedInput(panel, sizes);
      await focusByTouch(panel);
      await assertIdentity();
    });

    await test.step("reducing visible height retains the input, fitted output and pinned controls without another attachment", async () => {
      await page.setViewportSize({ width: portrait.width, height: 240 });
      await expectCovering(panel);
      await expectFittedInput(panel, sizes);
      await focusByTouch(panel);
      await pressTerminalKey(page, "Enter");
      await expect
        .poll(() => attaches()[0]?.lines)
        .toEqual(["carry on please"]);
      expect(sent.join("")).toBe("carry onX\u007f please\r");
      await expectTerminalText(panel, "echo carry on please");
      if (name === "phone") {
        await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
        await expect(heading).toHaveAccessibleName(title);
        await expect(control("Close")).toBeVisible();
        await expectTitleOnOneCutLine(titleToggle);
      }
      await assertIdentity();
      expect((await box(panel)).height).toBeCloseTo(240, 0);
    });

    await test.step("touch scroll reads earlier PTY output and returns to the input without hiding the controls", async () => {
      await focusByTouch(panel);
      for (let line = 0; line < 12; line += 1) {
        await typeLine(page, `output ${line}`);
      }
      await expectTerminalText(panel, "echo output 11");
      await expect
        .poll(() => attaches()[0]?.lines.slice(-12))
        .toEqual(Array.from(Array(12).keys(), (line) => `output ${line}`));
      const viewport = panel.locator(".xterm-scrollable-element");
      const bottom = await rows.textContent();
      const inputBeforeScroll = [...sent];
      const linesBeforeScroll = attaches()[0]?.lines;
      await scrollByTouch(page, viewport, 100);
      await expect.poll(() => rows.textContent()).not.toBe(bottom);
      await expectTerminalText(panel, /echo output [0-9]/);
      await expectNoTerminalText(panel, "echo output 11");
      await scrollByTouch(page, viewport, -300);
      await expectTerminalText(panel, "echo output 11");
      expect(sent).toEqual(inputBeforeScroll);
      expect(attaches()[0]?.lines).toEqual(linesBeforeScroll);
      await assertIdentity();
      await focusByTouch(panel);
      await typeLine(page, "after scrolling");
      await expectTerminalText(panel, "echo after scrolling");
      await assertIdentity();
    });

    await test.step("landscape and portrait keep the same attachment and support more input", async () => {
      for (const view of [landscape, portrait]) {
        await resizeUntilArranged(panel, view);
        // Portrait (≤800) covers; phone landscape (844) has a usable split.
        if (view.width <= 800) await expectCovering(panel);
        else await expect(control("Maximize")).toBeVisible();
        await expect(control("Close")).toBeVisible();
        await expectFittedInput(panel, sizes);
        await focusByTouch(panel);
        await typeLine(page, `follow up ${view.width}`);
        await expectTerminalText(panel, `echo follow up ${view.width}`);
        await assertIdentity();
      }
    });

    await test.step("Close detaches only; Board scroll returns; reopening targets that same native session", async () => {
      await closeSidePanel(panel, { using: "touch" });
      await expect(panel).toHaveCount(0);
      await expect(sidebar.button).toBeFocused();
      await expect(banner).toBeVisible();
      await expect(board).toBeVisible();
      expect(await scrollYOf(page)).toBe(scrollWhileCovering);
      await expect.poll(() => attaches()[0]?.endedBy).toBe("SIGHUP");
      await expect
        .poll(() => processRunning(attaches()[0]?.pid ?? 0))
        .toBe(false);
      const record = (
        (await recordsOf(dashboard, "open-dough")) as LaunchRecord[]
      ).find(({ session }) => session.sessionId === native.sessionId);
      expect(record).toMatchObject({
        session: { sessionId: native.sessionId },
        sessionState: { kind: "available" },
      });
      expect(record).not.toHaveProperty("doneAt");
      await tapWhereShown(sidebar.button);
      await tapWhereShown(opener);
      await expectTerminalText(panel, `attached ${native.shortId}`);
      await expectCovering(panel);
      await expectFittedInput(panel, sizes);
      await focusByTouch(panel);
      await typeLine(page, "same session reopened");
      await expectTerminalText(panel, "echo same session reopened");
      await assertIdentity(2);
      expect(attaches()[1]?.lines).toEqual(["same session reopened"]);
    });
  });
});
