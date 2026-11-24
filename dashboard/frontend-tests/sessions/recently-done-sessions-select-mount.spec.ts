// Choosing a Recently done sessions row in the configured dashboard frame
// shows its destination: a linked row selects its project's done story in
// Development or Intent, a standalone row its session. The real terminal
// attach stays in ../../../e2e/sessions/recently-done-sessions-select-open.spec.ts.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import {
  adHocTitle,
  boardDone,
  development,
  intent,
  linked,
  openSelection,
  projectShown,
  readInIntent,
  report,
  standaloneEntry,
  takenTitle,
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

test("selecting a standalone row in Development shows its project's Board with its entry marked selected and opens no terminal", async () => {
  const shown = await openSelection();

  await shown.select(adHocTitle).click();

  await expect.element(projectShown()).toHaveAccessibleName("Doughnut");
  await expect
    .element(shown.select(adHocTitle))
    .toHaveAttribute("aria-pressed", "true");
  const entry = standaloneEntry(adHocTitle);
  await expect.element(entry).toHaveClass(/\bselected-session\b/);
  await expect.element(entry.getByText("Selected session")).toBeVisible();
  expect(terminal().query()).toBeNull();
});

test("selecting a linked done row from Intent shows that project's story in Intent; a standalone row keeps the project and Selected story", async () => {
  const shown = await openSelection();
  await readInIntent();

  await shown.select(takenTitle).click();
  await expect
    .element(shown.select(takenTitle))
    .toHaveAttribute("aria-pressed", "true");
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");
  await expect.element(intent()).not.toHaveAttribute("data-selected-story");

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
  await expect
    .element(shown.select(takenTitle))
    .toHaveAttribute("aria-pressed", "false");
  expect(terminal().query()).toBeNull();
});

test("a linked row's Select in Development brings its selected done card, beyond Pygardon's first ten, into view and keeps it on a second Select; Tab reaches its separate Open terminal, which an ad hoc row lacks", async () => {
  const shown = await openSelection({}, { pygardonNewer: 10 });

  await shown.select(linked.title).click();
  await expect.element(projectShown()).toHaveAccessibleName("Pygardon");
  const card = boardDone().getByRole("article", {
    name: linked.title,
    exact: true,
  });
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
  expect(shown.open(adHocTitle).query()).toBeNull();
});

test("selecting an older standalone session in Development reveals and marks its entry beyond Doughnut's first ten", async () => {
  const shown = await openSelection({}, { doughnutNewer: 10 });

  await shown.select(adHocTitle).click();

  await expect.element(projectShown()).toHaveAccessibleName("Doughnut");
  const entry = standaloneEntry(adHocTitle);
  await expect.element(entry).toHaveClass(/\bselected-session\b/);
  await expect.element(entry).toBeInViewport();
  await expect
    .element(boardDone().getByRole("article").nth(10))
    .toHaveAccessibleName(`Ad hoc session for ${adHocTitle}`);
});

test("selecting a standalone session from Development's agent roster shows its project's Board with the entry selected in view", async () => {
  const shown = await openSelection({ view: "roster" }, { doughnutNewer: 10 });
  const roster = page.getByRole("region", { name: "Agent roster" });
  await expect.element(roster).toBeVisible();

  await shown.select(adHocTitle).click();

  await expect.element(projectShown()).toHaveAccessibleName("Doughnut");
  expect(roster.query()).toBeNull();
  const entry = standaloneEntry(adHocTitle);
  await expect.element(entry).toHaveClass(/\bselected-session\b/);
  await expect.element(entry).toBeInViewport();
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
  await expect
    .poll(
      () =>
        page
          .getByRole("banner")
          .getByRole("button", { name: "Project" })
          .query()?.textContent,
    )
    .toBe("Pygardon");
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
