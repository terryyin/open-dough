// Choosing a Recently done sessions row in the configured dashboard frame
// shows its destination: a linked row selects its project's done story in
// Development or Intent, a standalone row its session. The real terminal
// attach stays in ../../../e2e/sessions/recently-done-sessions-select-open.spec.ts.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import { compactProject } from "../navigation/dashboard-header-reading.ts";
import { doneCard } from "./recently-done-column-page.ts";
import {
  development,
  intent,
  linked,
  openSelection,
  projectShown,
  readInIntent,
  report,
  terminal,
} from "./recently-done-selection-mount-page.ts";

test("selecting a linked done row in Development shows its project's Board with its story selected and opens no terminal", async () => {
  const shown = await openSelection();
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");

  await shown.select(linked.title).click();

  await expect.element(projectShown()).toHaveAccessibleName("Pygardon");
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "true");
  await expect.element(development()).toBeChecked();
  expect(terminal().query()).toBeNull();
});

test("selecting a linked done row from Intent shows that project's story in Intent", async () => {
  const shown = await openSelection();
  await readInIntent();

  await shown.select(linked.title).click();
  await expect.element(projectShown()).toHaveAccessibleName("Pygardon");
  await expect
    .element(page.getByRole("radio", { name: "Intent", exact: true }))
    .toBeChecked();
  await expect
    .element(intent())
    .toHaveAttribute("data-selected-story", linked.identity);
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "true");
  expect(terminal().query()).toBeNull();
});

test("a linked row's Select in Development brings its selected done card, beyond Pygardon's first ten, into view and keeps it on a second Select; Tab reaches its separate Open terminal", async () => {
  const shown = await openSelection({}, { pygardonNewer: 10 });

  await shown.select(linked.title).click();
  await expect.element(projectShown()).toHaveAccessibleName("Pygardon");
  const card = doneCard(linked.title);
  await expect.element(card).toHaveClass(/story-card-selected/);
  await expect.element(card).toBeInViewport();
  await expect.element(shown.select(linked.title)).toHaveFocus();
  await shown.select(linked.title).click();
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "true");
  await expect.element(projectShown()).toHaveAccessibleName("Pygardon");
  await expect.element(card).toHaveClass(/story-card-selected/);
  await expect.element(card).toBeInViewport();

  await userEvent.tab();
  await expect.element(shown.open(linked.title)).toHaveFocus();
  await expect
    .element(shown.open(linked.title))
    .toHaveAccessibleName("Open terminal");
  await expect
    .element(shown.open(linked.title))
    .toHaveAccessibleDescription(linked.title);
});

test("selecting a linked row from the agent roster shows its Done card in Development", async () => {
  const shown = await openSelection({ view: "roster" }, { pygardonNewer: 10 });
  const roster = page.getByRole("region", { name: "Agent roster" });
  await expect.element(roster).toBeVisible();

  await shown.select(linked.title).click();

  await expect.element(projectShown()).toHaveAccessibleName("Pygardon");
  expect(roster.query()).toBeNull();
  await expect.element(doneCard(linked.title)).toBeInViewport();
});

test("selecting a linked row from Intent keeps the opened final report in the Side panel, its row current but not chosen", async () => {
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
  await shown.open(report.title).click();
  const reportPanel = page.getByRole("region", { name: "Final report" });
  await expect.element(reportPanel.getByText(report.message)).toBeVisible();
  await readInIntent();

  await shown.select(linked.title).click();

  // The open Side panel narrows the banner to its compact Project control.
  await expect.element(compactProject).toHaveValue("pygardon");
  await expect
    .element(intent())
    .toHaveAttribute("data-selected-story", linked.identity);
  await expect.element(reportPanel.getByText(report.message)).toBeVisible();
  await expect
    .element(shown.select(report.title))
    .toHaveAttribute("aria-current", "true");
  await expect
    .element(shown.select(report.title))
    .toHaveAttribute("aria-pressed", "false");
  await expect
    .element(shown.select(linked.title))
    .not.toHaveAttribute("aria-current");
  expect(terminal().query()).toBeNull();
});
