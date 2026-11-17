import { expect, test } from "../dashboardTest.ts";
import { expectProjectChoice, chooseProject } from "../dashboardPage.ts";
import { expectRoute } from "../agentRosterRecords.ts";
import { noConnection } from "../publishedOrigin.ts";
import { recordReveals, revealsOf } from "../sessionNavigationJourney.ts";
import {
  expectNoCardFocused,
  expectNoHostActions,
  notificationOrigins,
  notifiedCard,
  notifiedIdentity,
  otherTitle,
  storyDestination,
  storyUrl,
  targetRevision,
} from "../notificationStoryJourney.ts";

test("an unknown project retains its requested target and explains how to return to configured projects", async ({
  page,
  dashboard,
}) => {
  await notificationOrigins(page);
  await page.goto(storyUrl("retired-project"));
  const target = storyDestination(page);
  await expect(target).toContainText(
    "Project retired-project is not configured",
  );
  await expect(target).toContainText(notifiedIdentity);
  expectRoute(page, { project: "retired-project" });
  await expectNoCardFocused(page);
  await target.getByRole("button", { name: "Show project stories" }).click();
  await expect(target).toHaveCount(0);
  expectRoute(page, { story: null });
  await expect(page.getByRole("article", { name: otherTitle })).toBeVisible();
  expectNoHostActions(dashboard);
});

test("an absent story is distinct from failed reading, and retry can resolve a failed target", async ({
  page,
  dashboard,
}) => {
  const { target } = await notificationOrigins(page);
  await page.goto(storyUrl("doughnut", "SEED-404#gone"));
  const destination = storyDestination(page);
  await expect(destination).toContainText(
    "is not listed in Doughnut's published work",
  );
  await expect(destination).toContainText("SEED-404#gone");
  await expectNoCardFocused(page);
  const restore = target.answerWith("main", noConnection);
  await page.goto(storyUrl());
  await expect(destination).toContainText("could not be read");
  await expect(destination).not.toContainText("is not listed");
  await expect(destination).toContainText(notifiedIdentity);
  restore();
  await destination
    .getByRole("button", { name: "Retry story destination" })
    .click();
  await expect(notifiedCard(page)).toBeFocused();
  await expect(destination).toHaveCount(0);
  expectNoHostActions(dashboard);
});

test("a project choice supersedes a pending story destination without a late reveal", async ({
  page,
  dashboard,
}) => {
  const { target } = await notificationOrigins(page);
  const release = target.hold(targetRevision);
  await recordReveals(page);
  await page.goto(storyUrl());
  await expect.poll(() => target.requests.length).toBeGreaterThan(1);
  await chooseProject(page, "Open Dough");
  await expect(page.getByRole("article", { name: otherTitle })).toBeVisible();
  release();
  await expectProjectChoice(page, "Open Dough");
  expectRoute(page, { story: null });
  expect(await revealsOf(page)).toEqual([]);
  await expect(notifiedCard(page)).toHaveCount(0);
  expectNoHostActions(dashboard);
});

test("ordinary project replacement in settings clears the pending story target before returning", async ({
  page,
  dashboard,
}) => {
  await notificationOrigins(page);
  await page.goto(storyUrl());
  await expect(notifiedCard(page)).toBeFocused();
  await page
    .getByRole("button", { name: "System settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove project Doughnut", exact: true })
    .click();
  const confirmation = page.getByRole("dialog", {
    name: "Remove Doughnut?",
    exact: true,
  });
  await confirmation
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await expect(confirmation).toBeHidden();
  expectRoute(page, { story: null });
  await page
    .getByRole("button", { name: "Back to dashboard", exact: true })
    .click();
  await expectProjectChoice(page, "Pygardon");
  await expect(storyDestination(page)).toHaveCount(0);
  expectRoute(page, { story: null });
  expectNoHostActions(dashboard);
});
