// Older answers cannot replace the current row context or a saved review.
import { expect, test, pausePageClockAt } from "../dashboardTest.ts";
import { linked, openSelectionPage } from "../recentlyDoneSelectionJourney.ts";
import { expectSessionReviewCue } from "../recentlyDoneSessionsSidebarPage.ts";
import { completedStoryAssociationEndpoint } from "../../src/completedStoryAssociation.ts";
import { storyReviewStateEndpoint } from "../../src/storyReviewState.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { givePageItsTurns } from "../pageRequestNotes.ts";
import { chooseProject, expectProjectChoice } from "../projectChoice.ts";
import {
  doneCard,
  expectReviewed,
  markAsReviewed,
} from "../recentlyDoneReviewState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../support/launchStore.ts";
import { showColumn } from "../boardPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("pending local review evidence stays unknown and its pre-save answer cannot restore a cleared cue", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, new Date());
  let release = () => {};
  let asked = () => {};
  let received = new Promise<void>((resolve) => {
    asked = resolve;
  });
  let pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  releases.push(release);
  const matches = (url: URL) =>
    url.pathname === storyReviewStateEndpoint &&
    url.searchParams.get("id") === "pygardon";
  await page.route(matches, async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    asked();
    await pending;
    await route.fulfill({ json: { reviewed: [] } });
  });
  const { shown, row } = await openSelectionPage(page, dashboard);
  await received;
  await expectSessionReviewCue(row(linked.title), false);
  await expect(shown.select(linked.title)).toBeEnabled();
  const answered = page.waitForResponse((response) =>
    matches(new URL(response.url())),
  );
  release();
  await answered;
  await expectSessionReviewCue(row(linked.title), true);

  received = new Promise<void>((resolve) => {
    asked = resolve;
  });
  pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  releases.push(release);
  await page.clock.runFor(checkIntervalMs);
  await received;
  await chooseProject(page, "Pygardon");
  await showColumn(page, "Recently done");
  const card = doneCard(page, linked.title);
  await expectReviewed(card, false);
  await markAsReviewed(card).click();
  await expectReviewed(card, true);
  await expectSessionReviewCue(row(linked.title), false);
  const stale = page.waitForResponse(
    (response) =>
      matches(new URL(response.url())) && response.request().method() === "GET",
  );
  release();
  await stale;
  await givePageItsTurns(page);
  await expectReviewed(card, true);
  await expectSessionReviewCue(row(linked.title), false);
});

for (const replacement of ["project", "association"] as const) {
  test(`an obsolete association cannot warn the row after its ${replacement} changes`, async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    let asked = () => {};
    let release = () => {};
    const received = new Promise<void>((resolve) => {
      asked = resolve;
    });
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    releases.push(release);
    let calls = 0;
    const matches = (url: URL) =>
      url.pathname === completedStoryAssociationEndpoint &&
      url.searchParams.get("session") === "obsolete-association";
    await page.route(matches, async (route) => {
      calls += 1;
      if (calls !== 1) return route.fulfill({ json: { kind: "absent" } });
      asked();
      await pending;
      await route
        .fulfill({ json: { kind: "linked", identity: linked.identity } })
        .catch(() => undefined);
    });
    // Open the maintained three-project fixture, then replace its rows with
    // one retained session whose server-held association context changes.
    const { shown } = await openSelectionPage(page, dashboard);
    const title = "Session whose association context changes";
    const record = (source: string, reference: string) =>
      makeMe.aLaunchRecord
        .adHoc({ source, title, instruction: title })
        .inClaudeSession({
          sessionId: "obsolete-association",
          shortId: "obsolete",
        })
        .reportingThrough({
          origin: dashboard.origin,
          reference,
          command: "report",
        })
        .launchedAt(new Date(Date.now() - 60_000).toISOString())
        .markedDoneAt(new Date().toISOString())
        .please();
    keepLaunchStore(dashboard, {
      doughnut: [record("doughnut", "b0f19431-05f1-4dc1-b9a4-a492109bd064")],
    });
    await page.clock.runFor(checkIntervalMs);
    await received;
    await expectSessionReviewCue(shown.row(title), false);
    const abandoned = page.waitForEvent("requestfailed", (request) =>
      matches(new URL(request.url())),
    );
    const source = replacement === "project" ? "pygardon" : "doughnut";
    const current = page.waitForResponse(
      (response) => matches(new URL(response.url())) && response.ok(),
    );
    keepLaunchStore(dashboard, {
      [source]: [record(source, "0143a334-a46a-4faf-981b-a80c80f7cafe")],
    });
    await page.clock.runFor(checkIntervalMs);
    await current;
    await abandoned;
    release();
    await givePageItsTurns(page);
    await expectSessionReviewCue(shown.row(title), false);
    await expect(shown.select(title)).toHaveAttribute(
      "title",
      replacement === "project" ? /Pygardon · Ad hoc/ : /Doughnut · Ad hoc/,
    );
    await expectProjectChoice(page, "Open Dough");
    expect(dashboard.claudeAttaches()).toEqual([]);
  });
}
