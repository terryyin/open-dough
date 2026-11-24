// A linked Recently done row chosen from Intent: its chosen row wears the
// inset ring at the same height as an ad hoc row, and Development then
// highlights that story's done card. The real terminal reopening stays in
// ../../../e2e/sessions/recently-done-sessions-select-open.spec.ts.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { doneCard } from "./recently-done-column-page.ts";
import {
  adHocTitle,
  development,
  intent,
  linked,
  openSelection,
  readInIntent,
} from "./recently-done-selection-mount-page.ts";

test("a linked row chosen from Intent wears an inset ring at an ad hoc row's height, and Development highlights its done card", async () => {
  const shown = await openSelection();
  await readInIntent();
  const heightOf = (title: string) =>
    shown.row(title)?.getBoundingClientRect().height;
  expect(heightOf(linked.title)).toBe(heightOf(adHocTitle));

  await shown.select(linked.title).click();
  await expect
    .element(intent())
    .toHaveAttribute("data-selected-story", linked.identity);
  await userEvent.unhover(shown.select(linked.title));
  await expect
    .poll(() => shown.row(linked.title)?.className)
    .toMatch(/\bchosen\b/);
  const row = shown.row(linked.title);
  if (row === undefined) throw new Error("No linked row.");
  expect(getComputedStyle(row).boxShadow).toMatch(/inset/);

  await development().click();
  await expect
    .element(doneCard(linked.title))
    .toHaveClass(/story-card-selected/);
  expect(
    page.getByRole("main", { name: "Intent", exact: true }).query(),
  ).toBeNull();
});
