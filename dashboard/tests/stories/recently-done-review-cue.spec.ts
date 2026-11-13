// A developer scanning Recently done can distinguish the outstanding review
// action from a reviewed story in either appearance, before selecting a card.

import {
  doneCard,
  expectQuietReviewed,
  expectReviewed,
  expectReviewWarning,
  markAsReviewed,
  openRecentlyDone,
  publishDoneStories,
  storyA,
  storyB,
  unreview,
} from "../recentlyDoneReviewState.ts";
import {
  expectFocusReadable,
  setColorScheme,
} from "../systemAppearanceReading.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";

for (const appearance of [
  {
    scheme: "light",
    background: "rgb(155, 28, 28)",
    foreground: "rgb(255, 255, 255)",
    quiet: "rgb(85, 85, 79)",
    surface: "rgb(255, 255, 255)",
  },
  {
    scheme: "dark",
    background: "rgb(240, 168, 168)",
    foreground: "rgb(42, 16, 16)",
    quiet: "rgb(176, 189, 210)",
    surface: "rgb(25, 33, 48)",
  },
] as const) {
  test(`an outstanding review is a readable red action beside quiet Reviewed in ${appearance.scheme} appearance`, async ({
    page,
    origin,
  }) => {
    await setColorScheme(page, appearance.scheme);
    await publishDoneStories(page, origin);
    await openRecentlyDone(page);
    const a = doneCard(page, storyA.title);
    const b = doneCard(page, storyB.title);
    await markAsReviewed(b).click();
    await expectQuietReviewed(b, appearance.quiet, appearance.surface);
    await expectReviewWarning(a, appearance);

    await unreview(b).press("Tab");
    await expectFocusReadable(page, markAsReviewed(a));
    await markAsReviewed(a).press("Enter");
    await expectQuietReviewed(a, appearance.quiet, appearance.surface);
    await expect(unreview(a)).toBeFocused();
    await unreview(a).press("Enter");
    await expectReviewed(a, false);
    await expectReviewWarning(a, appearance);
    await expect(markAsReviewed(a)).toBeFocused();
    await expectQuietReviewed(b, appearance.quiet, appearance.surface);
  });
}
