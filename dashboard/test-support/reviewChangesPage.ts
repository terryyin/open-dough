// A session's Review changes opens the Side panel, with one page object for
// review journeys in every browser test
// group. It owns where each of the review's controls lives, so a change to
// the review's layout edits these objects, not the journeys. The review
// itself holds the toolbar: the comparison's name and the file sidebar
// toggle. Its parts are reached from it: `comparison` (recorded choices), `landedRun` (the run picker and the run's facts),
// `details` (the toolbar's eye and what it reveals), `context`, `status`
// (feedback, body and Refresh), `files`, `diffs`, `code` and
// `frame`. An operation that needs a control the details hold reveals them
// first, so a scenario names what it chooses, never where the choice sits.
//
// Journeys reach it from the session entry: `openReviewChanges` presses its
// Review changes, and `reviewChangesAfter` activates another control that opens or
// rereads it, and `assumeReviewChanges` resumes a session review already open.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { closeSidePanel } from "./sidePanelFrame.ts";
import { reviewChanges as reviewChangesAction } from "./storyCardControls.ts";
import { reviewAfter } from "./support/launchLandingReview.ts";
import {
  expectToggleLeadsToolbar,
  filesToggle,
  reviewRefresh,
  reviewRegion,
  toolbarComparison,
} from "./support/reviewControls.ts";
import { fileBrowser } from "./support/reviewContextLine.ts";
import { expectReviewRead } from "./support/reviewRead.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { ReviewLandedRun } from "./reviewChangesLandedRun.ts";
import { ReviewStatus } from "./reviewChangesStatus.ts";
import { ReviewComparison, type Using } from "./reviewChangesComparison.ts";
import { ReviewContext } from "./reviewChangesContext.ts";
import { ReviewDetails } from "./reviewChangesDetails.ts";
import { ReviewCode } from "./reviewChangesCode.ts";
import { ReviewDiffs } from "./reviewChangesDiffs.ts";
import { ReviewFiles } from "./reviewChangesFiles.ts";
import {
  followUpFromLine,
  type DiffLineSide,
} from "./support/diffLineFollowUpPage.ts";
import { ReviewFrame } from "./reviewChangesFrame.ts";

