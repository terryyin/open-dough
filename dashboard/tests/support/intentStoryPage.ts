// What the story-scoped Intent journeys (../intent-story-changes*.spec.ts)
// read of the page: the selected story's lens, a tree row's change-kind
// style, the contains-changes background, the "Selected story only" toggle,
// and a changed file's diff in Intent's Purpose beside the same file's diff
// in Review changes.

import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import { parts } from "../dashboardPage.ts";
import { chooseReadingTab } from "../intentPerspectivePage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expect } from "../dashboardTest.ts";
import {
  changeIntentTests,
  publishIntentTrunk,
} from "./intentStoryWorktree.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

// Story A taken in Story Branch Mode by a real start, its worktree changing
// the tests Intent publishes, or as `change` changes it; its Taken card
// selected by an empty-area click, and Intent shown. The baseline is the
// claim, where the worktree meets trunk; the head is the worktree's last
// commit.
export async function selectTakenStoryInIntent(
  page: Page,
  origin: StartOrigin,
  change: (workspace: string) => void = changeIntentTests,
) {
  publishIntentTrunk(origin.project);
  await origin.takenByAnotherAgent();
  const workspace = path.join(origin.machine, "another-agent-workspace");
  change(workspace);
  await openBacklog(page, origin);
  const { taken, intentChoice, intent } = parts(page);
  const card = taken.getByRole("article", { name: "Story A" });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  return {
    card,
    intent,
    workspace,
    baseline: (await origin.originGit("rev-parse", "main")).trim(),
    head: git(workspace, "rev-parse", "HEAD"),
  };
}

export const lens = (intent: Locator) =>
  intent.getByRole("region", { name: "Selected story", exact: true });

// The "Selected story only" toggle.
export const storyOnly = (intent: Locator) =>
  intent.getByRole("checkbox", { name: "Selected story only", exact: true });

// A file's control in Intent's tree, by its accessible name: its full path,
// or for a changed file its kind and path as Review changes names it.
export const intentFile = (intent: Locator, name: string) =>
  intent
    .locator(".intent-locations")
    .getByRole("button", { name, exact: true });

// The style a file's name shows its kind in.
export const nameStyle = (file: Locator) =>
  file.locator("code").evaluate((code) => {
    const style = getComputedStyle(code);
    return {
      color: style.color,
      line: style.textDecorationLine,
      fontStyle: style.fontStyle,
    };
  });

// The dashboard's colours as the page resolves them.
export const colours = (intent: Locator) =>
  intent.evaluate((root) => {
    const probe = document.createElement("span");
    root.append(probe);
    const resolve = (token: string) => {
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const resolved = {
      text: resolve("--text"),
      ready: resolve("--ready"),
      accent: resolve("--accent"),
      quiet: resolve("--quiet"),
    };
    probe.remove();
    return resolved;
  });

// Each kind's expected name style, from the shared change-kind styles.
export async function kindStyles(intent: Locator) {
  const tokens = await colours(intent);
  const plain = { color: tokens.text, line: "none", fontStyle: "normal" };
  return {
    plain,
    added: { ...plain, color: tokens.ready },
    modified: { ...plain, color: tokens.accent },
    deleted: { ...plain, color: tokens.quiet, line: "line-through" },
    renamed: { ...plain, fontStyle: "italic" },
  };
}

// A folder's caret in Intent, by the folder's name and whether it is open.
export const folderCaret = (intent: Locator, name: string, open: boolean) =>
  intent.getByRole("button", {
    name: `${open ? "Collapse" : "Expand"} ${name}`,
    exact: true,
  });

// A folder's row (caret and name) in Intent, and the list item it heads,
// which carries the contains-changes mark.
export const folderRow = (intent: Locator, name: string) =>
  intent.locator(".story-review-folder-row").filter({
    has: intent
      .page()
      .locator(`button.story-review-folder[aria-label$=" ${name}"]`),
  });

export const folderItem = (intent: Locator, name: string) =>
  folderRow(intent, name).locator("xpath=..");

// One configured location's group in Intent.
export const locationGroup = (intent: Locator, locationPath: string) =>
  intent.locator(
    `section.intent-location:has(> .intent-location-header > [aria-controls="${intentLocationIdPrefix(locationPath)}-body"])`,
  );

export const background = (row: Locator) =>
  row.evaluate((element) => getComputedStyle(element).backgroundColor);

// A changed file's diff in Intent's Purpose, as its lines read.
export async function intentDiff(intent: Locator, name: string) {
  await intentFile(intent, name).click();
  const purpose = await chooseReadingTab(intent, "Purpose");
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(name);
  const code = purpose.locator(".story-review-code");
  await expect(code).toBeVisible();
  // Read once its omitted context is known, so the gaps it offers show.
  await expect(code).toHaveAttribute("aria-busy", "false");
  return code.innerText();
}

// The same file's diff in Review changes, opened from Intent's count of
// changed files outside its locations.
export async function reviewDiff(page: Page, name: string) {
  const review = page.getByRole("region", { name: "Story review" });
  await review
    .locator(".story-review-files")
    .getByRole("button", { name, exact: true })
    .click();
  const diff = review.getByRole("region", { name });
  const code = diff.locator(".story-review-code");
  await expect(code).toBeVisible();
  // Read once its omitted context is known, so the gaps it offers show.
  await expect(code).toHaveAttribute("aria-busy", "false");
  return code.innerText();
}

// Opens Review changes from the outside count beside Intent.
export async function openReviewFromIntent(page: Page, intent: Locator) {
  await intent
    .locator(".intent-story-outside")
    .getByRole("button", { name: "Review changes" })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Story review" })
      .locator(".story-review-files"),
  ).toBeVisible();
}
