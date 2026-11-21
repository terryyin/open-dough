// Equal spacing changes the horizontal axis and the placement of its medians.
import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { centreOf } from "./system-settings-usage-chart-mark.ts";
import type { UsageToolName } from "./system-settings-usage-tools-page.ts";

export function usageSpacingView(
  trend: Locator,
  drawing: () => Element | null,
  medianFor: (name: UsageToolName) => Element | undefined,
  overflowMedian: () => Element | undefined,
) {
  const control = trend.getByRole("checkbox", {
    name: "Equal spacing",
    exact: true,
  });
  const showsSpacing = async (on: boolean) => {
    if (on) await expect.element(control).toBeChecked();
    else await expect.element(control).not.toBeChecked();
  };
  const showsAxis = async (name: string, ticks: readonly string[]) => {
    await expect
      .element(trend.getByRole("img", { name, exact: true }))
      .toBeVisible();
    await expect
      .poll(() =>
        [...(drawing()?.querySelectorAll(":scope > text") ?? [])].map(
          (label) => label.textContent,
        ),
      )
      .toEqual(ticks);
  };
  return {
    async space(on: boolean, by: "pointer" | "keyboard" = "pointer") {
      await expect.element(control).toBeEnabled();
      const checkbox = control.element() as HTMLInputElement;
      if (by === "keyboard") {
        checkbox.focus();
        if (checkbox.checked !== on) await userEvent.keyboard("{Space}");
      } else if (checkbox.checked !== on) {
        await userEvent.click(control);
      }
      await showsSpacing(on);
    },
    showsSpacing,
    async showsFocusedSpacing() {
      await expect.element(control).toHaveFocus();
      expect(getComputedStyle(control.element()).outlineStyle).not.toBe("none");
    },
    showsTaskOrderAxis: () =>
      showsAxis("Token index per finished task in task order, equally spaced", [
        "Task order, earliest first",
      ]),
    showsDateAxis: (dates: readonly string[]) =>
      showsAxis("Token index per finished task by end date", dates),
    async showsMedianAt(name: UsageToolName, x: number) {
      await expect
        .poll(() => {
          const median = medianFor(name);
          return median && centreOf(median).x;
        })
        .toBeCloseTo(x, 1);
    },
    async showsOverflowMedianAt(x: number) {
      await expect
        .poll(() => {
          const median = overflowMedian();
          return median && centreOf(median).x;
        })
        .toBeCloseTo(x, 1);
    },
  };
}
