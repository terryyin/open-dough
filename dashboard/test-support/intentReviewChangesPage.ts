// A story's review in Intent. Compare and commit controls use the shared
// review components. File choices and the selected diff live in Changes.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyReviewWaitMs,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { parts } from "./dashboardPage.ts";
import {
  chooseStoryTab,
  expectFilesShown,
  filesColumn,
  filesToggle,
  storySummary,
} from "./intentModePage.ts";
import { ReviewCommits } from "./reviewChangesCommits.ts";
import { ReviewComparison } from "./reviewChangesComparison.ts";
import { ReviewContext } from "./reviewChangesContext.ts";
import { ReviewDiffs } from "./reviewChangesDiffs.ts";
import { emptyArea } from "./storyCardSelection.ts";
import {
  intentDiffReading,
  intentFile,
  storyTitle,
  intentStory,
  outsideGroup,
} from "./support/intentStoryPage.ts";
import { reviewAfter } from "./support/launchLandingReview.ts";
import { reviewRefresh } from "./support/reviewControls.ts";
import { expectTreeRows } from "./support/reviewTreeRows.ts";

class IntentReviewFiles {
  readonly #intent: Locator;

  constructor(intent: Locator) {
    this.#intent = intent;
  }

  get #outsideList() {
    return outsideGroup(this.#intent).getByRole("list", {
      name: "Changed files outside Intent locations",
      exact: true,
    });
  }

  async expectOutsideCount(count: number) {
    await expect(this.#outsideList.locator("li[data-kind]")).toHaveCount(count);
    return this;
  }

  async expectOutsideFiles(count: number, names: readonly string[]) {
    await this.expectOutsideCount(count);
    const story = intentStory(this.#intent);
    for (const name of names) {
      await expect(story.outsideFile(name)).toBeVisible();
    }
    return this;
  }

  async expectOutsideRows(rows: readonly string[]) {
    await expectTreeRows(this.#outsideList, rows);
    return this;
  }

  async expectNone() {
    await expect(outsideGroup(this.#intent)).toHaveCount(0);
    return this;
  }

  async expectOutsideLacks(...texts: readonly string[]) {
    for (const text of texts) {
      await expect(this.#outsideList).not.toContainText(text);
    }
    return this;
  }

  async expectSelected(file: string) {
    await expect(intentFile(this.#intent, file)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    return this;
  }

  async expectNotShown(file: string) {
    await expect(intentFile(this.#intent, file)).toHaveCount(0);
    return this;
  }

  async expectNoBrowser() {
    await expect(filesColumn(this.#intent)).toHaveCount(0);
    return this;
  }

  async choose(file: string, using: "mouse" | "keyboard" = "mouse") {
    const control = intentFile(this.#intent, file);
    await (using === "keyboard" ? control.press("Enter") : control.click());
    return this;
  }
}

class IntentReviewChanges {
  readonly #intent: Locator;
  readonly #header: Locator;
  readonly comparison: ReviewComparison;
  readonly commits: ReviewCommits;
  readonly context: ReviewContext;
  readonly files: IntentReviewFiles;
  readonly diffs: ReviewDiffs;

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

  filesToMeasure() {
    return filesColumn(this.#intent);
  }

  async expectFilesHidden() {
    await expectFilesShown(this.#intent, false);
    return this;
  }

  get #refresh() {
    return reviewRefresh(this.#header, { exact: true });
  }

  // Preserve the real snapshot response for assertions about Git's inputs.
  async refreshAndAnswer() {
    const answer = await reviewAfter(this.page, this.#refresh);
    return new IntentReviewChanges(this.page, answer);
  }
}

export type { IntentReviewChanges };

// While the card still opens the Side panel, select it and enter Changes
// through the dashboard banner.
export async function openIntentReviewChanges(page: Page, card: Locator) {
  const { intent, intentChoice } = parts(page);
  const classes = (await card.getAttribute("class"))?.split(/\s+/);
  if (!classes?.includes("story-card-selected")) await emptyArea(card).click();
  const answer = await reviewAfter(page, intentChoice);
  await chooseStoryTab(intent, "Changes");
  return new IntentReviewChanges(page, answer);
}
