// Procedural Side panel frame operations, shared by width, touch and fluent
// journeys. Inputs and expected geometry remain with their callers.
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { box } from "./partArrangement.ts";
import { pressWhereShown, tapWhereShown } from "./controlReachability.ts";

export const panelDivider = (
  within: Page | Locator,
  { exact = true }: { exact?: boolean } = {},
) => within.getByRole("separator", { name: "Panel divider", exact });

export const control = (panel: Locator, name: string) =>
  panel.getByRole("button", { name, exact: true });

// What a Side panel content's header (a Terminal or Final report) names: its
// story title and its session's name, and where a session id would show,
// which the header leaves out.
export function sidePanelNamesOf(content: Locator) {
  const names = content.locator(".side-panel-names");
  return {
    names,
    sessionName: names.locator("p"),
    shownSessionId: names.locator("code"),
  };
}

type FramePointer = "mouse" | "touch" | "click";

export async function maximizeSidePanel(
  panel: Locator,
  using: FramePointer = "mouse",
) {
  const maximize = control(panel, "Maximize");
  if (using === "touch") await tapWhereShown(maximize);
  else if (using === "click") await maximize.click();
  else await pressWhereShown(maximize);
}

export async function restoreSidePanel(
  panel: Locator,
  using: FramePointer = "mouse",
) {
  const restore = control(panel, "Restore");
  if (using === "touch") await tapWhereShown(restore);
  else if (using === "click") await restore.click();
  else await pressWhereShown(restore);
}

// Close only presses the control; its caller owns the resulting observation.
// Keep keyboard activation and
// pointer-at-shown-position distinct from a locator click, which may scroll.
export async function closeSidePanel(
  panel: Locator,
  input:
    | { using: "keyboard"; key: string }
    | { using: "mouse" | "pointer" | "touch" } = { using: "mouse" },
) {
  const close = control(panel, "Close");
  if (input.using === "keyboard") {
    await close.focus();
    await panel.page().keyboard.press(input.key);
  } else if (input.using === "pointer") await pressWhereShown(close);
  else if (input.using === "touch") await tapWhereShown(close);
  else await close.click();
}

// Resizes the window and waits for the page to arrange the panel for it:
// covering the page column in a window up to 800px wide (side-panel.css),
// beside the page with its resize divider otherwise. The page arranges on the
// frame after the resize, so a measurement taken, or a finger placed, before
// that frame would take the previous arrangement's places in the new window.
export async function resizeUntilArranged(
  panel: Locator,
  view: { readonly width: number; readonly height: number },
) {
  await panel.page().setViewportSize(view);
  const divider = panelDivider(panel);
  if (view.width > 800) await expect(divider).toBeVisible();
  else await expect(divider).toHaveCount(0);
}

// Whether the open panel covers the page column (no usable split).
export async function expectCovering(panel: Locator) {
  await expect
    .poll(() =>
      panel.evaluate(
        (element) =>
          element.parentElement?.classList.contains("page-covering") === true &&
          element.parentElement.classList.contains("page-maximized"),
      ),
    )
    .toBe(true);
  await expect(control(panel, "Maximize")).toHaveCount(0);
  await expect(control(panel, "Restore")).toHaveCount(0);
  await expect(panelDivider(panel)).toHaveCount(0);
}

// Narrow-window covering: the panel fills the viewport and hides banner/Board.
export async function expectCoveringFillsWindow(
  panel: Locator,
  pageParts: { readonly banner: Locator; readonly board: Locator },
) {
  await expectCovering(panel);
  const viewport = await panel.page().evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));
  const shown = await box(panel);
  expect(shown.width).toBeCloseTo(viewport.width, 0);
  expect(shown.height).toBeCloseTo(viewport.height, 0);
  await expect(pageParts.banner).toBeHidden();
  await expect(pageParts.board).toBeHidden();
}

// Tab and tap stay on the covering panel; the Board is not reachable behind it.
export async function expectBoardUnreachableBehindCovering(
  panel: Locator,
  board: Locator,
) {
  await control(panel, "Close").focus();
  await panel.page().keyboard.press("Tab");
  await expect(board).toBeHidden();
  expect(
    await panel.page().evaluate(() => {
      const active = document.activeElement;
      return active !== null && active.closest(".side-panel") !== null;
    }),
  ).toBe(true);
  expect(
    await panel.page().evaluate(() => {
      const target = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight * 0.75,
      );
      return target?.closest(".side-panel") !== null;
    }),
  ).toBe(true);
}
