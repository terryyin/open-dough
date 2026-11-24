// A story's review in Intent. Compare and commit controls use the shared
// review components. File choices and the selected diff live in Changes.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyReviewWaitMs,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { parts } from "./dashboardPage.ts";
import {
  expectFilesShown,
  filesColumn,
  filesToggle,
  storySummary,
  storyTabPanel,
} from "./intentModePage.ts";
import { ReviewCommits } from "./reviewChangesCommits.ts";
import { ReviewComparison } from "./reviewChangesComparison.ts";
import { ReviewContext } from "./reviewChangesContext.ts";
import { ReviewLandedRun } from "./reviewChangesLandedRun.ts";
import { ReviewDiffs } from "./reviewChangesDiffs.ts";
import { reviewChanges } from "./storyCardControls.ts";
import { intentDiffReading, storyTitle } from "./support/intentStoryPage.ts";
import { reviewAfter } from "./support/launchLandingReview.ts";
import { reviewRefresh } from "./support/reviewControls.ts";
import { IntentReviewFiles } from "./intentReviewFiles.ts";

class IntentReviewChanges {
  readonly #intent: Locator;
  readonly #header: Locator;
  readonly comparison: ReviewComparison;
  readonly commits: ReviewCommits;
  readonly context: ReviewContext;
  readonly files: IntentReviewFiles;
  readonly diffs: ReviewDiffs;
  readonly landedRun: ReviewLandedRun;

  constructor(
    readonly page: Page,
    readonly answer: StoryReview,
  ) {
    this.#intent = parts(page).intent;
    this.#header = storySummary(this.#intent);
    const reach = () => expect(this.#header).toBeVisible();
    this.comparison = new ReviewComparison(this.#header, reach);
    this.commits = new ReviewCommits(this.#header, async () => {
      await this.expectRead();
    });
    this.context = new ReviewContext(this.#header, reach);
    this.landedRun = new ReviewLandedRun(this.#header, reach);
    this.files = new IntentReviewFiles(this.#intent);
    const diff = intentDiffReading(this.#intent);
    this.diffs = new ReviewDiffs(this.#intent, (file) =>
      file === undefined
        ? diff.container
        : diff.container.filter({
            has: page.getByRole("heading", { name: file, exact: true }),
          }),
    );
  }

  get snapshot() {
    if (this.answer.kind !== "snapshot")
      throw new Error("The review's opening took no snapshot.");
    return this.answer;
  }

  async expectRead() {
    await expect(this.#refresh).toBeEnabled({ timeout: storyReviewWaitMs });
    return this;
  }

  async expectText(text: string | RegExp) {
    await expect(this.#header).toContainText(text);
    return this;
  }

  async expectNoText(text: string | RegExp) {
    await expect(this.#header).not.toContainText(text);
    return this;
  }

  async expectStory(title: string) {
    await expect(storyTitle(this.#intent)).toHaveText(title);
    return this;
  }

  async expectChangesExplanation(message: string) {
    await expect(storyTabPanel(this.#intent, "Changes")).toContainText(message);
    return this;
  }

  async expectFeedback(message: string | RegExp) {
    await expect(this.#header.getByRole("status")).toContainText(message);
    return this;
  }

  async refresh(using: "mouse" | "keyboard" = "mouse") {
    await (using === "keyboard"
      ? this.#refresh.press("Enter")
      : this.#refresh.click());
    return this;
  }

  async expectRefreshFocused() {
    await expect(this.#refresh).toBeFocused();
    return this;
  }

  async hideFiles(using: "mouse" | "keyboard" = "mouse") {
    return this.setFilesShown(false, using);
  }

  async setFilesShown(shown: boolean, using: "mouse" | "keyboard" = "mouse") {
    const toggle = filesToggle(this.#intent);
    await (using === "keyboard" ? toggle.press("Enter") : toggle.click());
    await expectFilesShown(this.#intent, shown);
    return this;
  }

  readingToMeasure() {
    return this.#intent.locator(".intent-reading");
  }

  filesToMeasure() {
    return filesColumn(this.#intent);
  }

  async returnToDevelopment() {
    await parts(this.page).development.click();
    await expect(parts(this.page).intent).toBeHidden();
  }

  async expectFilesHidden() {
    await expectFilesShown(this.#intent, false);
    return this;
  }

  get #refresh() {
    return reviewRefresh(this.#header, { exact: true });
  }

  // Preserve the real snapshot response for assertions about Git's inputs.
  async refreshAndAnswer(using: "mouse" | "keyboard" = "mouse") {
    const answer = await reviewAfter(this.page, this.#refresh, using);
    return new IntentReviewChanges(this.page, answer);
  }
}

export type { IntentReviewChanges };

export async function openIntentReviewChanges(page: Page, card: Locator) {
  const action = reviewChanges(card);
  // The card can display the action before its startup enables the fieldset.
  await expect(action).toBeEnabled();
  const answer = await reviewAfter(page, action, "keyboard");
  return new IntentReviewChanges(page, answer);
}
