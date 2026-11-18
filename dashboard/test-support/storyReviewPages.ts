// A story's Story review, a Side panel content, as a fluent page object for
// the Side panel journeys (./sidePanelPages.ts): its story, changed files and
// diffs, and Close, which leaves the reader at the phase's Side panel. Each
// method writes one named cue on the phase's cue sheet
// (./support/cueSheet.ts) and returns the page object the reader is then at
// (./fluentPageObject.ts).

import {
  changedFilesList,
  listedFile,
  fileDiff,
} from "./support/reviewTreeRows.ts";
import { PageObject } from "./fluentPageObject.ts";
import { closeSidePanel } from "./sidePanelFrame.ts";
import { expect } from "./support/preparationPage.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
import { reviewBody, reviewFeedback } from "./support/reviewContextLine.ts";
import {
  expectLandedContext,
  expectSessionCommitsContext,
  expectSharedCheckoutNote,
  type LandedContextFacts,
  type SessionCommitsContextFacts,
} from "./support/reviewComparisonContext.ts";
import {
  comparison,
  reviewRefresh,
  reviewRegion,
  showReviewDetails,
} from "./support/reviewControls.ts";

export class StoryReview extends PageObject {
  get #review() {
    return reviewRegion(this.page);
  }

  #files(list: string | RegExp) {
    return changedFilesList(this.#review, list);
  }

  #file(list: string, file: string) {
    return listedFile(this.#files(list), file);
  }

  // The story or session the review is headed by.
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

  // The session id an ad hoc review names beneath its label.
  expectSession(session: string) {
    return this.cueHere(`Story review: names session ${session}`, () =>
      expect(this.#review).toContainText(`Session review ${session}`),
    );
  }

  expectLandedContext(facts: LandedContextFacts) {
    return this.cueHere("Story review: shows the landed context", () =>
      expectLandedContext(this.#review, facts),
    );
  }

  expectSessionCommitsContext(facts: SessionCommitsContextFacts) {
    return this.cueHere("Session review: shows session commits", () =>
      expectSessionCommitsContext(this.#review, facts),
    );
  }

  // The shared-checkout sentence beside the two revisions, or its absence.
  expectSharedCheckoutNote(shown: boolean) {
    return this.cueHere(
      `Session review: ${shown ? "notes" : "does not note"} a shared checkout`,
      () => expectSharedCheckoutNote(this.#review, shown),
    );
  }

  expectNoComparisonSwitch() {
    return this.cueHere(
      "Story review: shows no Comparison switch",
      async () => {
        await showReviewDetails(this.#review);
        await expect(comparison(this.#review)).toHaveCount(0);
      },
    );
  }

  expectNoLineFollowUp() {
    return this.cueHere("Story review: shows no line Follow up menu", () =>
      expect(
        this.#review.getByRole("button", { name: /^(?:Old|New) line / }),
      ).toHaveCount(0),
    );
  }

  expectNoNoteActions() {
    return this.cueHere("Session review: offers no Add note", () =>
      expect(
        this.#review.getByRole("button", { name: "Add note", exact: true }),
      ).toHaveCount(0),
    );
  }

  // What the review's status above the work area says, such as that it is reading.
  expectFeedback(text: string) {
    return this.cueHere(`Story review: says "${text}"`, () =>
      expect(reviewFeedback(this.#review)).toHaveText(text),
    );
  }

  // What the body says in place of the file browser, such as an empty comparison.
  expectBodyText(text: string) {
    return this.cueHere(`Story review: body says "${text}"`, () =>
      expect(reviewBody(this.#review)).toHaveText(text),
    );
  }

  // The changed files list is named by its count, so it appears once the
  // review has read its comparison, which the boundary may take up to its
  // read bound to answer.
  async #expectListed(list: string) {
    await untilPageRequestsAnswered(this.page);
    await expect(this.#files(list)).toBeVisible();
  }

  // The changed files list, by its name.
  expectChangedFiles(list: string) {
    return this.cueHere(`Story review: lists ${list}`, () =>
      this.#expectListed(list),
    );
  }

  expectNoChangedFiles(list: RegExp) {
    return this.cueHere(`Story review: lists no ${String(list)}`, () =>
      expect(this.#files(list)).toHaveCount(0),
    );
  }

  // One file among the changed files list, by its button's name.
  expectChangedFile(list: string, file: string) {
    return this.cueHere(`Story review: ${list} has ${file}`, async () => {
      await this.#expectListed(list);
      await expect(this.#file(list, file)).toBeVisible();
    });
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
    const diff = fileDiff(this.#review, file);
    const shows = text === undefined ? "" : ` with "${text}"`;
    return this.cueHere(
      `Story review: shows the diff of ${file}${shows}`,
      () =>
        text === undefined
          ? expect(diff).toBeVisible()
          : expect(diff).toContainText(text),
    );
  }

  // The review's body beneath details and status has the keyboard.
  expectKeyboardInBody() {
    return this.cueHere("Story review: its body has the keyboard", () =>
      expect(reviewBody(this.#review)).toBeFocused(),
    );
  }

  // What the review's region is described by.
  expectDescription(text: string) {
    return this.cueHere(`Story review: is described as "${text}"`, () =>
      expect(this.#review).toHaveAccessibleDescription(text),
    );
  }

  refresh() {
    return this.cueHere("Story review: Refresh", () =>
      reviewRefresh(this.#review, { exact: true }).click(),
    );
  }

  close() {
    return this.cue(
      "Story review: Close",
      () => closeSidePanel(this.#review),
      this.sidePanel,
    );
  }
}
