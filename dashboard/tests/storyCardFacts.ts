// What a Story card states about its published story in the scan view: its
// purpose, its preparation, readiness and eligibility badges, and its slice
// progress as a bar and count, or the gap that stops it. The scenario names
// every expected label, count and segment; these readers only find them on the
// card.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

// One badge on the card, by its whole label.
export const badge = (card: Locator, label: string | RegExp) =>
  card.getByText(label, { exact: true });

// Expects the card to show each `shown` badge, by its whole label such as
// "Slice planned" or "Blocked by 1 dependency", and none of the `absent` ones.
export async function expectBadges(
  card: Locator,
  {
    shown = [],
    absent = [],
  }: {
    readonly shown?: readonly string[];
    readonly absent?: readonly (string | RegExp)[];
  },
) {
  for (const label of shown)
    await expect(badge(card, label), label).toBeVisible();
  for (const label of absent)
    await expect(badge(card, label), String(label)).toHaveCount(0);
}

// A card's dependency badge, whatever count it names ("Blocked by 1
// dependency", "Blocked by 2 dependencies"), for expecting none.
export const blockedByAnyDependency = /^Blocked by \d+ dependenc/;

// Every badge `scope` (a card or its preparation facts) shows.
export const badges = (scope: Locator) => scope.locator(".badge");

// Every badge label the card shows, in order, to compare with another read.
export const badgeLabels = (card: Locator) => badges(card).allTextContents();

// A card's preparation facts: its badges, or the gap that stands for them.
export const preparationFacts = (card: Locator) =>
  card.locator(".story-card-preparation");

// The story's purpose as `scope` (a card or its detail) states it.
export const storyPurpose = (scope: Locator) => scope.locator(".story-purpose");

// A Taken card's slice progress: its bar and count, its source, its clock,
// or the gap that stops them.
export const sliceProgress = (card: Locator) =>
  card.locator(".story-card-progress");

// Where the progress shown in `scope` (a card's progress or its detail) was
// read from, when that is not simply trunk.
export const progressSource = (scope: Locator) =>
  scope.locator(".progress-source");

// The slice progress bar within `scope`, by the count it is named for, such
// as "1 of 3 slices recorded complete", or any count matching a pattern.
export const sliceBar = (scope: Locator, count: string | RegExp) =>
  scope.getByRole("img", { name: count });

// Expects the bar named `count` to show one segment per slice, in order, each
// by the recorded status it shows ("done", "planned", …).
export async function expectSliceBar(
  scope: Locator,
  count: string,
  statuses: readonly string[],
) {
  const bar = sliceBar(scope, count);
  await expect(bar).toBeVisible();
  await expect(bar.locator("[data-slice-status]")).toHaveCount(statuses.length);
  expect(
    await bar
      .locator("[data-slice-status]")
      .evaluateAll((segments) =>
        segments.map((segment) => segment.getAttribute("data-slice-status")),
      ),
  ).toEqual(statuses);
}

// Expects `scope` to show `gap` where a count would be: no bar, and nothing
// "recorded complete".
export async function expectNoSliceCount(scope: Locator, gap: string) {
  await expect(scope).toContainText(gap);
  await expect(scope.getByRole("img")).toHaveCount(0);
  await expect(scope).not.toContainText("recorded complete");
}
