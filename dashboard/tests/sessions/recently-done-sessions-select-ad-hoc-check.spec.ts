// Ad hoc completed-story association check, retry, and supersession
// (../../src/recentlyDoneSelection.ts): hold or fail the association read;
// a later row choice abandons it so a late answer moves nothing. Story-catalog
// check/supersede coverage remains in ./recently-done-sessions-select-check.spec.ts
// and ./recently-done-sessions-select-supersede.spec.ts.
import {
  expect,
  queuedCodexPreviewTest as test,
} from "../support/preparationPage.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import { showRecentlyDone } from "../recentlyDoneSessionsSidebarPage.ts";
import { completedStoryAssociationEndpoint } from "../../src/completedStoryAssociation.ts";
import { retainAdHocCompletedStory } from "../support/adHocCompletedAssociation.ts";
import { choiceStatus } from "../recentlyDoneSelectionJourney.ts";
import { storyTitle } from "../support/intentStoryPage.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { git } from "../support/storyReviewWorktree.ts";
import { holdNextReads, routeNextReads } from "../nextActionReads.ts";
import { randomUUID } from "node:crypto";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const linkedTitle = "Ad hoc association check";
const otherTitle = "Other done session";

const isAssociation = (url: URL) =>
  url.pathname.endsWith(completedStoryAssociationEndpoint) ||
  url.pathname.includes(completedStoryAssociationEndpoint);

test("an unanswered ad hoc association is superseded by another row, and a failed one retries without moving the story", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  publishIntentTrunk(origin.project);
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: linkedTitle,
  });
  const other = makeMe.aLaunchRecord
    .adHoc({ instruction: otherTitle, title: otherTitle })
    .reportingThrough({
      origin: dashboard.origin,
      reference: randomUUID(),
      command: "report",
    })
    .markedDone()
    .launchedAt(new Date(Date.now() - 30_000).toISOString())
    .please();
  keepLaunchRecords(dashboard, [linked.record, other]);
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });

  // The shown ad hoc rows' recurring association read waits for page time.
  await pausePageClockAt(page, new Date());
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?perspective=intent");
  const { intentChoice, intent } = parts(page);
  const shown = await showRecentlyDone(page);
  const linkedRow = shown.row(linkedTitle);

  await test.step("while the association is held the row says checking; choosing another row abandons it", async () => {
    const held = await holdNextReads(page, isAssociation);
    const abandoned = page.waitForEvent("requestfailed", (request) =>
      isAssociation(new URL(request.url())),
    );
    try {
      await shown.select(linkedTitle).click();
      await held.asked;
      await expect(choiceStatus(linkedRow)).toHaveText(
        "Checking for its published done story…",
      );
      await shown.select(otherTitle).click();
      await abandoned;
    } finally {
      held.release();
    }
    await expect(shown.select(otherTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.select(linkedTitle)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(choiceStatus(linkedRow)).toHaveCount(0);
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await page.unrouteAll({ behavior: "wait" });
  });

  await test.step("a failed association says unknown apart from a miss; selecting again links", async () => {
    await routeNextReads(page, isAssociation, (route) =>
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "GitHub could not be reached." }),
      }),
    );
    const failed = page.waitForResponse(
      (response) =>
        isAssociation(new URL(response.url())) &&
        response.request().method() === "GET",
    );
    await shown.select(linkedTitle).click();
    await failed;
    await expect(choiceStatus(linkedRow)).toContainText(
      "Its published done story could not be checked.",
    );
    await expect(choiceStatus(linkedRow)).toContainText(
      "Select again to check again.",
    );
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await page.unrouteAll({ behavior: "wait" });

    const recovered = page.waitForResponse(
      (response) =>
        isAssociation(new URL(response.url())) &&
        response.request().method() === "GET" &&
        response.ok(),
    );
    await shown.select(linkedTitle).click();
    await recovered;
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await expect(storyTitle(intent)).toHaveText(linked.title, {
      timeout: 30_000,
    });
    await expect(choiceStatus(linkedRow)).toHaveCount(0);
  });
});
