// The frame icon-control check: what every icon-only control in the
// dashboard's frame owes a developer, whichever control it is. It is named; a
// tooltip next to it says that name (and its shortcut, where it has one) when
// the control is hovered and when it holds keyboard focus, without being
// announced again; its icon is a Lucide glyph hidden from assistive
// technology, drawn at the frame's one control and icon size; the icon stands
// out at least 3:1 from what is behind it; and keyboard focus draws an outline
// that stands out at least 3:1 from what is around the control.
//
// The check ends with the control holding keyboard focus and the pointer
// resting off every control.

/// <reference lib="dom" />

import { expect, type Locator } from "@playwright/test";
import { contrastRatio, expectReadableContrast } from "./accessibleReading.ts";
import { box } from "./pageLayout.ts";

// The frame's one control size and icon size, in CSS pixels.
const frameControlSize = 40;
const frameIconSize = 20;

export async function expectFrameIconControl(
  control: Locator,
  name: string,
  tooltip = name,
) {
  const page = control.page();
  const restOffControls = () => page.mouse.move(0, 0);
  // The tooltip is the control's neighbour that says its words.
  const tip = control.locator("xpath=..").getByText(tooltip, { exact: true });
  const icon = control.locator("svg");

  await expect(control).toHaveAccessibleName(name);
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute("aria-hidden", "true");
  await expect(icon).toHaveClass(/\blucide\b/);
  const [controlBox, iconBox] = await Promise.all([box(control), box(icon)]);
  expect(controlBox.width, `${name} width`).toBeCloseTo(frameControlSize, 0);
  expect(controlBox.height, `${name} height`).toBeCloseTo(frameControlSize, 0);
  expect(iconBox.width, `${name} icon width`).toBeCloseTo(frameIconSize, 0);
  expect(iconBox.height, `${name} icon height`).toBeCloseTo(frameIconSize, 0);

  await restOffControls();
  await control.blur();
  await expect(tip).toBeHidden();
  await expectReadableContrast(icon, 3);

  await control.hover();
  await expect(tip).toBeVisible();
  await expect(
    tip.locator("xpath=ancestor-or-self::*[@aria-hidden='true']"),
  ).toHaveCount(1);
  await expect(tip).toBeInViewport({ ratio: 1 });
  await restOffControls();
  await expect(tip).toBeHidden();

  // Reached with the keyboard, as a developer tabbing through the frame does.
  await control.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(control).toBeFocused();
  await expect(tip).toBeVisible();
  await expect(tip).toBeInViewport({ ratio: 1 });
  const focus = await control.evaluate((element) => {
    const style = getComputedStyle(element);
    let background = "rgba(0, 0, 0, 0)";
    for (
      let at = element.parentElement;
      at && (background === "rgba(0, 0, 0, 0)" || background === "transparent");
      at = at.parentElement
    ) {
      background = getComputedStyle(at).backgroundColor;
    }
    return {
      visible: element.matches(":focus-visible"),
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
      color: style.outlineColor,
      background,
    };
  });
  expect(focus.visible, `${name} shows keyboard focus`).toBe(true);
  expect(focus.style).not.toBe("none");
  expect(focus.width).toBeGreaterThanOrEqual(2);
  expect(
    contrastRatio(focus.color, focus.background),
    `${name} focus outline contrast`,
  ).toBeGreaterThanOrEqual(3);
}
