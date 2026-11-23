// A pending locations read is abandoned when the page switches projects.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
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
  const oldUpdate = featuresOpening("Purge a job");
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  const readLatest = vi.fn(async (signal: AbortSignal) => {
    await pending;
    return oldUpdate.readLocations(signal);
  });
  const other = makeMe.aPublishedWork
    .with({
      ...makeMe.aPublishedWork.ofPygardon.at(otherRevision).please(),
      source: makeMe.aPublishedSource
        .with({
          id: "doughnut",
          label: "Doughnut",
          repository: "odde/doughnut",
        })
        .please(),
    })
    .please();
  const otherFolder = "acceptance";
  const otherFile = `${otherFolder}/notes.feature`;
  const intent = await mountProjectIntent(before, {
    [before]: featuresOpening("Archive a job"),
    [latest]: { ...oldUpdate, readLocations: readLatest },
    [otherRevision]: publishedFeatures(
      {
        [otherFile]:
          "Feature: Notes\n  Scenario: Review a note\n    Then it is visible\n",
      },
      otherFolder,
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
  await expect.poll(() => readLatest.mock.calls.length).toBe(1);
  await intent.showProject(other);
  await browser.isAt(otherRevision);
  await expect.poll(() => readLatest.mock.calls[0]?.[0].aborted).toBe(true);
  release();
  await readLatest.mock.results[0]?.value;

  await notice.isGone();
  await browser.showsNoFolder(pygardonFeatures.folder);
  await browser.showsNoSource();
  const otherReading = await browser.open(otherFile);
  await otherReading.shows("Scenario: Review a note");
  await browser.isAt(otherRevision);
});
