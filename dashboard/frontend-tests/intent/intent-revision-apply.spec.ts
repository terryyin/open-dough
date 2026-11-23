// Intent applies an offered published revision to an open reading: newer
// revisions wait behind one polite notice, and Show latest reads only the
// latest, keeping the old reading until it answers
// (../../src/IntentRevisionNotice.tsx, ../../src/pageIntentReading.tsx).
// Failed, unreadable and malformed-settings updates:
// ./intent-revision-update-failures.spec.ts.
// Reopening Intent: ./intent-revision-notice.spec.ts.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision as short } from "../../src/publishedWork.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
  heldAnswer,
  mountProjectIntent,
  publishedFeatures,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

const { folder, jobs, diskSpace } = pygardonFeatures;

test("newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read", async () => {
  const [a, b, c] = ["d4".repeat(20), "e7".repeat(20), "e8".repeat(20)];
  const intermediate = featuresOpening("Restore a job");
  const readIntermediateLocations = vi.fn(intermediate.readLocations);
  const latest = featuresOpening("Purge a job");
  const latestLocations = heldAnswer(latest.readLocations);
  const intent = await mountProjectIntent(a, {
    [a]: featuresOpening("Archive a job"),
    [b]: { ...intermediate, readLocations: readIntermediateLocations },
    [c]: { ...latest, readLocations: latestLocations.read },
  });
  const browser = intentBrowser();
  const notice = intentRevisionNotice();
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");
  const scrolled = await browser.scrollHalfway();

  await intent.offerRevision(b);
  await notice.reads(`New revision available — showing ${short(a)}`);
  // The notice already shows the offered action while its revision changes.
  await intent.offerRevision(c);
  await notice.isShownOnce();
  await notice.offers(["Show latest"]);
  await jobsReading.isFocused();
  expect(latestLocations.read).not.toHaveBeenCalled();

  await notice.showLatest();
  await notice.reads("Updating…");
  await browser.isAt(a);
  await jobsReading.shows("Scenario: Archive a job");
  await jobsReading.isSelected();

  latestLocations.release();
  await jobsReading.shows("Scenario: Purge a job");
  await notice.isGone();
  await browser.isAt(c);
  await browser.showsFolderExpanded(folder);
  await jobsReading.isSelected();
  await browser.isScrolledTo(scrolled);
  await jobsReading.isFocused();
  expect(readIntermediateLocations).not.toHaveBeenCalled();
});

test("a selected feature the latest revision deleted is explained, with nothing else selected", async () => {
  const [a, c] = ["d6".repeat(20), "e9".repeat(20)];
  const intent = await mountProjectIntent(a, {
    [a]: featuresOpening("Archive a job"),
    [c]: publishedFeatures(
      makeMe.somePublishedFiles.ofPygardonFeatures.withoutJobs().please(),
    ),
  });
  const browser = intentBrowser();
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");
  await intent.offerRevision(c);

  await intentRevisionNotice().showLatest();
  await browser.explains(`${jobs} is not in revision ${short(c)}`);
  await browser.listsUnselected(diskSpace);
  await browser.showsNoSource();
  await browser.hasPaneFocused();
  await browser.isAt(c);
});
