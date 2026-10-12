// Touch, editing and fitting use the ordinary page/xterm/WebSocket/PTY path.
// The native stand-in supplies a composer, edited input and harmless replies.
import { expect, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import {
  publishStoryStagesJourney,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { box, tapWhereShown } from "./pageLayout.ts";
import { launchTouchViewports } from "./touchLaunchPage.ts";
import { processRunning } from "./support/processGroup.ts";
import {
  expectFittedInput,
  focusByTouch,
  noteTerminalTraffic,
  scrollByTouch,
  titleWordsShown,
} from "./touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());

const title =
  "Continue the intended terminal session with a long title whose final words identify the work that should remain attached";

for (const { name, portrait, landscape } of launchTouchViewports) {
  test.describe(`${name} terminal input`, () => {
    test.use({ viewport: portrait, hasTouch: true });
    test("touch continues the same session through editing, reduced height, rotation, maximize and close/reopen", async ({
      page,
      dashboard,
    }) => {
      const native = await launched(dashboard, "open-dough", {
        identity: "SEED-901#continue-touch-terminal",
        title,
      });
      const opened = await openStoryStagesJourney(page, journey);
      await opened.settled();
      const sidebar = sidebarParts(page);
      await tapWhereShown(sidebar.button);
      const opener = sidebar.entry(title);
      const { sent, sizes } = noteTerminalTraffic(page);
      await tapWhereShown(opener);
      const panel = page.getByRole("region", { name: "Terminal" });
      const rows = panel.locator(".xterm-rows");
      const control = (label: string) =>
        panel.getByRole("button", { name: label, exact: true });
      const attaches = () => dashboard.claudeAttaches();
      const assertIdentity = async (count = 1) => {
        await expect(panel.locator(".side-panel-names code")).toHaveText(
          native.sessionId,
        );
        expect(attaches()).toHaveLength(count);
        expect(attaches().every(({ id }) => id === native.shortId)).toBe(true);
        expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
        expect(dashboard.claudeStopCalls()).toEqual([]);
      };
      // Session navigation reveals its ordinary page entry. Scroll the
      // stacked content back into view before reading or using its terminal.
      await panel.scrollIntoViewIfNeeded();
      await expect(rows).toContainText(`attached ${native.shortId}`);
      await expect(rows).toContainText("Claude Code");
      const heading = panel.getByRole("heading", { level: 2 });
      await expect(heading).toHaveText(title);
      expect(await titleWordsShown(heading, 0, title.length)).toBe(true);
      await expectFittedInput(panel, sizes);
      await focusByTouch(panel);
      await page.keyboard.type("carry onX");
      await page.keyboard.press("Backspace");
      await page.keyboard.type(" please");

      await test.step("reducing visible height retains the input, fitted output and pinned controls without another attachment", async () => {
        await page.setViewportSize({ width: portrait.width, height: 240 });
        await expectFittedInput(panel, sizes);
        await focusByTouch(panel);
        await page.keyboard.press("Enter");
        await expect
          .poll(() => attaches()[0]?.lines)
          .toEqual(["carry on please"]);
        expect(sent.join("")).toBe("carry onX\u007f please\r");
        await expect(rows).toContainText("echo carry on please");
        const identity = panel.locator(".terminal-identity");
        if (name === "phone") {
          expect(
            await identity.evaluate(
              (element) => element.scrollHeight > element.clientHeight,
            ),
          ).toBe(true);
          expect(await titleWordsShown(heading, 0, 28)).toBe(true);
          const headerSwipe = -(await box(identity)).height;
          await scrollByTouch(page, identity, headerSwipe);
          await expect
            .poll(() =>
              titleWordsShown(heading, title.length - 20, title.length),
            )
            .toBe(true);
          // Wrapped native identities can occupy another reading position
          // than the title ending. Read both through the same header scroll.
          await scrollByTouch(page, identity, headerSwipe);
          const session = panel.locator(".side-panel-names code");
          await expect(session).toBeInViewport({ ratio: 1 });
          expect(
            await session.evaluate((element) => {
              const identity = element
                .closest(".terminal-identity")
                ?.getBoundingClientRect();
              const shown = element.getBoundingClientRect();
              return (
                identity !== undefined &&
                shown.top >= identity.top &&
                shown.bottom <= identity.bottom + 1
              );
            }),
          ).toBe(true);
        }
        await assertIdentity();
        await tapWhereShown(control("Maximize"));
        await expectFittedInput(panel, sizes);
        expect((await box(panel)).height).toBeCloseTo(240, 0);
        await tapWhereShown(control("Restore"));
        await expectFittedInput(panel, sizes);
        await assertIdentity();
      });

      await test.step("touch scroll reads earlier PTY output and returns to the input without hiding the controls", async () => {
        await focusByTouch(panel);
        for (let line = 0; line < 12; line += 1) {
          await page.keyboard.type(`output ${line}`);
          await page.keyboard.press("Enter");
        }
        await expect(rows).toContainText("echo output 11");
        await expect
          .poll(() => attaches()[0]?.lines.slice(-12))
          .toEqual(Array.from(Array(12).keys(), (line) => `output ${line}`));
        const viewport = panel.locator(".xterm-scrollable-element");
        const bottom = await rows.textContent();
        const inputBeforeScroll = [...sent];
        const linesBeforeScroll = attaches()[0]?.lines;
        await scrollByTouch(page, viewport, 100);
        await expect.poll(() => rows.textContent()).not.toBe(bottom);
        await expect(rows).toContainText(/echo output [0-9]/);
        await expect(rows).not.toContainText("echo output 11");
        await scrollByTouch(page, viewport, -300);
        await expect(rows).toContainText("echo output 11");
        expect(sent).toEqual(inputBeforeScroll);
        expect(attaches()[0]?.lines).toEqual(linesBeforeScroll);
        await assertIdentity();
        await tapWhereShown(control("Maximize"));
        await expectFittedInput(panel, sizes);
        await tapWhereShown(control("Restore"));
        await expectFittedInput(panel, sizes);
        await focusByTouch(panel);
        await page.keyboard.type("after scrolling");
        await page.keyboard.press("Enter");
        await expect(rows).toContainText("echo after scrolling");
        await assertIdentity();
      });

      await test.step("landscape and portrait keep the same attachment and support more input", async () => {
        for (const view of [landscape, portrait]) {
          await page.setViewportSize(view);
          const resize = panel.getByRole("separator", { name: "Resize panel" });
          if (view.width > 800) await expect(resize).toBeVisible();
          else await expect(resize).toHaveCount(0);
          await expectFittedInput(panel, sizes);
          await focusByTouch(panel);
          await page.keyboard.type(`follow up ${view.width}`);
          await page.keyboard.press("Enter");
          await expect(rows).toContainText(`echo follow up ${view.width}`);
          await tapWhereShown(control("Maximize"));
          await expectFittedInput(panel, sizes);
          await tapWhereShown(control("Restore"));
          await expectFittedInput(panel, sizes);
          await assertIdentity();
        }
      });

      await test.step("Close detaches only; reopening targets that same native session", async () => {
        await tapWhereShown(control("Close"));
        await expect(panel).toHaveCount(0);
        await expect(sidebar.button).toBeFocused();
        await expect.poll(() => attaches()[0]?.endedBy).toBe("SIGHUP");
        await expect
          .poll(() => processRunning(attaches()[0]?.pid ?? 0))
          .toBe(false);
        const record = (await recordsOf(dashboard, "open-dough"))[0];
        expect(record).toMatchObject({
          session: { sessionId: native.sessionId },
          sessionState: { kind: "available" },
        });
        expect(record).not.toHaveProperty("doneAt");
        await tapWhereShown(sidebar.button);
        await tapWhereShown(opener);
        await panel.scrollIntoViewIfNeeded();
        await expect(rows).toContainText(`attached ${native.shortId}`);
        await expectFittedInput(panel, sizes);
        await focusByTouch(panel);
        await page.keyboard.type("same session reopened");
        await page.keyboard.press("Enter");
        await expect(rows).toContainText("echo same session reopened");
        await assertIdentity(2);
        expect(attaches()[1]?.lines).toEqual(["same session reopened"]);
      });
    });
  });
}
