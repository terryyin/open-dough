// A pending locations read is abandoned when the page switches projects.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { intentBrowser } from "./intent-browser-page.ts";
import { doughnutSource } from "./intent-ci-homepage-page.ts";
import {
  featuresOpening,
  heldAnswer,
  mountProjectIntent,
  publishedFeatures,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

test("switching projects during an update abandons the pending read and keeps the new project's reading", async () => {
  const [before, latest, otherRevision] = [
    "ed".repeat(20),
    "ee".repeat(20),
    "ef".repeat(20),
  ];
  const update = featuresOpening("Purge a job");
  const latestLocations = heldAnswer(update.readLocations);
  const otherFile = "acceptance/notes.feature";
  const intent = await mountProjectIntent(before, {
    [before]: featuresOpening("Archive a job"),
    [latest]: { ...update, readLocations: latestLocations.read },
    [otherRevision]: publishedFeatures(
      {
        [otherFile]:
          "Feature: Notes\n  Scenario: Review a note\n    Then it is visible\n",
      },
      "acceptance",
    ),
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.shows("Scenario: Archive a job");

  await intent.offerRevision(latest);
  const notice = intentRevisionNotice();
  await notice.showLatest();
  await notice.reads("Updating…");
  await browser.isAt(before);
  await expect.poll(() => latestLocations.read.mock.calls.length).toBe(1);
  await intent.showProject(
    makeMe.aPublishedWork.of(doughnutSource).at(otherRevision).please(),
  );
  await browser.isAt(otherRevision);
  await expect
    .poll(() => latestLocations.read.mock.calls[0]?.[0].aborted)
    .toBe(true);
  latestLocations.release();
  await latestLocations.read.mock.results[0]?.value;

  await notice.isGone();
  await browser.showsNoFolder(pygardonFeatures.folder);
  await browser.showsNoSource();
  const otherReading = await browser.open(otherFile);
  await otherReading.shows("Scenario: Review a note");
  await browser.isAt(otherRevision);
});
