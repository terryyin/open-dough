// An empty dashboard recovers from eligible temporary GitHub failures on its
// own: a visible page says when it will read again, waits 15, 30, 60, then 60
// seconds after settlement, and obtains membership when GitHub answers. The
// page, local boundary, and `gh` invocation are the production ones; only
// GitHub's answers are supplied. Page time is paused. Access and other
// non-retry cases live in ./transient-read-exclusions.spec.ts.

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  expectWholeSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  httpErrorAnswer,
  noConnection,
  pathsRead,
  publishMovingOrigin,
  type ObservedRequest,
} from "./publishedOrigin.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import {
  backlogA,
  inspectDashboardStory,
  revisionA,
  titlesOfA,
} from "./refreshJourney.ts";
import { failedAt } from "./limitNotice.ts";
import { headsChecks } from "./autoRefreshJourney.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");
const transientRecovery = "This page reads the published work at";

function mainReads(origin: {
  readonly requests: readonly ObservedRequest[];
}): number {
  return pathsRead(origin).filter((path) => path === "main").length;
}

async function expectRecoversAfter(
  page: Parameters<typeof parts>[0],
  failedMs: number,
  waitSeconds: number,
): Promise<void> {
  const notice = parts(page).problem.locator("p", {
    hasText: transientRecovery,
  });
  await expect(notice).toHaveCount(1);
  expect(
    Date.parse((await notice.locator("time").getAttribute("datetime")) ?? ""),
  ).toBe(failedMs + waitSeconds * 1_000);
}

test("an empty page's continuing 503s wait 15, then 30, then 60, then 60 seconds after settlement, and a later answer publishes membership without reload", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const restore = origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(mainReads(origin)).toBe(1);
  await expectRecoversAfter(page, await failedAt(page), 15);

  await test.step("the second attempt is not asked before 15 seconds", async () => {
    await page.clock.runFor(14_000);
    expect(mainReads(origin)).toBe(1);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(mainReads(origin)).toBe(2);
    await expectProblemAndNoSnapshot(
      page,
      "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
      undefined,
      transientRecovery,
    );
    await expectRecoversAfter(page, await failedAt(page), 30);
  });

  await test.step("the third attempt waits 30 seconds, then 60, then 60", async () => {
    await page.clock.runFor(29_000);
    expect(mainReads(origin)).toBe(2);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(mainReads(origin)).toBe(3);
    await expectRecoversAfter(page, await failedAt(page), 60);

    await page.clock.runFor(59_000);
    expect(mainReads(origin)).toBe(3);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(mainReads(origin)).toBe(4);
    await expectRecoversAfter(page, await failedAt(page), 60);
  });

  await test.step("GitHub's later answer is read on its own and membership is shown", async () => {
    restore();
    await page.clock.runFor(61_250);
    await untilPageReadsAnswered(page);
    await inspectDashboardStory(page);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [],
    );
    await expect(parts(page).problem).toHaveCount(0);
  });
});

test("a pinned backlog's eligible failure recovers on its own; a later successful ref does not reset that wait", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const restoreBacklog = origin.answerWith(revisionA, httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    `GitHub answered HTTP 503 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${revisionA}.`,
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(mainReads(origin)).toBe(1);

  await test.step("the next attempt is asked after 15 seconds, the ref answers, and the backlog still fails", async () => {
    await page.clock.runFor(15_250);
    await untilPageReadsAnswered(page);
    expect(mainReads(origin)).toBe(2);
    await expectProblemAndNoSnapshot(
      page,
      `GitHub answered HTTP 503 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${revisionA}.`,
      undefined,
      transientRecovery,
    );
    await expectRecoversAfter(page, await failedAt(page), 30);
  });

  await test.step("the unresolved backlog wait stays 30 seconds despite the successful ref", async () => {
    await page.clock.runFor(14_000);
    expect(mainReads(origin)).toBe(2);
    await page.clock.runFor(1_250);
    expect(mainReads(origin)).toBe(2);
    restoreBacklog();
    await page.clock.runFor(15_000);
    await untilPageReadsAnswered(page);
    await inspectDashboardStory(page);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [],
    );
    expect(mainReads(origin)).toBe(3);
  });
});

test("a lost connection is recovered on its own at the first wait", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const reconnect = origin.answerWith("main", noConnection);
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "The local GitHub CLI could not reach GitHub while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  reconnect();
  await page.clock.runFor(15_250);
  await untilPageReadsAnswered(page);
  await inspectDashboardStory(page);
  await expectWholeSnapshot(
    page,
    { revision: revisionA, titles: titlesOfA },
    [],
  );
});

test("a stalled read at the wait bound recovers on its own without a reload", async ({
  page,
}) => {
  await page.clock.install({ time: opened });
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const releaseRef = origin.hold("main");
  await page.goto("/");
  const { problem, status } = parts(page);
  await expect(status).toHaveText("Reading published work…");
  await expect.poll(() => pathsRead(origin)).toEqual(["main"]);
  await page.clock.pauseAt(new Date(opened.getTime() + 5_000));

  await test.step("before the bound the read is still awaited", async () => {
    await page.clock.runFor(20_000);
    await expect(status).toHaveText("Reading published work…");
    await expect(problem).toHaveCount(0);
  });

  await test.step("at the bound the wait ends as a read problem that says when it will read again", async () => {
    await page.clock.runFor(10_000);
    await expectProblemAndNoSnapshot(
      page,
      "GitHub did not answer within 30 seconds, so the read was given up.",
      undefined,
      transientRecovery,
    );
  });

  await test.step("the late first answer publishes nothing; the next read is asked after settlement", async () => {
    const failed = await failedAt(page);
    const recoversAt = failed + 15_000;
    expect(
      Date.parse(
        (await problem
          .locator("p", { hasText: transientRecovery })
          .locator("time")
          .getAttribute("datetime")) ?? "",
      ),
    ).toBe(recoversAt);
    releaseRef();
    const remaining = recoversAt - (await page.evaluate(() => Date.now()));
    await page.clock.runFor(Math.max(0, remaining - 1_000));
    expect(pathsRead(origin)).toEqual(["main"]);
    expect(headsChecks(githubFor(page).calls)).toEqual([]);
    await expect(problem).toBeVisible();
  });

  await test.step("the recovery read publishes the first snapshot without a reload", async () => {
    await page.clock.runFor(1_250);
    await inspectDashboardStory(page);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [],
    );
    await expect(problem).toHaveCount(0);
    expect(pathsRead(origin)).toEqual([
      "main",
      "main",
      `PRODUCT-BACKLOG.md?ref=${revisionA}`,
    ]);
  });
});
