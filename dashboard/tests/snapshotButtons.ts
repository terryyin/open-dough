// Every button a shown snapshot offers, and nothing else: the banner's
// Sessions, System settings, Start session, the badge legend, each Backlog
// card's launch actions, and each card's detail toggle and Notes.
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
  await expect(button("Sessions")).toHaveCount(1);
  await expect(button("System settings")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: /^Start session in / }),
  ).toHaveCount(1);
  await expect(parts(page).preparationHelp).toHaveCount(1);
  for (const action of storyCardLaunchActions) {
    await expect(button(action)).toHaveCount(shown.backlogCards);
  }
  await expect(page.getByRole("button", { name: detailToggle })).toHaveCount(
    shown.cards,
  );
  await expect(button("Notes")).toHaveCount(shown.cards);
  await expect(page.getByRole("button")).toHaveCount(
    4 + shown.backlogCards * storyCardLaunchActions.length + shown.cards * 2,
  );
}
