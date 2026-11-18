// A story URL names a project and a story identity. Opened cold, reloaded,
// reached through Back or Forward, or naming a card in a hidden column, the
// page waits for the named project's revision, then brings that project's card
// into view holding the keyboard, with the route kept; an ordinary project
// choice clears the target. Doughnut and Open Dough both tell the shared
// identity, so only the named project's card may be the destination. Nothing
// here launches or attaches an agent.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { countProjectReads } from "../../tests/support/frontendAuthenticatedReadControl.ts";
import { holdProjectReads } from "../../tests/holdAuthenticatedReads.ts";
import { recordHostRequests } from "../../tests/support/frontendHostRequests.ts";
import {
  answerSharedStoryProjects,
  publishRosterStory,
} from "../../tests/support/frontendStoryUrlDestination.ts";
import {
  doughnutSharedTitle,
  openDoughSharedTitle,
  sharedStoryIdentity,
} from "../../tests/projectSelectionProjects.ts";
import {
  chooseProject,
  expectProjectChoice,
} from "../../tests/dashboardPage.ts";
import {
  expectRoute,
  takenIdentity,
  takenStory,
} from "../../tests/agentRosterRecords.ts";
import {
  recordReveals,
  revealsOf,
} from "../../tests/sessionNavigationJourney.ts";
import {
  expectArrivedAt,
  expectKeyboardWithin,
  storyUrl,
} from "../../tests/notificationStoryJourney.ts";
import { pausePageClock } from "../../tests/autoRefreshJourney.ts";
import { expectSelected } from "../../tests/storyCardSelection.ts";
import {
  expectCueEnds,
  expectDestinationCue,
} from "../../tests/destinationCue.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  releases.splice(0).forEach((release) => {
    release();
  });
});

test("cold story URL waits for the named project's data, then reveals and focuses its encoded identity", async ({
  page,
  frontendServices,
}) => {
  await answerSharedStoryProjects(page, frontendServices);
  const held = await holdProjectReads(page, "doughnut", releases);
  const openDoughReads = countProjectReads(page, "open-dough");
  const hostRequests = recordHostRequests(page);
  await recordReveals(page);
  await page.goto(storyUrl());
  const card = page.getByRole("article", { name: doughnutSharedTitle });

  await test.step("while Doughnut's revision is held, nothing is revealed and Open Dough is not read", async () => {
    await expectProjectChoice(page, "Doughnut");
    await expect.poll(held.held).toBeGreaterThan(0);
    expect(await revealsOf(page)).toEqual([]);
    await expect(card).toHaveCount(0);
    expect(openDoughReads()).toBe(0);
  });

  await test.step("once answered, Doughnut's card holds the keyboard in view with the route kept", async () => {
    held.release();
    await expectArrivedAt(card);
    await expect(
      page.getByRole("article", { name: openDoughSharedTitle }),
    ).toHaveCount(0);
    expectRoute(page, { story: sharedStoryIdentity });
    expect(new URL(page.url()).hash).toBe("");
    await page.keyboard.press("Tab");
    await expectKeyboardWithin(card);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  });

  await test.step("the developer's own move is not scrolled back by the URL's keeper", async () => {
    const beforeOwnMove = (await revealsOf(page)).length;
    await card.getByRole("button", { name: "Inspect story" }).click();
    await expect(
      card.getByRole("button", { name: "Hide detail" }),
    ).toBeVisible();
    // Observe layout/ResizeObserver after the expansion.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 0);
          });
        }),
    );
    expect(await revealsOf(page)).toHaveLength(beforeOwnMove);
  });
  expect(hostRequests()).toEqual([]);
});

test("reload, direct open, and history preserve story targeting while ordinary project choices clear it", async ({
  page,
  frontendServices,
}) => {
  await pausePageClock(page);
  await answerSharedStoryProjects(page, frontendServices, "Taken");
  const hostRequests = recordHostRequests(page);
  await page.goto(storyUrl());
  const card = page.getByRole("article", { name: doughnutSharedTitle });
  const other = page.getByRole("article", { name: openDoughSharedTitle });
  await expect(card).toBeFocused();
  await expectDestinationCue(page, card, { motion: true });
  await expectSelected(card, false);
  await expectCueEnds(page, card);
  await page.reload();
  await expectArrivedAt(card);
  await chooseProject(page, "Open Dough");
  await expect(other).toBeVisible();
  expectRoute(page, { story: null });
  await page.goBack();
  await expect(card).toBeFocused();
  await expectDestinationCue(page, card, { motion: true });
  await expectCueEnds(page, card);
  expectRoute(page, { story: sharedStoryIdentity });
  await page.goForward();
  await expect(other).toBeVisible();
  expectRoute(page, { story: null });
  expect(hostRequests()).toEqual([]);
});

test("a target in a hidden column is revealed with reduced motion and useful keyboard focus", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 650, height: 750 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await answerSharedStoryProjects(page, frontendServices, "Taken");
  const hostRequests = recordHostRequests(page);
  await recordReveals(page);
  await page.goto(storyUrl());
  await expectArrivedAt(
    page.getByRole("article", { name: doughnutSharedTitle }),
  );
  await expect(page.locator(".board-row")).toHaveAttribute(
    "data-hidden",
    "1 3",
  );
  expect(
    (await revealsOf(page)).filter(({ name }) => name === doughnutSharedTitle),
  ).toContainEqual({ name: doughnutSharedTitle, behavior: "auto" });
  expect(hostRequests()).toEqual([]);
});

test("opening the roster leaves a same-project story target and Back restores that target", async ({
  page,
  frontendServices,
}) => {
  publishRosterStory(frontendServices);
  const hostRequests = recordHostRequests(page);
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
  expect(hostRequests()).toEqual([]);
});
