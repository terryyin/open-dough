// Accepting a newer revision still advances the browser when its files are
// unchanged and no file is selected.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { intentBrowser } from "./intent-browser-page.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import {
  featuresOpening,
  heldAnswer,
  mountProjectIntent,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

test("a planning-only update advances the browser with no file selected and keeps the new reading on reopen", async () => {
  const [before, latest] = ["f1".repeat(20), "f0".repeat(20)];
  const publication = featuresOpening("Archive a job");
  const latestLocations = heldAnswer(publication.readLocations);
  const intent = await mountProjectIntent(before, {
    [before]: publication,
    [latest]: { ...publication, readLocations: latestLocations.read },
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.shows("Scenario: Archive a job");
  const home = intentViewTab("CI status");
  await userEvent.click(home);
  await browser.showsNoSource();

  await intent.offerRevision(latest);
  const notice = intentRevisionNotice();
  await notice.showLatest();
  await notice.reads("Updating…");
  await browser.isAt(before);
  await expect.element(home).toHaveAttribute("aria-selected", "true");
  latestLocations.release();

  await browser.isAt(latest);
  await notice.isGone();
  await browser.showsNoSource();
  const updated = await browser.open(pygardonFeatures.jobs);
  await updated.shows("Scenario: Archive a job");

  await intent.closeReading(latest);
  await browser.isClosed();
  await intent.offerRevision(latest);
  await browser.isAt(latest);
  await file.shows("Scenario: Archive a job");
  await file.isSelected();
  expect(latestLocations.read).toHaveBeenCalledTimes(1);
});
