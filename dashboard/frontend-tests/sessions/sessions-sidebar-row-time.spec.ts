// Retained built-app proof of open Sessions row elapsed age: largest whole
// unit, advancing on the 30 second tick. Slice 3 moves this onto the mount.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  doughnutSource,
  openDoughSource,
} from "../../test-support/support/frontendServiceState.ts";
import { expectProjectChoice } from "../../test-support/dashboardPage.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import {
  sessionsSidebarElapsedOf,
  sessionsSidebarParts,
} from "../../test-support/sessionsSidebarPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const shortWork = { identity: "SEED-901#short", title: "A short title" };
const longWork = {
  identity: "SEED-901#long",
  title: `A very long story title that cannot fit on one line of the narrow sidebar ${"and goes on ".repeat(8)}to its end`,
};

test("the elapsed time is the largest whole unit, and advances on the 30 second tick", async ({
  page,
  frontendServices,
}) => {
  const launchedAt = new Date();
  await test.step("open the Sessions sidebar with two same-age rows", async () => {
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
    const { button, entries } = sessionsSidebarParts(page);
    await button.click();
    await expect(entries).toHaveCount(2);
  });

  await test.step("age uses the largest whole unit and advances on the 30s tick", async () => {
    const { entries } = sessionsSidebarParts(page);
    const shortEntry = entries.nth(0);
    const longEntry = entries.nth(1);
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
