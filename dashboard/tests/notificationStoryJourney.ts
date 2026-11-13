// Only published files and delayed external reads: the preview page owns the
// route, membership resolution, focus, and reveal.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { describedBacklog } from "./describedRevisions.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

export const notifiedIdentity = "SEED-777#shared-story";
export const notifiedTitle = "Doughnut's renamed notified story";
export const otherTitle = "Open Dough's different story with the same identity";
export const targetRevision = "ba".repeat(20);

export const storyUrl = (project = "doughnut", story = notifiedIdentity) =>
  `/?${new URLSearchParams({ project, story })}`;

// The notified story's card, by Doughnut's title for it.
export const notifiedCard = (page: Page) =>
  page.getByRole("article", { name: notifiedTitle, exact: true });

// What the page says of a story destination it cannot show yet or at all.
export const storyDestination = (page: Page) =>
  page.getByRole("region", { name: "Story destination" });

// The reader arrived at the card: it holds the keyboard and is wholly in the
// window, but for rounding.
export async function expectArrivedAt(card: Locator) {
  await expect(card).toBeFocused();
  await expect(card).toBeInViewport({ ratio: 0.99 });
}

// The keyboard is on the card or on one of its controls.
export async function expectKeyboardWithin(card: Locator) {
  await expect
    .poll(() =>
      card.evaluate((element) => element.contains(document.activeElement)),
    )
    .toBe(true);
}

// No story card holds the keyboard.
export async function expectNoCardFocused(page: Page) {
  expect(await page.locator("[data-story-card]:focus").count()).toBe(0);
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
const targetBacklog = (column: "Backlog list" | "Taken") => {
  const notified = sharedIdentity(notifiedTitle);
  return describedBacklog(
    makeMe.aRepository
      .withRevision("target", {
        backlog:
          column === "Taken"
            ? { taken: [notified], queued: preceding }
            : { queued: [...preceding, notified] },
      })
      .please(),
  );
};

export async function notificationOrigins(page: Page, column?: "Taken") {
  const other = await publishMovingOrigin(page);
  other.push(
    "cd".repeat(20),
    describedBacklog(
      makeMe.aRepository
        .withRevision("other", {
          backlog: { queued: [sharedIdentity(otherTitle)] },
        })
        .please(),
    ),
  );
  const target = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  target.push(targetRevision, targetBacklog(column ?? "Backlog list"));
  return { other, target };
}

export function expectNoHostActions(dashboard: DashboardServer) {
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
  expect(
    dashboard.claudeCalls().filter(({ argv }) => argv.includes("resume")),
  ).toEqual([]);
  expect(
    dashboard.codex.calls.filter(({ method }) =>
      ["thread/start", "thread/resume", "turn/start"].includes(method),
    ),
  ).toEqual([]);
}
