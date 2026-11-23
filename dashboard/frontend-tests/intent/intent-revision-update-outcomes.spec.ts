// The page's reading place survives leaving Intent during a revision update.
import { test, vi } from "vitest";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
  heldAnswer,
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
  const retryOnReturn = heldAnswer(() => Promise.reject(problem));
  const readOnReturn = vi
    .fn(newReading.readLocations)
    .mockRejectedValueOnce(problem)
    .mockImplementationOnce(retryOnReturn.read);
  const intent = await mountProjectIntent(before, {
    [before]: oldReading,
    [latest]: { ...newReading, readLocations: readOnReturn },
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.shows("Scenario: Archive a job");

  await intent.offerRevision(latest);
  const notice = await intentRevisionNotice().showLatest();
  const failure = `Revision ${shortRevision(latest)} could not be read: ${problem.message}`;
  await notice.reads(failure);

  await intent.closeReading(latest);
  await browser.isClosed();
  await intent.offerRevision(latest);

  await notice.reads("Updating…");
  await browser.isAt(before);
  await file.shows("Scenario: Archive a job");
  await file.isSelected();
  retryOnReturn.release();

  await notice.reads(failure);
  await notice.offers(["Retry"]);
  await browser.isAt(before);
  await file.shows("Scenario: Archive a job");
  await browser.showsFolderExpanded(pygardonFeatures.folder);
});
