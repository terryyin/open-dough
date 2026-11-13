// The review state journeys of Recently done's done story cards
// (./stories/recently-done-review-state*.spec.ts): three done stories
// completed on another machine and published on the private origin's trunk,
// none of them ever run here; a card's Story actions with its review state;
// and what this machine keeps of that state, and of the story review's
// snapshot marks, in its local records.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { doneRecordPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { showColumn } from "./boardPage.ts";
import {
  expectControlContrast,
  expectReadableContrast,
} from "./accessibleReading.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardParts.ts";
import { expect } from "./dashboardTest.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { git } from "./support/storyReviewWorktree.ts";

type Story = { readonly identity: string; readonly title: string };

// Newest first, as Recently done lists them.
export const storyC: Story = {
  identity: "SEED-330#tidy-the-terminal-tab",
  title: "Tidy the terminal tab",
};
export const storyA: Story = {
  identity: "SEED-331#explain-the-ci-pause",
  title: "Explain the CI pause",
};
export const storyB: Story = {
  identity: "SEED-332#keep-the-board-scroll",
  title: "Keep the board scroll",
};
export const doneStories = [storyC, storyA, storyB];

const hour = 60 * 60 * 1000;

// Publishes the three stories' done records on the origin's trunk, completed
// an hour apart before `now` by a developer on another machine, and serves
// that trunk to the page. The page is not opened yet.
export async function publishDoneStories(
  page: Page,
  origin: StartOrigin,
  now = Date.now(),
) {
  const revision = await origin.publishRevision({
    message: "Complete three stories elsewhere",
    doneRecords: doneStories.map((story, index) =>
      makeMe.aDoneRecord
        .with({
          ...story,
          completedAt: new Date(now - (index + 1) * hour).toISOString(),
          developer: "Terry Yin",
          agent: "Akiho-chan",
          host: "codex",
        })
        .please(),
    ),
  });
  return publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
  });
}

// Where a story's done record is published.
export const recordPathOf = (story: Story) =>
  `.planning/${doneRecordPath(story.identity)}`;

// Opens the page on Recently done.
export async function openRecentlyDone(page: Page) {
  await page.goto("/");
  await showColumn(page, "Recently done");
  return parts(page).recentlyDone;
}

// A done story's card, named by its title once its record is read, or by
// its identity until then.
export const doneCard = (page: Page, name: string) =>
  parts(page).recentlyDone.getByRole("article", { name, exact: true });

export const storyActions = (card: Locator) =>
  card.getByRole("group", { name: "Story actions" });

export const markAsReviewed = (card: Locator) =>
  storyActions(card).getByRole("button", {
    name: "Mark as reviewed",
    exact: true,
  });

export const unreview = (card: Locator) =>
  storyActions(card).getByRole("button", { name: "Unreview", exact: true });

export const reviewSaveFailure = (card: Locator, message: string) =>
  card.getByRole("status").filter({ hasText: message });

// A warning remains an action in words, with a filled red surface that is
// readable and distinguishable as a control in the caller's appearance.
export async function expectReviewWarning(
  card: Locator,
  colors: { readonly background: string; readonly foreground: string },
) {
  const action = markAsReviewed(card);
  await expect(action).toBeVisible();
  await expect(action).toHaveCSS("background-color", colors.background);
  await expect(action).toHaveCSS("color", colors.foreground);
  await expectReadableContrast(action);
  await expectControlContrast(action);
}

export async function expectQuietReviewed(
  card: Locator,
  quietColor: string,
  surfaceColor: string,
) {
  await expectReviewed(card, true);
  await expect(unreview(card)).toHaveCSS("color", quietColor);
  await expect(unreview(card)).toHaveCSS("background-color", surfaceColor);
  await expectReadableContrast(unreview(card));
  await expectReadableContrast(
    storyActions(card).getByText("Reviewed", { exact: true }),
  );
}

// What the Story actions say of the card's review state: the Reviewed status
// words with Unreview beside them, or Mark as reviewed alone; never a
// control named Reviewed, nor an "unreviewed" badge.
export async function expectReviewed(card: Locator, reviewed: boolean) {
  const actions = storyActions(card);
  const indicator = actions.getByText("Reviewed", { exact: true });
  if (reviewed) {
    await expect(indicator).toBeVisible();
    await expect(unreview(card)).toBeVisible();
    await expect(markAsReviewed(card)).toHaveCount(0);
  } else {
    await expect(markAsReviewed(card)).toBeVisible();
    await expect(indicator).toHaveCount(0);
    await expect(unreview(card)).toHaveCount(0);
  }
  await expect(
    actions.getByRole("button", { name: "Reviewed", exact: true }),
  ).toHaveCount(0);
  await expect(card.getByText(/unreviewed/i)).toHaveCount(0);
}

// Where this machine keeps its story review states.
export const reviewStatesFile = (dashboard: DashboardServer) =>
  path.join(dashboard.home, ".open-dough/dashboard/story-review-states.json");

// The story review states this machine keeps, by project id and story
// identity, or undefined while it keeps none at all.
export function keptReviewStates(
  dashboard: DashboardServer,
): Record<string, Record<string, unknown>> | undefined {
  const file = reviewStatesFile(dashboard);
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        Record<string, unknown>
      >)
    : undefined;
}

// The review marks file of the story review's Mark reviewed, holding a
// snapshot mark for `story`, as a review of its workspace would have left it.
export function keepSnapshotMark(dashboard: DashboardServer, story: Story) {
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/review-marks.json",
  );
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    `${JSON.stringify({
      "open-dough": {
        [story.identity]: {
          tree: "a".repeat(40),
          baseline: "b".repeat(40),
          markedAt: "2026-11-01T10:00:00.000Z",
        },
      },
    })}\n`,
  );
  return () => readFileSync(file, "utf8");
}

// What the project's repository holds: the origin's trunk, the checkout's
// status, and every ref of both.
export async function repositoryState(origin: StartOrigin) {
  return {
    trunk: (await origin.originGit("rev-parse", "main")).trim(),
    originRefs: await origin.originGit("for-each-ref"),
    status: git(origin.project, "status", "--porcelain", "--untracked=all"),
    projectRefs: git(origin.project, "for-each-ref"),
  };
}
