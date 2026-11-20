// The page's reading place survives leaving Intent during a revision update.
import { onTestFinished, test, vi } from "vitest";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
  mountProjectIntent,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

test("reopening Project Intent after a failed update restores the old reading through the next attempt", async () => {
  const [before, latest] = ["fa".repeat(20), "fb".repeat(20)];
  const oldReading = featuresOpening("Archive a job");
  const newReading = featuresOpening("Purge a job");
  const problem = new ReadProblem(
    "The published settings read failed.",
    undefined,
    "transient",
  );
  let failOnReturn!: () => void;
  const pending = new Promise<void>((resolve) => {
    failOnReturn = resolve;
  });
  onTestFinished(failOnReturn);
  const readOnReturn = vi
    .fn(newReading.readLocations)
    .mockRejectedValueOnce(problem)
    .mockImplementationOnce(async () => {
      await pending;
      throw problem;
    });
  const intent = await mountProjectIntent(before, {
    [before]: oldReading,
    [latest]: { ...newReading, readLocations: readOnReturn },
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.shows("Scenario: Archive a job");

  intent.offerRevision(latest);
  const notice = await intentRevisionNotice().showLatest();
  const failure = `Revision ${shortRevision(latest)} could not be read: ${problem.message}`;
  await notice.reads(failure);

  intent.closeReading(latest);
  await browser.isClosed();
  intent.offerRevision(latest);

  await notice.reads("Updating…");
  await browser.isAt(before);
  await file.shows("Scenario: Archive a job");
  await file.isSelected();
  failOnReturn();

  await notice.reads(failure);
  await notice.offers(["Retry"]);
  await browser.isAt(before);
  await file.shows("Scenario: Archive a job");
  await browser.showsFolderExpanded(pygardonFeatures.folder);
});
