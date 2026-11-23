// The page's reading place keeps the earlier revision across an Intent remount.
import { expect, test, vi } from "vitest";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision } from "../../src/publishedWork.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
  mountProjectIntent,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

test("reopening Project Intent after a newer revision was observed restores the old reading behind the notice", async () => {
  const [before, latest] = ["ec".repeat(20), "ea".repeat(20)];
  const oldReading = featuresOpening("Archive a job");
  const newReading = featuresOpening("Purge a job");
  const readOldLocations = vi.fn(oldReading.readLocations);
  const readNewLocations = vi.fn(newReading.readLocations);
  const intent = await mountProjectIntent(before, {
    [before]: { ...oldReading, readLocations: readOldLocations },
    [latest]: { ...newReading, readLocations: readNewLocations },
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.shows("Scenario: Archive a job");

  await intent.closeReading(latest);
  await browser.isClosed();
  await intent.offerRevision(latest);

  const notice = intentRevisionNotice();
  await notice.reads(
    `New revision available — showing ${shortRevision(before)}`,
  );
  await notice.offers(["Show latest"]);
  await browser.isAt(before);
  await file.shows("Scenario: Archive a job");
  await file.isSelected();
  expect(readOldLocations).toHaveBeenCalledTimes(1);
  expect(readNewLocations).not.toHaveBeenCalled();
});
