// Story A waits on Story B and needs a decision about Story C. A reference
// opens the story its identity names, in the shown project: two stories
// sharing one seed each open their own, and Pygardon's telling of SEED-B#b
// opens there. Nothing here launches or attaches an agent. The real-server
// reading of the shared seed is
// ../../../e2e/stories/story-dependencies.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { chooseProject } from "../../tests/projectChoice.ts";
import { expectRoute } from "../../tests/agentRosterRecords.ts";
import { recordHostRequests } from "../../tests/support/frontendHostRequests.ts";
import {
  answerPygardonTelling,
  putFrontendSuppliersInOneSeed,
} from "../../tests/support/frontendStoryIdentities.ts";
import { storyDetail } from "../../tests/storyCardSelection.ts";
import { storyCard } from "../../tests/storyCardControls.ts";
import {
  dependencySummary,
  followReference,
  openDependencies,
  storyReference,
} from "../../tests/storyReference.ts";
import {
  recordReveals,
  revealsOf,
} from "../../tests/sessionNavigationJourney.ts";

test.use({ hasTouch: true });

test("distinct stories in one seed follow their recorded identities by keyboard and touch at a narrow reduced-motion viewport", async ({
  page,
  frontendServices,
}) => {
  putFrontendSuppliersInOneSeed(frontendServices);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordReveals(page);
  const hostRequests = recordHostRequests(page);
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  const first = storyCard(parts(page).taken, "Story B");
  const second = storyCard(parts(page).backlog, "Second story in seed B");
  await openDependencies(consumer, "tap");
  await followReference(consumer, "Second story in seed B", "keyboard");
  await expect(storyDetail(second)).toBeVisible();
  await expect(second).toBeFocused();
  await expect(second).toBeInViewport({ ratio: 0.5 });
  await expect(storyDetail(first)).toHaveCount(0);
  expect((await revealsOf(page)).at(-1)?.behavior).toBe("auto");
  await followReference(consumer, "Story B", "tap");
  await expect(storyDetail(first)).toBeVisible();
  await expect(first).toBeFocused();
  await expect(first).toBeInViewport({ ratio: 0.5 });
  expect((await revealsOf(page)).at(-1)?.behavior).toBe("auto");
  // The earlier reference's detail stays open beside it.
  await expect(storyDetail(second)).toBeVisible();
  expect(hostRequests()).toEqual([]);
});

test("each project's rendered pinned reference opens its own telling of the same identity, including Pygardon's seed URL shape", async ({
  page,
  frontendServices,
}) => {
  const pygardonUrl = await answerPygardonTelling(page, frontendServices);
  const hostRequests = recordHostRequests(page);
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, "Story B");
  await expect(storyCard(parts(page).backlog, "Story B")).toBeFocused();
  await chooseProject(page, "Pygardon");
  await expect(dependencySummary(consumer)).toBeVisible();
  await openDependencies(consumer);
  const reference = storyReference(consumer, "Pygardon selected story");
  await expect(reference).toHaveAttribute("href", pygardonUrl);
  await reference.click();
  const destination = storyCard(parts(page).backlog, "Pygardon selected story");
  await expect(storyDetail(destination)).toBeVisible();
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(storyCard(parts(page).backlog, "Story B")).toHaveCount(0);
  expectRoute(page, { project: "pygardon" });
  expect(hostRequests()).toEqual([]);
});
