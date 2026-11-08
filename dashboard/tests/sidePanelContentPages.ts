// The one Side panel and the content it shows, a Story review or a Final
// report, as fluent page objects, with the base every fluent page object of
// the Side panel journeys (./sidePanelPages.ts) shares: each method writes
// one named cue on the phase's cue sheet (./support/cueSheet.ts) and returns
// the page object the reader is then at.

import type { Page } from "@playwright/test";
import { control } from "./sidePanelWidthPage.ts";
import type { CueSheet } from "./support/cueSheet.ts";
import { expect } from "./support/preparationPage.ts";
import { reviewBody, reviewFeedback } from "./support/reviewContextLine.ts";
import { sidePanelContents } from "./support/sidePanelContents.ts";
import { reviewRegion } from "./support/storyReviewMark.ts";

// The Side panel's content kinds, by the name each region gives itself.
type SidePanelContent = "Terminal" | "Final report" | "Story review";

export abstract class PageObject {
  protected readonly page: Page;
  protected readonly cues: CueSheet;

  constructor(page: Page, cues: CueSheet) {
    this.page = page;
    this.cues = cues;
  }

  // Writes the cue and leaves the reader at `next`.
  protected cue<Next>(name: string, run: () => Promise<void>, next: Next) {
    this.cues.cue(name, run);
    return next;
  }

  get sidePanel() {
    return new SidePanel(this.page, this.cues);
  }
}

export class SidePanel extends PageObject {
  get storyReview() {
    return new StoryReview(this.page, this.cues);
  }

  get finalReport() {
    return new FinalReport(this.page, this.cues);
  }

  // How many contents the one Side panel shows: none or one.
  expectItems(count: number) {
    return this.cue(
      `Side panel: shows ${String(count)} ${count === 1 ? "item" : "items"}`,
      () => expect(sidePanelContents(this.page)).toHaveCount(count),
      this,
    );
  }

  expectNotShowing(content: SidePanelContent) {
    return this.cue(
      `Side panel: shows no ${content}`,
      () =>
        expect(
          this.page.getByRole("region", { name: content, exact: true }),
        ).toHaveCount(0),
      this,
    );
  }
}

export class StoryReview extends PageObject {
  get #review() {
    return reviewRegion(this.page);
  }

  #files(list: string | RegExp) {
    return this.#review.getByRole("list", { name: list });
  }

  #file(list: string, file: string) {
    return this.#files(list).getByRole("button", { name: file });
  }

  // The story the review is headed by.
  expectStory(title: string) {
    return this.cue(
      `Story review: of ${title}`,
      () =>
        expect(this.#review.getByRole("heading", { level: 2 })).toHaveText(
          title,
        ),
      this,
    );
  }

  // The work identity the review names itself by.
  expectIdentity(identity: string) {
    return this.cue(
      `Story review: names ${identity}`,
      () => expect(this.#review).toContainText(`Story review ${identity}`),
      this,
    );
  }

  // What the review's fixed top says, such as that it is reading.
  expectFeedback(text: string) {
    return this.cue(
      `Story review: says "${text}"`,
      () => expect(reviewFeedback(this.#review)).toHaveText(text),
      this,
    );
  }

  // The changed files list, by its name.
  expectChangedFiles(list: string) {
    return this.cue(
      `Story review: lists ${list}`,
      () => expect(this.#files(list)).toBeVisible(),
      this,
    );
  }

  expectNoChangedFiles(list: RegExp) {
    return this.cue(
      `Story review: lists no ${String(list)}`,
      () => expect(this.#files(list)).toHaveCount(0),
      this,
    );
  }

  // One file among the changed files list, by its button's name.
  expectChangedFile(list: string, file: string) {
    return this.cue(
      `Story review: ${list} has ${file}`,
      () => expect(this.#file(list, file)).toBeVisible(),
      this,
    );
  }

  expectNoText(text: string) {
    return this.cue(
      `Story review: says nothing of ${text}`,
      () => expect(this.#review).not.toContainText(text),
      this,
    );
  }

  // Chooses a file from the keyboard: Enter on its button.
  chooseFileByKeyboard(list: string, file: string) {
    return this.cue(
      `Story review: choose ${file} by keyboard`,
      () => this.#file(list, file).press("Enter"),
      this,
    );
  }

  expectFileChosen(list: string, file: string) {
    return this.cue(
      `Story review: ${file} is chosen`,
      () =>
        expect(this.#file(list, file)).toHaveAttribute("aria-pressed", "true"),
      this,
    );
  }

  // The chosen file's diff, by the file's name.
  expectFileDiff(file: string) {
    return this.cue(
      `Story review: shows the diff of ${file}`,
      () =>
        expect(this.#review.getByRole("region", { name: file })).toBeVisible(),
      this,
    );
  }

  // The review's body beneath its fixed top has the keyboard.
  expectKeyboardInBody() {
    return this.cue(
      "Story review: its body has the keyboard",
      () => expect(reviewBody(this.#review)).toBeFocused(),
      this,
    );
  }

  close() {
    return this.cue(
      "Story review: Close",
      () => control(this.#review, "Close").click(),
      this.sidePanel,
    );
  }
}

export class FinalReport extends PageObject {
  get #report() {
    return this.page.getByRole("region", { name: "Final report" });
  }

  expectText(text: string) {
    return this.cue(
      `Final report: says "${text}"`,
      () => expect(this.#report).toContainText(text),
      this,
    );
  }
}
