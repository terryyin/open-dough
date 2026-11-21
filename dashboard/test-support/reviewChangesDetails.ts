// The review details of Review changes (./reviewChangesPage.ts) as the eye's
// own contract: pressing the eye to reveal them, the eye beside the
// comparison's name, and what they say once revealed (a run's or
// completion's facts, the comparisons a session lists). Choosing a
// comparison, run or the uncommitted check belongs to `comparison` and
// `landedRun`, which reveal the details themselves. The scenario supplies
// every expected name, text and time.

import { expect, type Locator } from "@playwright/test";
import { showReviewDetails } from "./support/reviewControls.ts";
import {
  expectDetailsCollapsed,
  expectDetailsRevealed,
  expectEyeBesideComparison,
  hideDetails,
  revealDetails,
} from "./support/reviewDetails.ts";

type Text = string | RegExp;

export class ReviewDetails {
  readonly #review: Locator;

  constructor(review: Locator) {
    this.#review = review;
  }

  get #section() {
    return this.#review.getByRole("group", { name: "Review details" });
  }

  // Presses the eye named Show review details; the details are then
  // revealed between the toolbar and the work area.
  async reveal() {
    await revealDetails(this.#review);
    return this;
  }

  // The details shown, revealing them only if they are collapsed.
  async show() {
    await showReviewDetails(this.#review);
    return this;
  }

  // Presses the eye named Hide review details; the details then collapse.
  async hide() {
    await hideDetails(this.#review);
    return this;
  }

  async expectCollapsed() {
    await expectDetailsCollapsed(this.#review);
    return this;
  }

  async expectRevealed() {
    await expectDetailsRevealed(this.#review);
    return this;
  }

  // The eye, named `named`, is an icon after the comparison's name whose
  // tooltip says its name.
  async expectEyeBesideComparison(
    named: "Show review details" | "Hide review details",
  ) {
    await expectEyeBesideComparison(this.#review, named);
    return this;
  }

  // No eye and no details group: the details hold nothing to reveal.
  async expectNone() {
    await expect(
      this.#review.getByRole("button", {
        name: /^(Show|Hide) review details$/,
      }),
    ).toHaveCount(0);
    await expect(this.#section).toHaveCount(0);
    return this;
  }

  // The revealed details say `text`; `false` says they do not.
  async expectText(text: Text, says = true) {
    await (says
      ? expect(this.#section).toContainText(text)
      : expect(this.#section).not.toContainText(text));
    return this;
  }

  async expectHeading(name: string) {
    await expect(
      this.#section.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    return this;
  }

  // The time the revealed details name, as its machine-readable datetime.
  async expectTime(datetime: string) {
    await expect(this.#section.locator("time")).toHaveAttribute(
      "datetime",
      datetime,
    );
    return this;
  }

  // Not even a hidden Landed run heading remains of a former run.
  async expectNoLandedRunFacts() {
    await expect(
      this.#review.getByRole("heading", {
        name: "Landed run",
        exact: true,
        includeHidden: true,
      }),
    ).toHaveCount(0);
    return this;
  }
}
