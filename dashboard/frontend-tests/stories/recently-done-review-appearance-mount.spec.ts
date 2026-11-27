// A developer scanning Recently done can distinguish the outstanding review
// action from a reviewed story in either appearance, before selecting a card.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { contrastRatio, painted } from "../../test-support/composedColours.ts";
import { settingsColourScheme } from "../configuration/system-settings-browser.ts";
import { paintContrast } from "../configuration/system-settings-reading.ts";
import {
  doneSessionOf,
  reviewBoard,
  reviewCard,
  storyA,
  storyB,
} from "./recently-done-review-state-mount-page.ts";

type Card = ReturnType<typeof reviewCard>;

// Text reads at 4.5:1 on its own fill, or on what is behind a clear one.
function textContrast(element: Element) {
  const { color, backgroundColor } = getComputedStyle(element);
  return painted(backgroundColor)
    ? contrastRatio(color, backgroundColor)
    : paintContrast(element, [color]);
}

async function expectWarning(
  card: Card,
  colours: { background: string; foreground: string },
) {
  await expect.element(card.markAsReviewed).toBeVisible();
  const action = card.markAsReviewed.element();
  const style = getComputedStyle(action);
  expect(style.backgroundColor).toBe(colours.background);
  expect(style.color).toBe(colours.foreground);
  expect(textContrast(action)).toBeGreaterThanOrEqual(4.5);
  expect(paintContrast(action, [style.backgroundColor])).toBeGreaterThanOrEqual(
    3,
  );
}

async function expectQuietReviewed(card: Card, quiet: string) {
  await expect.element(card.reviewedButton).toBeVisible();
  expect(card.markAsReviewed.all()).toHaveLength(0);
  const button = card.reviewedButton.element();
  const style = getComputedStyle(button);
  expect(style.color).toBe(quiet);
  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(textContrast(button)).toBeGreaterThanOrEqual(4.5);
}

for (const appearance of [
  {
    scheme: "light",
    background: "rgb(155, 28, 28)",
    foreground: "rgb(255, 255, 255)",
    quiet: "rgb(85, 85, 79)",
  },
  {
    scheme: "dark",
    background: "rgb(240, 168, 168)",
    foreground: "rgb(42, 16, 16)",
    quiet: "rgb(176, 189, 210)",
  },
] as const) {
  test(`an outstanding review is a readable red action beside quiet Reviewed in ${appearance.scheme} appearance`, async () => {
    await settingsColourScheme()(appearance.scheme);
    await reviewBoard().mount();
    const a = reviewCard(storyA.title);
    const b = reviewCard(storyB.title);
    await expect.element(b.markAsReviewed).toBeVisible();
    // The pointer rests off the cards wherever an earlier case left it.
    await userEvent.unhover(b.markAsReviewed);
    b.markAsReviewed.element().focus();
    await userEvent.keyboard("{Enter}");
    await expectQuietReviewed(b, appearance.quiet);
    await expectWarning(a, appearance);

    await expect.element(b.reviewedButton).toHaveFocus();
    a.markAsReviewed.element().focus();
    await expect.element(a.markAsReviewed).toHaveFocus();
    const ring = getComputedStyle(a.markAsReviewed.element());
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(
      paintContrast(a.markAsReviewed.element(), [ring.outlineColor]),
    ).toBeGreaterThanOrEqual(3);
    await userEvent.keyboard("{Enter}");
    await expectQuietReviewed(a, appearance.quiet);
    await expect.element(a.reviewedButton).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(a.confirm).toBeVisible();
    a.confirm.element().focus();
    await userEvent.keyboard("{Enter}");
    await expectWarning(a, appearance);
    await expect.element(a.markAsReviewed).toHaveFocus();
    await expectQuietReviewed(b, appearance.quiet);
  });

  test(`a partially reviewed story keeps the outstanding action beside a legible badge in ${appearance.scheme} appearance`, async () => {
    await settingsColourScheme()(appearance.scheme);
    await reviewBoard({
      answer: makeMe.aMachineAnswer
        .observingUnavailable(
          doneSessionOf(storyA, "before", 40),
          doneSessionOf(storyA, "after", 20),
        )
        .please(),
      markedAt: { [storyA.identity]: minutesAgo(30) },
    }).mount();
    const a = reviewCard(storyA.title);
    await expect.element(a.partiallyReviewed).toBeVisible();
    await userEvent.unhover(a.markAsReviewed);
    await expectWarning(a, appearance);
    expect(textContrast(a.partiallyReviewed.element())).toBeGreaterThanOrEqual(
      4.5,
    );
  });
}
