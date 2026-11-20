// An offered revision whose update fails keeps the shown reading with the
// failure and Retry: at the locations and at the selected file
// (../../src/useIntentLocations.ts, ../../src/useIntentFileRead.ts), and when
// the latest settings cannot be read (../../src/IntentRevisionNotice.tsx);
// malformed latest settings replace the reading with their explanation
// (../../src/IntentLocationsUnavailable.tsx). Applying the latest:
// ./intent-revision-apply.spec.ts. Companion built-app cases:
// ./intent-revision-update-outcomes.spec.ts and
// ./intent-revision-update-boundaries.spec.ts.
import { createElement } from "react";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import {
  IntentReadSourceOnPage,
  type IntentReadSource,
} from "../../src/intentReadSource.ts";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { shortRevision as short } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { publishedReadService } from "./intent-revision-read-service.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";
import { intentSettingsExplanation } from "./intent-settings-explanation-page.ts";

const { folder, jobs, diskSpace } = pygardonFeatures;

// Pygardon's Project Intent on its CI status view, following `revision`.
const projectIntentAt = (revision: string, readSource: IntentReadSource) => {
  const work = makeMe.aPublishedWork.ofPygardon.at(revision).please();
  return createElement(
    IntentReadSourceOnPage,
    { value: readSource },
    createElement(ProjectIntentReading, {
      source: work.source,
      work,
      project: {
        mode: "ci",
        modeIdPrefix: "project-intent",
        onModeChange() {},
      },
      projectShown: true,
    }),
  );
};

// The jobs feature read at `shown` and offered at `latest`, whose Show latest
// waits on the held locations read at `latest`.
async function showLatestHeld(shown: string, latest: string) {
  const service = publishedReadService(
    new Map([
      [
        shown,
        makeMe.somePublishedFiles.ofPygardonFeatures
          .openingJobsWith("Archive a job")
          .please(),
      ],
      [
        latest,
        makeMe.somePublishedFiles.ofPygardonFeatures
          .openingJobsWith("Purge a job")
          .please(),
      ],
    ]),
  );
  const intent = await mountComponent(projectIntentAt(shown, service.source), {
    viewport: { width: 1280, height: 600 },
    fillsViewport: true,
  });
  const browser = intentBrowser();
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");
  intent.rerender(projectIntentAt(latest, service.source));
  const held = service.holdLocations(latest);
  const notice = await intentRevisionNotice().showLatest();
  await expect.poll(service.held).toBe(1);
  return { service, browser, notice, jobsReading, latest: held };
}

test("a failed update keeps the shown reading with its failure and Retry, which applies the update", async () => {
  const [a, c] = ["d7".repeat(20), "eb".repeat(20)];
  const { service, browser, notice, jobsReading, latest } =
    await showLatestHeld(a, c);
  await browser.isAt(a);
  const problem = new ReadProblem(
    "The published settings read failed.",
    undefined,
    "transient",
  );
  latest.fail(problem);

  // The locations at the shown revision stay browsable, with the selection,
  // its text and the focus; the failure and Retry stand beside the notice.
  await notice.reads(
    `Revision ${short(c)} could not be read: ${problem.message}`,
  );
  await notice.reads(`New revision available — showing ${short(a)}`);
  await notice.readsNo("Updating…");
  await notice.offers(["Retry"]);
  await browser.isAt(a);
  await jobsReading.shows("Scenario: Archive a job");
  await jobsReading.isSelected();
  await jobsReading.isFocused();
  await browser.showsFolderExpanded(folder);
  const diskSpaceReading = await browser.open(diskSpace);
  await diskSpaceReading.shows("Report free space");
  await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");

  // The selected file's read at the latest revision fails too: its earlier
  // text stays under the failure, and its own Retry reads it.
  const latestText = service.holdFile(jobs, c);
  await notice.retry();
  await expect.poll(service.held).toBe(2);
  await browser.isAt(c);
  await notice.isGone();
  await jobsReading.isFocused();
  latestText.fail(
    new ReadProblem("The published file read failed.", undefined, "transient"),
  );
  await jobsReading.fails(
    `${jobs} could not be read at revision ${short(c)}; showing ${short(a)}. Retry`,
  );
  await jobsReading.shows("Scenario: Archive a job");
  await browser.isAt(c);
  await jobsReading.retry();
  await jobsReading.shows("Scenario: Purge a job");
  await jobsReading.failsNoMore();
  expect(service.reads.slice(2)).toEqual([
    `locations@${c}`,
    `${diskSpace}@${a}`,
    `locations@${c}`,
    `${jobs}@${c}`,
    `${jobs}@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});

test("an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update", async () => {
  const [a, c] = ["d8".repeat(20), "ef".repeat(20)];
  const { service, browser, notice, jobsReading, latest } =
    await showLatestHeld(a, c);
  latest.answer({
    status: "settings-problem",
    problem: "unreadable",
    recovery: "transient",
  });

  await notice.reads(
    `Revision ${short(c)} could not be read: .planning/open-dough.json could not be read.`,
  );
  await notice.reads(`New revision available — showing ${short(a)}`);
  await notice.offers(["Retry"]);
  await jobsReading.shows("Scenario: Archive a job");
  await jobsReading.isSelected();
  await intentSettingsExplanation().isAbsent();
  await browser.isAt(a);

  await notice.retry();
  await jobsReading.shows("Scenario: Purge a job");
  await notice.isGone();
  await browser.isAt(c);
  expect(service.reads).toEqual([
    `locations@${a}`,
    `${jobs}@${a}`,
    `locations@${c}`,
    `locations@${c}`,
    `${jobs}@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});

test("an unusable settings file at the latest revision takes the reading's focus into its explanation", async () => {
  const [a, c] = ["d9".repeat(20), "ec".repeat(20)];
  const { service, browser, latest } = await showLatestHeld(a, c);
  latest.answer({
    status: "settings-problem",
    problem: "malformed",
    recovery: undefined,
  });

  const explanation = intentSettingsExplanation();
  await explanation.reads("is not valid JSON");
  await explanation.hasFocus();
  await browser.isAt(c);
  expect(service.unexpected).toEqual([]);
});
