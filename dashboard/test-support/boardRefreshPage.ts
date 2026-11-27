// The Board's confirmation note and its Refresh in the project actions row
// (../src/ProjectActions.tsx): when origin last confirmed the shown revision,
// pressing Refresh, and what the row says while that check is pending.
import { expect, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";

const actions = (page: Page) => parts(page).projectActions;
const refreshButton = (page: Page) =>
  actions(page).getByRole("button", { name: "Refresh", exact: true });
const checkedTime = (page: Page) =>
  actions(page).locator(".board-checked-at time");

// The instant the shown confirmation names, once the Board says it.
export async function boardConfirmedAt(page: Page) {
  await expect(actions(page)).toContainText("Checked");
  const at = await checkedTime(page).getAttribute("datetime");
  if (at === null) throw new Error("The Board names no confirmation time.");
  return at;
}

// From the keyboard, which reaches the button even while it is unavailable.
export async function pressBoardRefresh(page: Page) {
  await refreshButton(page).focus();
  await page.keyboard.press("Enter");
}

// While the check is pending the button stays focusable but unavailable,
// and the shown confirmation time is kept.
export async function expectBoardCheckPending(page: Page, confirmedAt: string) {
  const button = refreshButton(page);
  await expect(button).toHaveAttribute("aria-disabled", "true");
  await button.focus();
  await expect(button).toBeFocused();
  await expect(checkedTime(page)).toHaveAttribute("datetime", confirmedAt);
}

// The check settled with a later confirmation time and Refresh available.
export async function expectBoardConfirmedAfter(page: Page, earlier: string) {
  await expect(refreshButton(page)).toHaveAttribute("aria-disabled", "false");
  expect(Date.parse(await boardConfirmedAt(page))).toBeGreaterThan(
    Date.parse(earlier),
  );
}

// A Refresh that failed keeps the shown confirmation time beside the read
// failure alert, which names what stopped it, and Refresh is available again.
export async function expectBoardRefreshFailed(
  page: Page,
  confirmedAt: string,
  problemText: string,
) {
  const { problem } = parts(page);
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText(problemText);
  await expect(problem).toContainText("What is shown is the earlier snapshot");
  await expect(refreshButton(page)).toHaveAttribute("aria-disabled", "false");
  await expect(checkedTime(page)).toHaveAttribute("datetime", confirmedAt);
}

// A Refresh that published leaves no read failure alert.
export async function expectNoBoardFailure(page: Page) {
  await expect(parts(page).problem).toHaveCount(0);
}
