// Intent applies an offered published revision to an open reading: newer
// revisions wait behind one polite notice, and Show latest reads only the
// latest, keeping the old reading until it answers
// (../../src/IntentRevisionNotice.tsx, ../../src/pageIntentReading.tsx).
// Failed, unreadable and malformed-settings updates:
// ./intent-revision-update-failures.spec.ts.
// Companion built-app case: ./intent-revision-notice.spec.ts.
import { createElement } from "react";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { shortRevision as short } from "../../src/publishedWork.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { publishedReadService } from "./intent-revision-read-service.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

const { folder, jobs, diskSpace } = pygardonFeatures;
const featuresOpening = (scenario: string) =>
  makeMe.somePublishedFiles.ofPygardonFeatures
    .openingJobsWith(scenario)
    .please();

// Pygardon's Project Intent on its CI status view, following `revision`.
const projectIntentAt = (revision: string) => {
  const work = makeMe.aPublishedWork.ofPygardon.at(revision).please();
  return createElement(ProjectIntentReading, {
    source: work.source,
    work,
    project: { mode: "ci", modeIdPrefix: "project-intent", onModeChange() {} },
    projectShown: true,
  });
};
const desktop = { viewport: { width: 1280, height: 600 }, fillsViewport: true };

test("newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read", async () => {
  const [a, b, c] = ["d4".repeat(20), "e7".repeat(20), "e8".repeat(20)];
  const service = publishedReadService(
    new Map([
      [a, featuresOpening("Archive a job")],
      [b, featuresOpening("Restore a job")],
      [c, featuresOpening("Purge a job")],
    ]),
  );
  const intent = await mountComponent(projectIntentAt(a), desktop);
  const browser = intentBrowser();
  const notice = intentRevisionNotice();
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");
  const scrolled = await browser.scrollHalfway();
  await browser.isAt(a);
  expect(service.reads).toEqual([`locations@${a}`, `${jobs}@${a}`]);

  intent.rerender(projectIntentAt(b));
  intent.rerender(projectIntentAt(c));
  await notice.isShownOnce();
  await notice.reads(`New revision available — showing ${short(a)}`);
  await notice.offers(["Show latest"]);
  await browser.isAt(a);
  await jobsReading.isFocused();
  await jobsReading.shows("Scenario: Archive a job");
  await browser.showsFolderExpanded(folder);
  await jobsReading.isSelected();
  await browser.isScrolledTo(scrolled);
  expect(service.reads).toHaveLength(2);

  const latest = service.holdRead(`locations@${c}`);
  await notice.showLatest();
  await expect.poll(service.held).toBe(1);
  await notice.reads("Updating…");
  await browser.isAt(a);
  await jobsReading.shows("Scenario: Archive a job");
  await jobsReading.isSelected();

  latest.release();
  await jobsReading.shows("Scenario: Purge a job");
  await notice.isGone();
  await browser.isAt(c);
  await browser.showsFolderExpanded(folder);
  await jobsReading.isSelected();
  await browser.isScrolledTo(scrolled);
  await jobsReading.isFocused();
  expect(service.reads.slice(2)).toEqual([`locations@${c}`, `${jobs}@${c}`]);
  expect(service.unexpected).toEqual([]);
});

test("a selected feature the latest revision deleted is explained, with nothing else selected", async () => {
  const [a, c] = ["d6".repeat(20), "e9".repeat(20)];
  const service = publishedReadService(
    new Map([
      [a, featuresOpening("Archive a job")],
      [c, makeMe.somePublishedFiles.ofPygardonFeatures.withoutJobs().please()],
    ]),
  );
  const intent = await mountComponent(projectIntentAt(a), desktop);
  const browser = intentBrowser();
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");
  intent.rerender(projectIntentAt(c));

  await intentRevisionNotice().showLatest();
  await browser.explains(`${jobs} is not in revision ${short(c)}`);
  await browser.listsUnselected(diskSpace);
  await browser.showsNoSource();
  await browser.hasPaneFocused();
  await browser.isAt(c);
  expect(service.reads).toEqual([
    `locations@${a}`,
    `${jobs}@${a}`,
    `locations@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});