export type { Using };
export { intentReviewFiles } from "./intentReviewFiles.ts";
export {
  beginIntentReviewChanges,
  expectReviewChangesOffered,
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "./intentReviewChangesPage.ts";

async function activate(control: Locator, using: Using) {
  if (using === "keyboard") await control.press("Enter");
  else if (using === "touch") await tapWhereShown(control);
  else await control.click();
}

class ReviewChanges {
  readonly page: Page;
  // What the read that opened it answered, when the root saw that read.
  readonly answer: StoryReview | undefined;
  readonly comparison: ReviewComparison;
  readonly files: ReviewFiles;
  readonly context: ReviewContext;
  readonly landedRun: ReviewLandedRun;
  readonly status: ReviewStatus;
  readonly details: ReviewDetails;
  readonly diffs: ReviewDiffs;
  readonly frame: ReviewFrame;
  readonly code: ReviewCode;

  constructor(page: Page, answer?: StoryReview) {
    this.page = page;
    this.answer = answer;
    const reach = () => this.details.show();
    this.comparison = new ReviewComparison(this.#region, reach);
    this.files = new ReviewFiles(this.#region);
    this.context = new ReviewContext(this.#region, reach);
    this.landedRun = new ReviewLandedRun(this.#region, reach);
    this.status = new ReviewStatus(this.#region);
    this.details = new ReviewDetails(this.#region);
    this.diffs = new ReviewDiffs(this.#region);
    this.frame = new ReviewFrame(page);
    this.code = new ReviewCode(this.#region);
  }

  get #region() {
    return reviewRegion(this.page);
  }

  // Open the composer from one line of the shown file.
  async followUpFromLine(
    file: string,
    side: DiffLineSide,
    line: number,
    story: string,
    context: readonly string[],
  ) {
    return followUpFromLine(
      this.page,
      this.diffs.toRead(file),
      side,
      line,
      story,
      context,
      "keyboard",
    );
  }

  // Every read the review has asked is answered.
  async expectRead() {
    await expectReviewRead(this.#region);
    return this;
  }

  async expectText(text: string | RegExp) {
    await expect(this.#region).toContainText(text);
    return this;
  }

  async expectNoText(text: string | RegExp) {
    await expect(this.#region).not.toContainText(text);
    return this;
  }

  // The toolbar names the comparison shown, and nothing else.
  async expectComparisonNamed(name: string) {
    await expect(toolbarComparison(this.#region)).toHaveText(name);
    return this;
  }

  // The toolbar's file sidebar toggle is an icon at its far left, before the
  // comparison's name; answers where the toggle is.
  expectFilesToggleLeads(comparisonShown: string) {
    return expectToggleLeadsToolbar(this.#region, comparisonShown);
  }

  async hideFiles(using: Using = "mouse") {
    await activate(filesToggle(this.#region, "Hide files"), using);
    return this;
  }

  async showFiles(using: Using = "mouse") {
    await activate(filesToggle(this.#region, "Show files"), using);
    return this;
  }

  async expectFilesShown(shown: boolean) {
    const browser = fileBrowser(this.#region);
    await (shown
      ? expect(browser).toBeVisible()
      : expect(browser).toBeHidden());
    return this;
  }

  // The toolbar's file sidebar toggle, by the name it has now.
  async expectFilesToggleNamed(name: "Hide files" | "Show files") {
    await expect(filesToggle(this.#region, name)).toBeVisible();
    return this;
  }

  // The toggle has the keyboard and says whether the sidebar is shown.
  async expectFilesToggleFocused(name: "Hide files" | "Show files") {
    const toggle = filesToggle(this.#region, name);
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute(
      "aria-expanded",
      String(name === "Hide files"),
    );
    return this;
  }

  // The toolbar offers no file sidebar toggle: the comparison lists no files.
  async expectNoFilesToggle() {
    await expect(
      this.#region.getByRole("button", { name: /^(Hide|Show) files$/ }),
    ).toHaveCount(0);
    return this;
  }

  // Refreshes and answers the review as that read shows it.
  async refreshAndAnswer(using: "mouse" | "keyboard" = "mouse") {
    const answered = this.page.waitForResponse(
      (response) => new URL(response.url()).pathname === storyReviewEndpoint,
    );
    const refresh = reviewRefresh(this.#region, { exact: true });
    await (using === "keyboard" ? refresh.press("Enter") : refresh.click());
    const answer = storyReviewSchema.parse(await (await answered).json());
    return new ReviewChanges(this.page, answer);
  }

  // Closes the review; the Side panel then holds nothing of it.
  async close(using: "mouse" | "keyboard" = "mouse") {
    await closeSidePanel(
      this.#region,
      using === "keyboard" ? { using, key: "Enter" } : { using },
    );
    await expect(reviewRegion(this.page)).toHaveCount(0);
  }
}

export type { ReviewChanges };

// Presses Review changes after the session entry settles (reading can move
// the action), and answers the review it shows,
// as the reader first meets it.
export async function openReviewChanges(page: Page, card: Locator) {
  await expect(card).not.toContainText(/Reading [^…]*…/);
  const answer = await reviewAfter(page, reviewChangesAction(card));
  return new ReviewChanges(page, answer);
}

// The review a control other than a card's Review changes opens or rereads,
// such as a session entry's review action.
export async function reviewChangesAfter(page: Page, control: Locator) {
  return new ReviewChanges(page, await reviewAfter(page, control));
}

// The review already open, as the reader now faces it.
export async function assumeReviewChanges(page: Page) {
  await expect(reviewRegion(page)).toBeVisible();
  return new ReviewChanges(page);
}
