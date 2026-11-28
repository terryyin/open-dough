import { holdAuthenticatedReadsWhere } from "../../dashboard/test-support/holdAuthenticatedReads.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import {
  passTimeUntilChecked,
  expectSteadyPace,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  chooseProject,
  shortRevision,
  expectDirectionOpensAcrossRow,
  openDirection,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { pathsRead } from "../../dashboard/test-support/publishedOrigin.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { doughnutRepository } from "../../dashboard/test-support/doughnutProject.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectFocusedAndIndicated } from "../../dashboard/test-support/accessibleReading.ts";
import {
  givePageItsTurns,
  openUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";

const fullDirection = `Keep published work visible.

Read <img src=x onerror="document.title='direction ran'"> as text.
Finish with the complete final line.`;
const nextDirection = "The next published direction.";
const directionHistory = () =>
  makeMe.aRepository.withRevision("A", {
    backlog: { direction: fullDirection },
  });

const routedTrunk = (home: string, repository = defaultRepository) =>
  remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
    cwd: home,
    env: { HOME: home },
    maxBuffer: 4096,
  });

test("direction starts collapsed and opens by pointer and keyboard without reading again", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await publishMovingHistory(
    page,
    directionHistory().please(),
    "A",
    afterGitHubStops,
  );
  const { A: revisionA } = origin.revisions;
  await openUntilRead(page);
  const {
    direction,
    directionToggle,
    directionText: body,
    readRevision,
  } = parts(page);
  await expect(readRevision).toContainText(shortRevision(revisionA));
  await expect(directionToggle).toBeVisible();
  await expect(body).toBeHidden();
  await expect(direction.locator("details")).not.toHaveAttribute("open");

  await openDirection(page);
  await expect(body).toHaveText(fullDirection);
  await expect(body).toHaveCSS("white-space", "pre-line");
  await expect(direction.locator("img, script")).toHaveCount(0);
  await expect(direction.locator("details")).toHaveAttribute("open", "");
  await directionToggle.click();
  await expect(body).toBeHidden();

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expectFocusedAndIndicated(page, directionToggle);
  await page.keyboard.press("Enter");
  await expect(body).toBeVisible();
  await page.keyboard.press("Space");
  await expect(body).toBeHidden();
  await expect(directionToggle).toBeFocused();
  expect(
    pathsRead(origin).filter((path) => path.includes("PRODUCT-BACKLOG")),
  ).toEqual([]);
});

