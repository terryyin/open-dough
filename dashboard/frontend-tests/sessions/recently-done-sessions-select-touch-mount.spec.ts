// On a phone's touch screen a Recently done row's Select and its Open are
// separate touch-sized controls: Select keeps the Sessions overlay and opens
// nothing; Open reads the final report in place of the overlay, and closing
// the report returns the keyboard to the Sessions button. A linked selection
// is in view once the overlay closes, while the Board still reads.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { doneCard } from "./recently-done-column-page.ts";
import { sidebarButton } from "./session-card-page.ts";
import {
  development,
  intent,
  linked,
  openSelection,
  pygardonCatalog,
  pygardonLinkedCatalog,
  report,
  terminal,
} from "./recently-done-selection-mount-page.ts";

test("on a phone's touch screen Select keeps the Sessions overlay and opens nothing, the separate Open reads the final report in its place, and closing the report gives the Sessions button the keyboard", async () => {
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

  await tap(shown.select(linked.title));
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "true");
  await expect.element(shown.sidebar).toBeVisible();
  expect(terminal().query()).toBeNull();
  expect(reportPanel.query()).toBeNull();

  await tap(shown.open(report.title));
  await expect.element(reportPanel.getByText(report.message)).toBeVisible();
  // The overlay gives way: the hidden sidebar leaves the accessibility tree.
  await expect.poll(() => shown.sidebar.query()).toBeNull();

  await tapWhereShown(
    reportPanel.getByRole("button", { name: "Close", exact: true }).element(),
  );
  await expect.poll(() => reportPanel.query()).toBeNull();
  await expect.element(sidebarButton).toHaveFocus();
});

test("at phone width a linked selection in Development is in view, selected, once the Sessions overlay closes, while the Board still reads its catalog", async () => {
  await useTouchScreen();
  const catalog = pygardonCatalog();
  catalog.answer(pygardonLinkedCatalog);
  const shown = await openSelection(
    { doneCatalog: catalog.read },
    { pygardonNewer: 6 },
  );
  await page.viewport(portrait.width, portrait.height);
  // The choice's check passes; the Board's read of the project it shows waits.
  const release = catalog.holdUntilReleased(1);
  const asked = catalog.asked();
  const choice = shown.select(linked.title).element();
  choice.scrollIntoView({ block: "center" });
  await tapWhereShown(choice);
  await expect.poll(catalog.asked).toBeGreaterThan(asked + 1);
  await expect.element(shown.sidebar).toBeVisible();
  await tapWhereShown(sidebarButton.element());
  await expect.poll(() => shown.sidebar.query()).toBeNull();
  release();
  const card = doneCard(linked.title);
  await expect.element(card).toHaveClass(/story-card-selected/);
  await expect.element(card).toBeInViewport();
  await expect.element(development()).toBeChecked();
  expect(intent().query()).toBeNull();
});
