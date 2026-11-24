// On a phone's touch screen a Recently done row's Select and its Open are
// separate touch-sized controls: Select keeps the Sessions overlay and opens
// nothing; Open reads the final report in place of the overlay.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import {
  adHocTitle,
  openSelection,
  report,
  terminal,
} from "./recently-done-selection-mount-page.ts";

test("on a phone's touch screen Select keeps the Sessions overlay and opens nothing, and the separate Open reads the final report in its place", async () => {
  await useTouchScreen();
  const shown = await openSelection(
    {
      sessions: {
        ...authenticatedSessionServices,
        readFinalReport: ({ session }) =>
          Promise.resolve({
            kind: "available",
            turnId: `${session}-turn`,
            text: report.message,
          }),
      },
    },
    { reported: true },
  );
  await page.viewport(portrait.width, portrait.height);
  const reportPanel = page.getByRole("region", { name: "Final report" });
  const tap = async (control: ReturnType<typeof shown.select>) => {
    const element = control.element();
    element.scrollIntoView({ block: "center" });
    const { width, height } = element.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
    await tapWhereShown(element);
  };

  await tap(shown.select(adHocTitle));
  await expect
    .element(shown.select(adHocTitle))
    .toHaveAttribute("aria-pressed", "true");
  await expect.element(shown.sidebar).toBeVisible();
  expect(terminal().query()).toBeNull();
  expect(reportPanel.query()).toBeNull();

  await tap(shown.open(report.title));
  await expect.element(reportPanel.getByText(report.message)).toBeVisible();
  // The overlay gives way: the hidden sidebar leaves the accessibility tree.
  await expect.poll(() => shown.sidebar.query()).toBeNull();
});
