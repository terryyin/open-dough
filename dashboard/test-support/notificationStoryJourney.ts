// Only published files and delayed external reads: the preview page owns the
// route, membership resolution, focus, and reveal.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { doughnutRepository } from "./doughnutProject.ts";
import { publishMovingHistory } from "./publishedMovingOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export const notifiedIdentity = "SEED-777#shared-story";
export const notifiedTitle = "Doughnut's renamed notified story";
export const otherTitle = "Open Dough's different story with the same identity";

export const storyUrl = (project = "doughnut", story = notifiedIdentity) =>
  `/?${new URLSearchParams({ project, story })}`;

// What the page says of a story destination it cannot show yet or at all.
export const storyDestination = (page: Page) =>
  page.getByRole("region", { name: "Story destination" });

// The reader arrived at the card: it holds the keyboard and is wholly in the
// window, but for rounding.
export async function expectArrivedAt(card: Locator) {
  await expect(card).toBeFocused();
  await expect(card).toBeInViewport({ ratio: 0.99 });
}

// The notified identity, as each project records it with its own title.
const sharedIdentity = (title: string) =>
  makeMe.aBacklogEntry
    .with({
      identity: notifiedIdentity,
      title,
      href: "seeds/SEED-777.md#shared-story",
    })
    .please();

// Twelve stories queued ahead, so the notified one starts out of view.
const preceding = [...Array(12).keys()].map((index) =>
  makeMe.aBacklogEntry
    .with({
      identity: `SEED-${String(800 + index)}#story`,
      title: `Earlier story ${String(index + 1)}`,
      href: `seeds/SEED-${String(800 + index)}.md#story`,
    })
    .please(),
);

// Doughnut's backlog, holding the notified story last in its Backlog list or
// alone in Taken.
const targetHistory = (column: "Backlog list" | "Taken") => {
  const notified = sharedIdentity(notifiedTitle);
  return makeMe.aRepository
    .withRevision("target", {
      backlog:
        column === "Taken"
          ? { taken: [notified], queued: preceding }
          : { queued: [...preceding, notified] },
    })
    .please();
};

export async function notificationOrigins(
  page: Page,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
  column: "Backlog list" | "Taken" = "Backlog list",
) {
  const other = await publishMovingHistory(
    page,
    makeMe.aRepository
      .withRevision("other", {
        backlog: { queued: [sharedIdentity(otherTitle)] },
      })
      .please(),
    "other",
    afterGitHubStops,
  );
  const target = await publishMovingHistory(
    page,
    targetHistory(column),
    "target",
    afterGitHubStops,
    doughnutRepository,
  );
  return { other, target };
}
