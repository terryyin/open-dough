import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { focusedAndVisible } from "./board-accessibility.ts";
import {
  button,
  divider,
  drag,
  keyStep,
  measured,
  minimum,
  mountWidthTerminal,
  movePointer,
  openTerminal,
  panel,
  press,
  widthIs,
  withWidthStorage,
} from "./side-panel-width-view.ts";

test("mouse and keyboard choose one bounded panel width", async () => {
  withWidthStorage();
  await mountWidthTerminal();
  await expect.element(divider).toBeVisible();
  const first = measured();
  const room = first.page.width + first.panel.width;
  const half = Math.round(room / 2);
  const maximum = Math.floor(room - minimum);
  await widthIs(half);
  await expect.element(divider).toHaveAttribute("aria-orientation", "vertical");
  await expect
    .element(divider)
    .toHaveAttribute("aria-valuemin", String(minimum));
  await expect
    .element(divider)
    .toHaveAttribute("aria-valuemax", String(maximum));
  expect(first.page.right).toBeCloseTo(first.panel.left, 0);

  const released = await drag(-200);
  await widthIs(half + 200);
  expect(measured().page.width).toBeCloseTo(room - half - 200, 0);
  await movePointer({ x: released.x - 150, y: released.y });
  await widthIs(half + 200);
  await drag(-2000);
  await widthIs(maximum);
  expect(measured().page.width).toBeGreaterThanOrEqual(minimum - 0.5);
  await drag(2000);
  await widthIs(minimum);
  await expect.element(button("Close")).toBeVisible();
  await expect.element(panel.getByRole("heading", { level: 2 })).toBeVisible();
  await drag(-300, true);
  await widthIs(minimum);

  const firstControl = panel.getByRole("button").first().element();
  if (!(firstControl instanceof HTMLElement))
    throw new Error("The first panel control cannot be focused.");
  firstControl.focus();
  await userEvent.tab({ shift: true });
  focusedAndVisible(divider.element());
  const before = location.href;
  await press("ArrowLeft");
  await widthIs(minimum + keyStep);
  await press("ArrowRight", 2);
  await widthIs(minimum);
  await press("ArrowLeft", 40);
  await widthIs(maximum);
  await press("ArrowRight", 8);
  const chosen = maximum - 8 * keyStep;
  await widthIs(chosen);
  expect(location.href).toBe(before);
  await expect.element(divider).toHaveFocus();

  await button("Maximize").click();
  await expect.element(divider).not.toBeInTheDocument();
  expect(measured().panel.width).toBeCloseTo(room, 0);
  await button("Restore").click();
  await widthIs(chosen);
  await button("Close").click();
  await expect.element(panel).not.toBeInTheDocument();
  await openTerminal();
  await widthIs(chosen);
});
