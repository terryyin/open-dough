// The one Side panel, its frame shared by whatever content it shows, and
// that content when a Story review or a Final report, as fluent page objects,
// with the base every fluent page object of the Side panel journeys
// (./sidePanelPages.ts) shares: each method writes one named cue on the
// phase's cue sheet (./support/cueSheet.ts) and returns the page object the
// reader is then at.

import type { Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { expectFills, pressWhereShown, type Room } from "./pageLayout.ts";
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

  // Writes the cue and leaves the reader here.
  protected cueHere(name: string, run: () => Promise<void>) {
    return this.cue(name, run, this);
  }

  get sidePanel() {
    return new SidePanel(this.page, this.cues);
  }
}

// The Side panel's frame is its shown content's header controls, the same
// for every content, and the room the content fills: the split beside the
// Board, or the page's when maximized, without the banner.
export class SidePanel extends PageObject {
  #control(name: string) {
    return control(sidePanelContents(this.page), name);
  }

  #frame(name: string, run: () => Promise<void>) {
    return this.cueHere(`Side panel: ${name}`, run);
  }

  // Presses Maximize with the mouse where it shows.
  maximize() {
    return this.#frame("Maximize", () =>
      pressWhereShown(this.#control("Maximize")),
    );
  }

  restore() {
    return this.#frame("Restore", () =>
      pressWhereShown(this.#control("Restore")),
    );
  }

  expectMaximized() {
    return this.#frame("maximized, the banner hidden", () =>
      expect(parts(this.page).banner).toBeHidden(),
    );
  }

  // Beside the Board, with Maximize offered and the banner shown.
  expectInSplit() {
    return this.#frame("in the normal split", async () => {
      await expect(this.#control("Maximize")).toBeVisible();
      await expect(parts(this.page).banner).toBeVisible();
    });
  }

  // The shown content fills `room`, as measured earlier.
  expectFills(room: Room) {
    const { x, y, width, height } = room;
    return this.#frame(`fills ${String([x, y, width, height])}`, () =>
      expectFills(sidePanelContents(this.page), room),
    );
  }

  // The header's `name` control is a frame icon control
  // (./frameIconControl.ts), its tooltip saying `tooltip`.
  expectFrameIconControl(name: string, tooltip = name) {
    return this.#frame(`${name} is a frame icon control`, () =>
      expectFrameIconControl(this.#control(name), name, tooltip),
    );
  }

  get storyReview() {
    return new StoryReview(this.page, this.cues);
  }

  get finalReport() {
    return new FinalReport(this.page, this.cues);
  }

  // How many contents the one Side panel shows: none or one.
  expectItems(count: number) {
    return this.cueHere(
      `Side panel: shows ${String(count)} ${count === 1 ? "item" : "items"}`,
      () => expect(sidePanelContents(this.page)).toHaveCount(count),
    );
  }

  expectNotShowing(content: SidePanelContent) {
    return this.cueHere(`Side panel: shows no ${content}`, () =>
      expect(
        this.page.getByRole("region", { name: content, exact: true }),
      ).toHaveCount(0),
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
    return this.cueHere(`Story review: of ${title}`, () =>
      expect(this.#review.getByRole("heading", { level: 2 })).toHaveText(title),
    );
  }

  // The work identity the review names itself by.
  expectIdentity(identity: string) {
    return this.cueHere(`Story review: names ${identity}`, () =>
      expect(this.#review).toContainText(`Story review ${identity}`),
    );
  }

  // What the review's fixed top says, such as that it is reading.
  expectFeedback(text: string) {
    return this.cueHere(`Story review: says "${text}"`, () =>
      expect(reviewFeedback(this.#review)).toHaveText(text),
    );
  }

  // The changed files list, by its name.
  expectChangedFiles(list: string) {
    return this.cueHere(`Story review: lists ${list}`, () =>
      expect(this.#files(list)).toBeVisible(),
    );
  }

  expectNoChangedFiles(list: RegExp) {
    return this.cueHere(`Story review: lists no ${String(list)}`, () =>
      expect(this.#files(list)).toHaveCount(0),
    );
  }

  // One file among the changed files list, by its button's name.
  expectChangedFile(list: string, file: string) {
    return this.cueHere(`Story review: ${list} has ${file}`, () =>
      expect(this.#file(list, file)).toBeVisible(),
    );
  }

  expectNoText(text: string) {
    return this.cueHere(`Story review: says nothing of ${text}`, () =>
      expect(this.#review).not.toContainText(text),
    );
  }

  // Chooses a file with the mouse: a click on its button.
  chooseFile(list: string, file: string) {
    return this.cueHere(`Story review: choose ${file}`, () =>
      this.#file(list, file).click(),
    );
  }

  // Chooses a file from the keyboard: Enter on its button.
  chooseFileByKeyboard(list: string, file: string) {
    return this.cueHere(`Story review: choose ${file} by keyboard`, () =>
      this.#file(list, file).press("Enter"),
    );
  }

  expectFileChosen(list: string, file: string) {
    return this.cueHere(`Story review: ${file} is chosen`, () =>
      expect(this.#file(list, file)).toHaveAttribute("aria-pressed", "true"),
    );
  }

  // The chosen file's diff, by the file's name, showing `text` if given.
  expectFileDiff(file: string, text?: string) {
    const diff = this.#review.getByRole("region", { name: file });
    const shows = text === undefined ? "" : ` with "${text}"`;
    return this.cueHere(
      `Story review: shows the diff of ${file}${shows}`,
      () =>
        text === undefined
          ? expect(diff).toBeVisible()
          : expect(diff).toContainText(text),
    );
  }

  // The review's body beneath its fixed top has the keyboard.
  expectKeyboardInBody() {
    return this.cueHere("Story review: its body has the keyboard", () =>
      expect(reviewBody(this.#review)).toBeFocused(),
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
    return this.cueHere(`Final report: says "${text}"`, () =>
      expect(this.#report).toContainText(text),
    );
  }
}
