// A Recently done sessions row's done-story check
// (../../src/recentlyDoneSelection.ts): an unanswered check is said apart
// from a confirmed miss and is superseded by a later choice; a failed one
// leaves the reading and the session's access as they were.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import {
  adHoc,
  choiceStatus,
  holdPygardonCatalog,
  isPygardonCatalog,
  linked,
  openSelectionPage,
  pygardonCatalogRead,
} from "../recentlyDoneSelectionJourney.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test("an unanswered check is superseded by a later choice, and a failed one leaves the reading with its session's Open usable", async ({
  page,
  dashboard,
}) => {
  const { shown, row } = await openSelectionPage(page, dashboard);
  const { development, intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(intent).toBeVisible();

  await test.step("while Pygardon's catalog is unread the row says it is checking; choosing another row abandons that read", async () => {
    const held = await holdPygardonCatalog(page);
    const abandoned = page.waitForEvent("requestfailed", (request) =>
      isPygardonCatalog(new URL(request.url())),
    );
    try {
      await shown.entry(linked.title).click();
      await held.asked;
      await expect(choiceStatus(row(linked.title))).toHaveText(
        "Checking for its published done story…",
      );
      await expect(shown.entry(linked.title)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await shown.entry(adHoc.title).click();
      await abandoned;
    } finally {
      held.release();
    }
    await expect(shown.entry(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.entry(linked.title)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(choiceStatus(row(linked.title))).toHaveCount(0);
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await page.unrouteAll({ behavior: "wait" });
  });

  await test.step("a failed catalog read says so apart from a miss and leaves project and story alone", async () => {
    await page.route(isPygardonCatalog, (route) =>
      route.fulfill({
        status: 502,
        json: { error: "GitHub could not be reached." },
      }),
    );
    const read = pygardonCatalogRead(page);
    await shown.entry(linked.title).click();
    await read;
    await expect(choiceStatus(row(linked.title))).toContainText(
      "Its published done story could not be checked.",
    );
    await expect(choiceStatus(row(linked.title))).toContainText(
      "Select again to check again.",
    );
    await expect(shown.entry(linked.title)).toHaveAccessibleDescription(
      /could not be checked/,
    );
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(intent).not.toHaveAttribute("data-selected-story");
  });

  await test.step("its Open still opens the session's terminal", async () => {
    await shown.open(linked.title).click();
    const terminal = page.getByRole("region", { name: "Terminal" });
    await expect(terminal.getByRole("heading")).toHaveText(linked.title);
    await expect(development).toBeChecked();
    await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(1);
  });
});