test("the opened direction reads across the whole project actions row beneath Start session, which stays in place, and closing restores the row", async ({
  page,
  afterGitHubStops,
}) => {
  const {
    revisions: { A: revisionA },
  } = await publishMovingHistory(
    page,
    directionHistory().please(),
    "A",
    afterGitHubStops,
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await openUntilRead(page);
  const { directionText, directionToggle, projectActions, readRevision } =
    parts(page);
  await expect(readRevision).toContainText(shortRevision(revisionA));
  const closedHeight = (await projectActions.boundingBox())?.height;

  await expectDirectionOpensAcrossRow(page);
  await expect(directionText).toHaveText(fullDirection);

  await directionToggle.click();
  await expect(directionText).toBeHidden();
  expect((await projectActions.boundingBox())?.height).toBe(closedHeight);
});

test("same-project refresh retains expanded and collapsed choices through loading, replacement, and failure", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const origin = await publishMovingHistory(
    page,
    directionHistory()
      .withRevision("B", { backlog: { direction: nextDirection } })
      .please(),
    "A",
    afterGitHubStops,
  );
  const { A: revisionA, B: revisionB } = origin.revisions;
  expect(await routedTrunk(dashboard.home)).toBe(revisionA);
  await pausePageClock(page);
  await page.goto("/");
  const {
    directionText: body,
    directionToggle,
    reading,
    problem,
    readRevision,
  } = parts(page);
  await openDirection(page);
  await expect(readRevision).toContainText(shortRevision(revisionA));

  origin.advanceTo("B");
  const snapshot = await holdAuthenticatedReadsWhere(
    page,
    (params) => params.get("revision") === revisionB && params.size === 2,
    [],
  );
  expect(await routedTrunk(dashboard.home)).toBe(revisionB);
  await passTimeUntilChecked(page);
  await expect(reading).toBeVisible();
  await expect(body).toBeVisible();
  await expect(body).toHaveText(fullDirection);
  const restore = origin.disconnectGit();
  const heldAt = await page.evaluate(() => Date.now());
  const nextCheck = passTimeUntilChecked(page, 502);
  // The next check must let B's held read answer before passing page time;
  // otherwise its read deadline can arm detail recovery and suspend checks.
  await givePageItsTurns(page);
  expect(await page.evaluate(() => Date.now())).toBe(heldAt);
  await expect(reading).toBeVisible();
  await expect(problem).toHaveCount(0);
  snapshot.release();
  await expect(readRevision).toContainText(shortRevision(revisionB));
  await expect(body).toBeVisible();
  await expect(body).toHaveText(nextDirection);

  expectSteadyPace(await nextCheck);
  await expect(problem).toBeVisible();
  await expect(problem).toContainText(
    "Automatic checks continue every 15 seconds",
  );
  await expect(body).toBeVisible();
  await expect(body).toHaveText(nextDirection);
  await directionToggle.click();
  await passTimeUntilChecked(page, 502);
  await expect(problem).toBeVisible();
  await expect(body).toBeHidden();
  restore();
  origin.advanceTo("A");
  expect(await routedTrunk(dashboard.home)).toBe(revisionA);
  await passTimeUntilChecked(page);
  await expect(readRevision).toContainText(shortRevision(revisionA));
  await expect(body).toBeHidden();
  await expect(problem).toHaveCount(0);
  await openDirection(page);
  await expect(body).toHaveText(fullDirection);
});

test("changing projects removes previous direction while reading and starts each observation collapsed", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const origin = await publishMovingHistory(
    page,
    directionHistory().please(),
    "A",
    afterGitHubStops,
  );
  const doughnut = await publishMovingHistory(
    page,
    makeMe.aRepository.withRevision("doughnut", {}).please(),
    "doughnut",
    afterGitHubStops,
    doughnutRepository,
  );
  const { A: revisionA } = origin.revisions;
  const { doughnut: doughnutRevision } = doughnut.revisions;
  expect(await routedTrunk(dashboard.home)).toBe(revisionA);
  expect(await routedTrunk(dashboard.home, doughnutRepository)).toBe(
    doughnutRevision,
  );
  await page.goto("/");
  const { direction, directionText: body, reading, readRevision } = parts(page);
  await openDirection(page);

  const snapshot = await holdAuthenticatedReadsWhere(
    page,
    (params) => params.get("source") === "doughnut" && params.size === 1,
    [],
  );
  await chooseProject(page, "Doughnut");
  await expect(reading).toBeVisible();
  await expect(direction).toHaveCount(0);
  await expect(page.getByText(fullDirection)).toHaveCount(0);
  snapshot.release();
  await expect(readRevision).toContainText(shortRevision(doughnutRevision));
  await expect(body).toBeHidden();
  await expectDirectionOpensAcrossRow(page);
  await expect(body).toHaveText("No near-future direction is recorded.");
  expect(
    pathsRead(doughnut).filter((path) => path.includes("PRODUCT-BACKLOG")),
  ).toEqual([]);

  await chooseProject(page, "Open Dough");
  await expect(readRevision).toContainText(shortRevision(revisionA));
  await expect(body).toBeHidden();
  await openDirection(page);
  await expect(body).toHaveText(fullDirection);
  // Returning does not ask REST for the backlog the trunk already read.
  expect(
    pathsRead(origin).filter((path) => path.includes("PRODUCT-BACKLOG")),
  ).toEqual([]);
});
