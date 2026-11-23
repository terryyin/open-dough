// A failed locations update keeps the shown reading with the failure and Retry
// (../../src/useIntentLocations.ts, ../../src/IntentRevisionNotice.tsx);
// malformed latest settings replace the reading with their explanation
// (../../src/IntentLocationsUnavailable.tsx). Applying the latest:
// ./intent-revision-apply.spec.ts. File Retry across revisions:
// ./intent-source-target-recovery.spec.ts.
import { test, vi } from "vitest";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { shortRevision as short } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
  mountProjectIntent,
  type FeaturePublication,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";
import { intentSettingsExplanation } from "./intent-settings-explanation-page.ts";

const { jobs, diskSpace } = pygardonFeatures;
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
  await intent.offerRevision(latest);
  const notice = await intentRevisionNotice().showLatest();
  return { browser, notice, jobsReading };
}

test("after a failed locations update, the old tree stays usable and Retry applies the new revision", async () => {
  const [a, c] = ["d7".repeat(20), "eb".repeat(20)];
  const problem = new ReadProblem(
    "The published settings read failed.",
    undefined,
    "transient",
  );
  const intent = await mountProjectIntent(a, {
    [a]: before,
    [c]: {
      ...after,
      readLocations: vi.fn(after.readLocations).mockRejectedValueOnce(problem),
    },
  });
  const browser = intentBrowser();
  const diskSpaceReading = await browser.open(diskSpace);
  await diskSpaceReading.shows("Report free space");
  await intent.offerRevision(c);
  const notice = await intentRevisionNotice().showLatest();

  await notice.reads(
    `Revision ${short(c)} could not be read: ${problem.message}`,
  );
  await browser.isAt(a);
  await diskSpaceReading.shows("Report free space");
  const jobsReading = await browser.open(jobs);
  await jobsReading.shows("Scenario: Archive a job");

  await notice.retry();
  await jobsReading.shows("Scenario: Purge a job");
  await browser.isAt(c);
  await notice.isGone();
  await jobsReading.isFocused();
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
