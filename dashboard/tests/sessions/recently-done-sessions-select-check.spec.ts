// A Recently done sessions row's done-story check
// (../../src/recentlyDoneSelection.ts): an unanswered check is said apart
// from a confirmed miss and is superseded by a later choice (by navigation
// in ./recently-done-sessions-select-supersede.spec.ts); a failed one,
// one whose catalog names the story's done record unreadable, and a catalog
// gap, said in Board Recently done's words, leave the reading and the
// session's access as they were.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { routeNextReads } from "../nextActionReads.ts";
import { catalogPublications } from "../catalogProjectRecords.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import { doneRecordFileName } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { terminalPanel } from "../terminalScreenPage.ts";
import {
  adHoc,
  choiceStatus,
  linked,
  openSelectionPage,
} from "../recentlyDoneSelectionJourney.ts";
import {
  holdPygardonCatalog,
  isPygardonCatalog,
  pygardonCatalogAbandoned,
  pygardonCatalogRead,
} from "../pygardonCatalogReads.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

// The developer still reads Open Dough's Intent, with no Selected story.
async function expectReadingKept(page: Page) {
  const { intentChoice, intent } = parts(page);
  await expectProjectChoice(page, "Open Dough");
  await expect(intentChoice).toBeChecked();
  await expect(intent).not.toHaveAttribute("data-selected-story");
}

test("an unanswered check is superseded by a later choice, and a failed one leaves the reading with its session's Open usable", async ({
  page,
  dashboard,
}) => {
  // The shown rows' recurring catalog read waits for page time.
  await pausePageClockAt(page, new Date());
  const { shown, row } = await openSelectionPage(page, dashboard);
  const { development, intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(intent).toBeVisible();

  await test.step("while Pygardon's catalog is unread the row says it is checking; choosing another row abandons that read", async () => {
    const held = await holdPygardonCatalog(page);
    const abandoned = pygardonCatalogAbandoned(page);
    try {
      await shown.select(linked.title).click();
      await held.asked;
      await expect(choiceStatus(row(linked.title))).toHaveText(
        "Checking for its published done story…",
      );
      await expect(shown.select(linked.title)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await shown.select(adHoc.title).click();
      await abandoned;
    } finally {
      held.release();
    }
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.select(linked.title)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(choiceStatus(row(linked.title))).toHaveCount(0);
    await expectReadingKept(page);
    await page.unrouteAll({ behavior: "wait" });
  });

  await test.step("a failed catalog read says so apart from a miss and leaves project and story alone", async () => {
    await routeNextReads(page, isPygardonCatalog, (route) =>
      route.fulfill({
        status: 502,
        json: { error: "GitHub could not be reached." },
      }),
    );
    const read = pygardonCatalogRead(page);
    await shown.select(linked.title).click();
    await read;
    await expect(choiceStatus(row(linked.title))).toContainText(
      "Its published done story could not be checked.",
    );
    await expect(choiceStatus(row(linked.title))).toContainText(
      "Select again to check again.",
    );
    await expect(shown.select(linked.title)).toHaveAccessibleDescription(
      /could not be checked/,
    );
    await expectReadingKept(page);
  });

  await test.step("its Open still opens the session's terminal", async () => {
    await shown.open(linked.title).click();
    const terminal = terminalPanel(page);
    await expect(terminal.getByRole("heading")).toHaveText(linked.title);
    await expect(development).toBeChecked();
    await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(1);
  });
});

test("a catalog naming the story's done record unreadable, or not describing the done records, is said apart from a miss and leaves project and story alone", async ({
  page,
  dashboard,
}) => {
  // The shown rows' recurring catalog read waits for page time.
  await pausePageClockAt(page, new Date());
  const { shown, row } = await openSelectionPage(page, dashboard, undefined, {
    unreadableLinkedRecord: true,
  });
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  const expectKept = async () => {
    await expect(shown.select(linked.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectReadingKept(page);
  };

  await test.step("Pygardon's catalog names the story's done record unreadable: the row says it could not be checked, naming the record", async () => {
    const read = pygardonCatalogRead(page);
    await shown.select(linked.title).click();
    await read;
    await expect(choiceStatus(row(linked.title))).toHaveText(
      `Its published done story could not be checked. Its done record ${doneRecordFileName(linked.identity)} could not be read. Select again to check again.`,
    );
    await expectKept();
  });

  await test.step("a catalog that does not describe the done records: the row repeats Board Recently done's gap problem and repair", async () => {
    const gap = "done catalog is not published beside the 1 done records";
    await routeNextReads(page, isPygardonCatalog, (route) =>
      route.fulfill({
        json: { revision: catalogPublications.pygardon.revision, gap },
      }),
    );
    const read = pygardonCatalogRead(page);
    await shown.select(linked.title).click();
    await read;
    await expect(choiceStatus(row(linked.title))).toHaveText(
      `Its published done story could not be checked. Done stories could not be read. The done catalog does not describe the published done records: ${gap}. Run the product backlog's \`catalog-done\` to rebuild it from the done records, then publish the rebuilt catalog. Select again to check again.`,
    );
    await expectKept();
  });
});
