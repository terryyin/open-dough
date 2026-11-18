// A Sessions sidebar Session entry is one line: title cut with an ellipsis and
// elapsed launch age, against controlled machine answers and a paused page
// clock. Tooltip holds state, project, workflow and launch time.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  doughnutSource,
  openDoughSource,
} from "../../test-support/support/frontendServiceState.ts";
import { expectProjectChoice } from "../../test-support/dashboardPage.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { box } from "../../test-support/pageLayout.ts";
import {
  expectRowShows,
  expectSessionsSidebarSessionEntryShown,
  expectTooltipLine,
  sessionsSidebarDetailsOf,
  sessionsSidebarElapsedOf,
  sessionsSidebarParts,
} from "../../test-support/sessionsSidebarPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const shortWork = { identity: "SEED-901#short", title: "A short title" };
const longWork = {
  identity: "SEED-901#long",
  title: `A very long story title that cannot fit on one line of the narrow sidebar ${"and goes on ".repeat(8)}to its end`,
};

test("is one line of title and elapsed time, however long the title, with the rest in its tooltip", async ({
  page,
  frontendServices,
}) => {
  const launchedAt = new Date();
  await pausePageClockAt(page, launchedAt);
  Object.assign(frontendServices, {
    projects: [openDoughSource, doughnutSource],
  });
  const short = makeMe.aLaunchRecord
    .executing({
      identity: shortWork.identity,
      title: shortWork.title,
      source: "doughnut",
    })
    .inClaudeSession({ sessionId: "row-short" })
    .launchedAt(launchedAt.toISOString())
    .please();
  const long = makeMe.aLaunchRecord
    .executing({
      identity: longWork.identity,
      title: longWork.title,
      source: "doughnut",
    })
    .inClaudeSession({ sessionId: "row-long" })
    .launchedAt(launchedAt.toISOString())
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(short)
          .withSessionState(
            makeMe.aSessionState
              .loaded("waiting")
              .waitingFor("input needed")
              .please(),
          )
          .please(),
      )
      .observingOpen(long)
      .please(),
  );
  await page.goto("/?project=doughnut");
  await expectProjectChoice(page, "Doughnut");
  const { button, entries, entry } = sessionsSidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(2);
  const shortEntry = entries.nth(0);
  const longEntry = entries.nth(1);

  await test.step("its text is the title and the elapsed time alone", async () => {
    await expectRowShows(shortEntry, shortWork.title, "<1m");
    await expectRowShows(longEntry, longWork.title, "<1m");
    const { details, disclosure } = sessionsSidebarDetailsOf(shortEntry);
    await expect(details).toBeHidden();
    await expect(disclosure).toBeHidden();
    await expect(shortEntry.getByRole("button")).toHaveCount(1);
  });

  await test.step("its tooltip holds the state reading, project, workflow, and launch time", async () => {
    await expectTooltipLine(shortEntry, "Doughnut · Execution");
    await expectSessionsSidebarSessionEntryShown(
      shortEntry,
      "Needs input: input needed",
      "needs-input",
    );
    const launchedShown = await shortEntry
      .locator("time")
      .evaluate((time) =>
        new Date(time.getAttribute("datetime") ?? "").toLocaleString(),
      );
    await expectTooltipLine(shortEntry, `Launched ${launchedShown}`);
    await expect(entry(longWork.title)).toHaveCount(1);
  });

  await test.step("a long title stays on one line, cut with an ellipsis, beside its elapsed time", async () => {
    const title = longEntry.getByRole("heading", { level: 3 });
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
    expect((await box(longEntry)).height).toBe((await box(shortEntry)).height);
    const elapsed = await box(sessionsSidebarElapsedOf(longEntry));
    const row = await box(longEntry);
    expect(elapsed.x + elapsed.width).toBeLessThanOrEqual(row.x + row.width);
    expect(elapsed.y).toBeGreaterThanOrEqual(row.y);
    expect(elapsed.y + elapsed.height).toBeLessThanOrEqual(row.y + row.height);
  });

  await test.step("the elapsed time is the largest whole unit, and advances on the 30 second tick", async () => {
    const at = Date.parse(
      (await shortEntry.locator("time").getAttribute("datetime")) ?? "",
    );
    const tickAt = async (afterLaunchMs: number) => {
      await page.clock.setSystemTime(at + afterLaunchMs);
      await page.clock.runFor(30_000);
    };
    const second = 1_000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const elapsed = sessionsSidebarElapsedOf(shortEntry);

    await tickAt(20 * second);
    await expect(elapsed).toHaveText("<1m");
    await page.clock.setSystemTime(at + 80 * second);
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
      await expect(elapsed).toHaveText(words);
      await expect(sessionsSidebarElapsedOf(longEntry)).toHaveText(words);
    }
  });
});
