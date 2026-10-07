// A Sessions sidebar entry is one line: its story's title, cut with an
// ellipsis however long, and at its end how long ago its session was launched,
// by the largest whole unit (<1m, 5m, 2h, 3d), advancing on the page clock's
// 30 second tick. Its state words, project, workflow, and launch time are its
// tooltip, not the row's text. The page clock stands still unless the journey
// lets it pass; the sessions are launched through the boundary in Doughnut.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { box } from "./pageLayout.ts";
import {
  expectRowShows,
  expectSidebarSessionShown,
  expectTooltipLine,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  publishStoryStagesJourney,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const shortWork = { identity: "SEED-901#short", title: "A short title" };
const longWork = {
  identity: "SEED-901#long",
  title: `A very long story title that cannot fit on one line of the narrow sidebar ${"and goes on ".repeat(8)}to its end`,
};

test.describe("a Sessions sidebar entry", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("is one line of title and elapsed time, however long the title, with the rest in its tooltip", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    const { sessionId } = await launched(dashboard, "doughnut", shortWork);
    await launched(dashboard, "doughnut", longWork);
    dashboard.claudeSessionBecomes(sessionId, "blocked", "input needed");
    const { settled } = await openStoryStagesJourney(page, stagesJourney);
    const { button, entries, entry } = sidebarParts(page);
    await settled();
    await button.click();
    await expect(entries).toHaveCount(2);
    await passOnePace();
    const short = entries.nth(0);
    const long = entries.nth(1);

    await test.step("its text is the title and the elapsed time alone", async () => {
      await expectRowShows(short, shortWork.title, "<1m");
      await expectRowShows(long, longWork.title, "<1m");
      await expect(
        short.getByText(/Launched|Doughnut|Execution|input needed/),
      ).toHaveCount(0);
    });

    await test.step("its tooltip holds the state reading, project, workflow, and launch time", async () => {
      await expectTooltipLine(short, "Doughnut · Execution");
      await expectSidebarSessionShown(
        short,
        "Needs input: input needed",
        "needs-input",
      );
      const launchedAt = await short
        .locator("time")
        .evaluate((time) =>
          new Date(time.getAttribute("datetime") ?? "").toLocaleString(),
        );
      await expectTooltipLine(short, `Launched ${launchedAt}`);
      await expect(entry(longWork.title)).toHaveCount(1);
    });

    await test.step("a long title stays on one line, cut with an ellipsis, beside its elapsed time", async () => {
      const title = long.getByRole("heading", { level: 3 });
      await expect(title).toHaveCSS("white-space", "nowrap");
      await expect(title).toHaveCSS("text-overflow", "ellipsis");
      expect(
        await title.evaluate(
          (element) => element.scrollWidth > element.clientWidth,
        ),
      ).toBe(true);
      const lineHeight = await title.evaluate((element) =>
        parseFloat(getComputedStyle(element).lineHeight),
      );
      expect((await box(title)).height).toBeLessThanOrEqual(lineHeight + 1);
      expect((await box(long)).height).toBe((await box(short)).height);
      const elapsed = await box(long.locator(".sidebar-elapsed"));
      const row = await box(long);
      expect(elapsed.x + elapsed.width).toBeLessThanOrEqual(row.x + row.width);
      expect(elapsed.y).toBeGreaterThanOrEqual(row.y);
      expect(elapsed.y + elapsed.height).toBeLessThanOrEqual(
        row.y + row.height,
      );
    });

    await test.step("the elapsed time is the largest whole unit, and advances on the 30 second tick", async () => {
      const launchedAt = Date.parse(
        (await short.locator("time").getAttribute("datetime")) ?? "",
      );
      // A tick reads the clock somewhere in the 30 seconds it runs, so each
      // reading here stays in its unit throughout.
      const tickAt = async (afterLaunchMs: number) => {
        await page.clock.setSystemTime(launchedAt + afterLaunchMs);
        await page.clock.runFor(30_000);
      };
      const second = 1_000;
      const minute = 60 * second;
      const hour = 60 * minute;
      const elapsed = short.locator(".sidebar-elapsed");

      await tickAt(20 * second);
      await expect(elapsed).toHaveText("<1m");
      // Nothing changes until the next tick.
      await page.clock.setSystemTime(launchedAt + 80 * second);
      await expect(elapsed).toHaveText("<1m");
      await page.clock.runFor(30_000);
      await expect(elapsed).toHaveText("1m");
      for (const [afterLaunch, words] of [
        [5 * minute, "5m"],
        [2 * hour, "2h"],
        [26 * hour, "1d"],
        [3 * 24 * hour + hour, "3d"],
      ] as const) {
        await tickAt(afterLaunch);
        await expect(short.locator(".sidebar-elapsed")).toHaveText(words);
        await expect(long.locator(".sidebar-elapsed")).toHaveText(words);
      }
    });
  });
});
