// Choosing a Recently done sessions row in Development
// (../../src/recentlyDoneSelection.ts) also shows its project's stories and
// brings what it selected into view there: a linked row's done story card, or
// a standalone row's session entry, marked selected, extending the Board's
// Recently done range when that entry stands beyond it. Development and the
// Side panel stay as they were, nothing attaches, and Intent is never opened.
// From the agent roster the Board shows instead. Selection from Intent lives
// in ./recently-done-sessions-select.spec.ts, an unanswered check and its
// supersession in ./recently-done-sessions-select-check.spec.ts and
// ./recently-done-sessions-select-supersede.spec.ts, and the narrow overlay
// case in ./recently-done-sessions-select-touch.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import {
  parts,
  rosterParts,
  sessionEntriesIn,
  standaloneSessionName,
} from "../dashboardPage.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import {
  adHoc,
  linked,
  openSelectionPage,
} from "../recentlyDoneSelectionJourney.ts";
import {
  expectDevelopmentKept,
  showReport,
} from "../recentlyDoneSelectionReport.ts";
import { pygardonCatalogRead } from "../pygardonCatalogReads.ts";
import { expectSelected } from "../storyCardSelection.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test("selecting a linked done story in Development shows its project's Board with its done card, beyond Pygardon's first ten, selected in view, keeping the report in the Side panel", async ({
  page,
  dashboard,
}) => {
  const { shown } = await openSelectionPage(page, dashboard, undefined, {
    newer: { pygardon: 10 },
  });
  const opened = await showReport(page, shown);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: linked.title,
    exact: true,
  });

  await test.step("Select shows Pygardon's Board and brings the selected done card into view", async () => {
    const read = pygardonCatalogRead(page);
    await shown.select(linked.title).click();
    await read;
    await expectProjectChoice(page, "Pygardon");
    await expect(shown.select(linked.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectSelected(card, true);
    await expect(card).toBeInViewport();
    // The keyboard stays on the row, ready to choose again.
    await expect(shown.select(linked.title)).toBeFocused();
    await expectDevelopmentKept(page, dashboard, opened);
  });

  await test.step("selecting the row again keeps the story selected and in view", async () => {
    await shown.select(linked.title).click();
    await expect(shown.select(linked.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectProjectChoice(page, "Pygardon");
    await expectSelected(card, true);
    await expect(card).toBeInViewport();
    await expectDevelopmentKept(page, dashboard, opened);
  });
});

test("selecting an older standalone session in Development reveals and marks its entry beyond Doughnut's first ten", async ({
  page,
  dashboard,
}) => {
  const { shown } = await openSelectionPage(page, dashboard, undefined, {
    newer: { doughnut: 10 },
  });
  const opened = await showReport(page, shown);
  const { recentlyDone } = parts(page);
  const entry = recentlyDone.getByRole("article", {
    name: standaloneSessionName("Ad hoc", adHoc.title),
  });

  await test.step("Select shows Doughnut's Board", async () => {
    await shown.select(adHoc.title).click();
    await expectProjectChoice(page, "Doughnut");
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  await test.step("its entry, the eleventh of Doughnut's Recently done, is shown selected and in view", async () => {
    await expect(entry).toBeInViewport();
    // The ten newer Doughnut sessions stand before it.
    await expect(sessionEntriesIn(recentlyDone).nth(10)).toHaveAccessibleName(
      standaloneSessionName("Ad hoc", adHoc.title),
    );
    await expect(entry).toHaveClass(/\bselected-session\b/);
    await expect(entry).toContainText("Selected session");
    const ring = await entry.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    expect(ring).toMatch(/inset/);
    await expectDevelopmentKept(page, dashboard, opened);
  });
});

test("selecting a standalone session from Development's agent roster shows its project's Board with the entry selected in view", async ({
  page,
  dashboard,
}) => {
  const { shown } = await openSelectionPage(page, dashboard, undefined, {
    newer: { doughnut: 10 },
    address: "/?project=open-dough&view=roster",
  });
  const { roster } = rosterParts(page);
  const { recentlyDone } = parts(page);
  await expect(roster).toBeVisible();
  await shown.select(adHoc.title).click();
  await expectProjectChoice(page, "Doughnut");
  await expect(roster).toHaveCount(0);
  const entry = recentlyDone.getByRole("article", {
    name: standaloneSessionName("Ad hoc", adHoc.title),
  });
  await expect(entry).toBeInViewport();
  await expect(entry).toHaveClass(/\bselected-session\b/);
  await expectDevelopmentKept(page, dashboard);
});
