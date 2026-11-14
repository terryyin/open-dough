import { expect, test } from "../dashboardTest.ts";
import { expectProjectChoice, chooseProject } from "../dashboardPage.ts";
import {
  expectRoute,
  publishRosterOrigins,
  takenIdentity,
  takenStory,
} from "../agentRosterRecords.ts";
import { noConnection } from "../publishedOrigin.ts";
import { recordReveals, revealsOf } from "../sessionNavigationJourney.ts";
import {
  expectArrivedAt,
  expectKeyboardWithin,
  expectNoCardFocused,
  expectNoHostActions,
  notificationOrigins,
  notifiedCard,
  notifiedIdentity,
  notifiedTitle,
  otherTitle,
  storyDestination,
  storyUrl,
  targetRevision,
} from "../notificationStoryJourney.ts";
import { pausePageClock } from "../autoRefreshJourney.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expectCueEnds, expectDestinationCue } from "../destinationCue.ts";

test("cold story URL waits for the named project's data, then reveals and focuses its encoded identity", async ({
  page,
  dashboard,
}) => {
  const { other, target } = await notificationOrigins(page);
  const release = target.hold(targetRevision);
  await recordReveals(page);
  await page.goto(storyUrl());
  const card = notifiedCard(page);
  await expectProjectChoice(page, "Doughnut");
  await expect.poll(() => target.requests.length).toBeGreaterThan(1);
  expect(await revealsOf(page)).toEqual([]);
  await expect(card).toHaveCount(0);
  expect(other.requests).toEqual([]);
  release();
  await expectArrivedAt(card);
  await expect(page.getByRole("article", { name: otherTitle })).toHaveCount(0);
  expectRoute(page, { story: notifiedIdentity });
  expect(new URL(page.url()).hash).toBe("");
  await page.keyboard.press("Tab");
  await expectKeyboardWithin(card);
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  const beforeOwnMove = (await revealsOf(page)).length;
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(card.getByRole("button", { name: "Hide detail" })).toBeVisible();
  // Observe layout/ResizeObserver after the developer's own move expands
  // the card; the URL's keeper must not scroll it back into place.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      }),
  );
  expect(await revealsOf(page)).toHaveLength(beforeOwnMove);
  expectNoHostActions(dashboard);
});

test("reload, direct open, and history preserve story targeting while ordinary project choices clear it", async ({
  page,
  dashboard,
}) => {
  await pausePageClock(page);
  await notificationOrigins(page, "Taken");
  await page.goto(storyUrl());
  const card = notifiedCard(page);
  await expect(card).toBeFocused();
  await expectDestinationCue(page, card, { motion: true });
  await expectSelected(card, false);
  await expectCueEnds(page, card);
  await page.reload();
  await expectArrivedAt(card);
  await chooseProject(page, "Open Dough");
  await expect(page.getByRole("article", { name: otherTitle })).toBeVisible();
  expectRoute(page, { story: null });
  await page.goBack();
  await expect(card).toBeFocused();
  await expectDestinationCue(page, card, { motion: true });
  await expectCueEnds(page, card);
  expectRoute(page, { story: notifiedIdentity });
  await page.goForward();
  await expect(page.getByRole("article", { name: otherTitle })).toBeVisible();
  expectRoute(page, { story: null });
  expectNoHostActions(dashboard);
});

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

test("a target in a hidden column is revealed with reduced motion and useful keyboard focus", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 650, height: 750 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await notificationOrigins(page, "Taken");
  await recordReveals(page);
  await page.goto(storyUrl());
  const card = notifiedCard(page);
  await expectArrivedAt(card);
  await expect(page.locator(".board-row")).toHaveAttribute(
    "data-hidden",
    "1 3",
  );
  expect(
    (await revealsOf(page)).filter(({ name }) => name === notifiedTitle),
  ).toContainEqual({ name: notifiedTitle, behavior: "auto" });
  expectNoHostActions(dashboard);
});

test("opening the roster leaves a same-project story target and Back restores that target", async ({
  page,
  dashboard,
}) => {
  await publishRosterOrigins(page);
  await page.goto(storyUrl("open-dough", takenIdentity));
  const card = page.getByRole("article", { name: takenStory, exact: true });
  await expect(card).toBeFocused();
  await card
    .getByRole("button", { name: "Show Akiho-chan in the agent roster" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Agent roster" }),
  ).toBeVisible();
  expectRoute(page, { story: null });
  await page.goBack();
  await expect(card).toBeInViewport({ ratio: 0.99 });
  expectRoute(page, { story: takenIdentity });
  await expectKeyboardWithin(card);
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
