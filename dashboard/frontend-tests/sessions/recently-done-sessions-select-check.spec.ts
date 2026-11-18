// A Recently done sessions row's done-story check: unanswered checking is said
// apart from a miss and superseded by a later choice; failed catalog answers
// leave reading and Open usable.
import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { routeNextReads } from "../../test-support/nextActionReads.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { terminalPanel } from "../../test-support/terminalScreenPage.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendServiceSubstitutes.ts";
import {
  holdPygardonCatalog,
  isPygardonCatalog,
  pygardonCatalogAbandoned,
  pygardonCatalogRead,
} from "../../test-support/pygardonCatalogReads.ts";
import {
  adHoc,
  linked,
  openFrontendSelectionPage,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";
import { frontendRevision } from "../../test-support/support/frontendServiceState.ts";

async function expectReadingKept(page: Page) {
  const { intentChoice, intent } = parts(page);
  await expectProjectChoice(page, "Open Dough");
  await expect(intentChoice).toBeChecked();
  await expect(intent).not.toHaveAttribute("data-selected-story");
}

test("an unanswered check is superseded by a later choice, and a failed one leaves the reading with its session's Open usable", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  await installAttachedTerminalSubstitute(page);
  const { shown } = await openFrontendSelectionPage(page, frontendServices);
  const { development, intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(intent).toBeVisible();

  await test.step("while Pygardon's catalog is unread the row says it is checking; choosing another row abandons that read", async () => {
    const held = await holdPygardonCatalog(page);
    const abandoned = pygardonCatalogAbandoned(page);
    try {
      await shown.select(linked.title).click();
      await held.asked;
      await expect(shown.choiceStatus(linked.title)).toHaveText(
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
    await expect(shown.choiceStatus(linked.title)).toHaveCount(0);
    await expectReadingKept(page);
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
    await expect(shown.choiceStatus(linked.title)).toContainText(
      "Its published done story could not be checked.",
    );
    await expect(shown.choiceStatus(linked.title)).toContainText(
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
  });
});

test("a catalog naming the story's done record unreadable, or not describing the done records, is said apart from a miss and leaves project and story alone", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  const { shown } = await openFrontendSelectionPage(page, frontendServices, {
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
    await expect(shown.choiceStatus(linked.title)).toHaveText(
      `Its published done story could not be checked. Its done record ${doneRecordFileName(linked.identity)} could not be read. Select again to check again.`,
    );
    await expectKept();
  });

  await test.step("a catalog that does not describe the done records: the row repeats Board Recently done's gap problem and repair", async () => {
    const gap = "done catalog is not published beside the 1 done records";
    await routeNextReads(page, isPygardonCatalog, (route) =>
      route.fulfill({
        json: { revision: frontendRevision, gap },
      }),
    );
    const read = pygardonCatalogRead(page);
    await shown.select(linked.title).click();
    await read;
    await expect(shown.choiceStatus(linked.title)).toHaveText(
      `Its published done story could not be checked. Done stories could not be read. The done catalog does not describe the published done records: ${gap}. Run the product backlog's \`catalog-done\` to rebuild it from the done records, then publish the rebuilt catalog. Select again to check again.`,
    );
    await expectKept();
  });
});
