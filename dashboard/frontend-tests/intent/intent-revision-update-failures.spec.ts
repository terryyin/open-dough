// An offered revision whose update fails keeps the shown reading with the
// failure and Retry: at the locations and at the selected file
// (../../src/useIntentLocations.ts, ../../src/useIntentFileRead.ts), and when
// the latest settings cannot be read (../../src/IntentRevisionNotice.tsx);
// malformed latest settings replace the reading with their explanation
// (../../src/IntentLocationsUnavailable.tsx). Applying the latest:
// ./intent-revision-apply.spec.ts. Companion built-app cases:
// ./intent-revision-update-outcomes.spec.ts and
// ./intent-revision-update-boundaries.spec.ts.
import { onTestFinished, test, vi } from "vitest";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision as short } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featureRead,
  featuresOpening,
  mountProjectIntent,
  type FeaturePublication,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";
import { intentSettingsExplanation } from "./intent-settings-explanation-page.ts";

const { folder, jobs, diskSpace } = pygardonFeatures;
const before = featuresOpening("Archive a job");
const after = featuresOpening("Purge a job");

async function showLatest(
  shown: string,
  latest: string,
  publication: FeaturePublication,
) {
  const intent = await mountProjectIntent(shown, {
    [shown]: before,
    [latest]: publication,
  });
  const browser = intentBrowser();
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");
  intent.offerRevision(latest);
  const notice = await intentRevisionNotice().showLatest();
  return { browser, notice, jobsReading };
}

test("a failed update keeps the shown reading with its failure and Retry, which applies the update", async () => {
  const [a, c] = ["d7".repeat(20), "eb".repeat(20)];
  const problem = new ReadProblem(
    "The published settings read failed.",
    undefined,
    "transient",
  );
  let finishLatestFileRead!: () => void;
  const latestFilePending = new Promise<void>((resolve) => {
    finishLatestFileRead = resolve;
  });
  onTestFinished(finishLatestFileRead);

  const readLatestJobs = vi
    .fn(featureRead(after, jobs))
    .mockImplementationOnce(async (signal) => {
      await latestFilePending;
      signal.throwIfAborted();
      throw new ReadProblem(
        "The published file read failed.",
        undefined,
        "transient",
      );
    });
  const { browser, notice, jobsReading } = await showLatest(a, c, {
    ...after,
    readLocations: vi.fn(after.readLocations).mockRejectedValueOnce(problem),
    files: {
      ...after.files,
      [jobs]: readLatestJobs,
    },
  });

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
  await notice.retry();
  await browser.isAt(c);
  await notice.isGone();
  await jobsReading.isFocused();
  finishLatestFileRead();
  await jobsReading.fails(
    `${jobs} could not be read at revision ${short(c)}; showing ${short(a)}. Retry`,
  );
  await jobsReading.shows("Scenario: Archive a job");
  await jobsReading.retry();
  await jobsReading.shows("Scenario: Purge a job");
  await jobsReading.failsNoMore();
});

test("an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update", async () => {
  const [a, c] = ["d8".repeat(20), "ef".repeat(20)];
  const { browser, notice, jobsReading } = await showLatest(a, c, {
    ...after,
    readLocations: vi.fn(after.readLocations).mockResolvedValueOnce({
      status: "settings-problem",
      problem: "unreadable",
      recovery: "transient",
    }),
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
});

test("an unusable settings file at the latest revision takes the reading's focus into its explanation", async () => {
  const [a, c] = ["d9".repeat(20), "ec".repeat(20)];
  const { browser } = await showLatest(a, c, {
    ...after,
    readLocations: () =>
      Promise.resolve({
        status: "settings-problem",
        problem: "malformed",
        recovery: undefined,
      }),
  });

  const explanation = intentSettingsExplanation();
  await explanation.reads("is not valid JSON");
  await explanation.hasFocus();
  await browser.isAt(c);
});
