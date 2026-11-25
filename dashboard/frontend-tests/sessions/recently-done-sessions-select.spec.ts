// Choosing standalone Recently done sessions rows from Intent keeps the
// reading. Linked rows, their ring, heights and Development highlight are
// ./recently-done-sessions-select-intent-mount.spec.ts; real attach is
// ../../../../e2e/sessions/recently-done-sessions-select-open.spec.ts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyReviewResultEndpoint,
  type StoryReviewResult,
} from "../../src/storyReviewResult.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { takenIdentity, takenStory } from "../../test-support/launchJourney.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import { terminalPanel } from "../../test-support/terminalScreenPage.ts";
import { purposeRegion } from "../../test-support/intentPerspectivePage.ts";
import { finalReportParts } from "../../test-support/finalReportPages.ts";
import { frontendReviewIds } from "../../test-support/support/frontendStoryReview.ts";
import { pygardonCatalogRead } from "../../test-support/pygardonCatalogReads.ts";
import {
  adHoc,
  openFrontendSelectionPage,
  report,
  takenElsewhere,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";

const readSpec = "dashboard/tests/example.spec.ts";
const source = 'test("kept reading", () => {});';
const resultRevision = frontendReviewIds.head;

test("selecting standalone rows from Intent keeps the project, file, Selected story and Side panel, including a Taken story's session with no done record", async ({
  page,
  frontendServices,
}) => {
  const location = makeMe.anIntentLocation
    .at("dashboard/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(readSpec)
    .please();
  await page.route(
    ({ pathname, searchParams }) =>
      pathname === storyReviewResultEndpoint &&
      searchParams.get("source") === "open-dough" &&
      searchParams.get("identity") === takenIdentity &&
      searchParams.get("publishedHead") === resultRevision &&
      searchParams.get("tree") === frontendReviewIds.tree,
    (route) => {
      const path = new URL(route.request().url()).searchParams.get("path");
      const result: StoryReviewResult =
        path === null
          ? {
              kind: "inventory",
              revision: resultRevision,
              locations: [location],
              paths: [readSpec, "story.txt"],
            }
          : path === readSpec
            ? { kind: "text", revision: resultRevision, path, text: source }
            : { kind: "absent", revision: resultRevision, path };
      return route.fulfill({ json: result });
    },
  );
  const { shown } = await openFrontendSelectionPage(page, frontendServices);
  const { taken, intentChoice, intent } = parts(page);
  await shown.open(report.title).click();
  const opened = finalReportParts(page);
  await expect(opened.reportText).toHaveText(report.message);
  const card = taken.getByRole("article", { name: takenStory });
  await showColumn(page, "Taken");
  await emptyArea(card).click();
  await expectSelected(card, true);
  await intentChoice.click();
  const browser = intentStory(intent);
  await browser.listRevision();
  await browser.expandFolderPath("dashboard/tests");
  const file = browser.file(readSpec);
  await file.click();
  await expect(file).toHaveAttribute("aria-pressed", "true");

  const expectReadingKept = async () => {
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(file).toHaveAttribute("aria-pressed", "true");
    await expect(purposeRegion(intent)).toContainText(source);
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
  };

  await test.step("Pygardon's Taken story session, with no done record, is selected as a session", async () => {
    const read = pygardonCatalogRead(page);
    await shown.select(takenElsewhere.title).click();
    await read;
    await expect(shown.select(takenElsewhere.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.choiceStatus(takenElsewhere.title)).toHaveCount(0);
    await expectReadingKept();
  });

  await test.step("a Doughnut ad hoc session, which offers no Open, is selected as a session", async () => {
    await expect(shown.open(adHoc.title)).toHaveCount(0);
    await shown.select(adHoc.title).click();
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.select(takenElsewhere.title)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expectReadingKept();
  });
});
