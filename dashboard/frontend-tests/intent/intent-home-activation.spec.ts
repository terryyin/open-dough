// With a newer revision waiting behind its notice, directly activating Project
// Intent's CI status tab (../../src/IntentPage.tsx) returns home, keeping that
// notice and the shown revision and reading nothing newer. Activation within
// a story's or the project's scope: ./intent-home-activation-scope.spec.ts.
import { expect, test, vi } from "vitest";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision } from "../../src/publishedWork.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { activateChosenCiTab } from "./intent-ci-homepage-page.ts";
import {
  featuresOpening,
  mountProjectIntent,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

test("with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision", async () => {
  const [shown, latest] = ["ed".repeat(20), "eb".repeat(20)];
  const shownReading = featuresOpening("Archive a job");
  const latestReading = featuresOpening("Purge a job");
  const readShownLocations = vi.fn(shownReading.readLocations);
  const readLatestLocations = vi.fn(latestReading.readLocations);
  const intent = await mountProjectIntent(shown, {
    [shown]: { ...shownReading, readLocations: readShownLocations },
    [latest]: { ...latestReading, readLocations: readLatestLocations },
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.isSelected();
  await intent.offerRevision(latest);
  const waiting = `New revision available — showing ${shortRevision(shown)}`;
  const notice = intentRevisionNotice();
  await notice.reads(waiting);

  await activateChosenCiTab("click");

  await browser.listsUnselected(pygardonFeatures.jobs);
  await notice.isShownOnce();
  await notice.reads(waiting);
  await notice.offers(["Show latest"]);
  await browser.isAt(shown);
  expect(readShownLocations).toHaveBeenCalledTimes(1);
  expect(readLatestLocations).not.toHaveBeenCalled();
});
