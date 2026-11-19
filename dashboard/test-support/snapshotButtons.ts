// Every button a shown snapshot offers, and nothing else: the banner's
// Sessions, Recent stories (when a project is selected), System settings,
// Start session, the badge legend, each Backlog card's launch actions, and
// each card's detail toggle and Notes.
import { expect, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";
import { detailToggle, storyCardLaunchActions } from "./storyCardControls.ts";

export async function expectSnapshotButtons(
  page: Page,
  shown: {
    readonly backlogCards: number;
    readonly cards: number;
  },
) {
  const button = (name: string) =>
    page.getByRole("button", { name, exact: true });
  const fixedBannerButtons = [
    button("Sessions"),
    parts(page).recentStories,
    button("System settings"),
    page.getByRole("button", { name: /^Start session in / }),
    parts(page).preparationHelp,
  ];
  for (const control of fixedBannerButtons) {
    await expect(control).toHaveCount(1);
  }
  for (const action of storyCardLaunchActions) {
    await expect(button(action)).toHaveCount(shown.backlogCards);
  }
  await expect(page.getByRole("button", { name: detailToggle })).toHaveCount(
    shown.cards,
  );
  await expect(button("Notes")).toHaveCount(shown.cards);
  await expect(page.getByRole("button")).toHaveCount(
    fixedBannerButtons.length +
      shown.backlogCards * storyCardLaunchActions.length +
      shown.cards * 2,
  );
}
