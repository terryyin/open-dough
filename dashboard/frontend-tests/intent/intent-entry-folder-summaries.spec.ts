// Intent location and folder toggles open or close without moving selection,
// while names select a Summary of the scope's file count and immediate
// children, on the page's Intent body (./intent-ci-page-mount.ts,
// ../../src/IntentFileTree.tsx, ../../src/StoryReviewFileTree.tsx,
// ../../src/IntentSummary.tsx). Summary CI proof:
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { fixtureFor } from "./intent-revision-fixtures.ts";
import { intentScopeTree } from "./intent-scope-tree-page.ts";

const featuresPath = "e2e_test/features";
const packagedPath = "e2e_test/packaged/features";
const jobsFolder = `${featuresPath}/jobs`;
const reportsFolder = `${featuresPath}/reports`;
const stooqPath = `${jobsFolder}/stooq_refresh.feature`;
const topFeaturePath = `${featuresPath}/disk_space.feature`;

const files: Readonly<Record<string, string>> = {
  [stooqPath]: "Feature: Stooq refresh\n  Scenario: Refresh quotes\n",
  [`${jobsFolder}/batch.feature`]: "Feature: Batch jobs\n  Scenario: Run\n",
  [`${reportsFolder}/status.feature`]: "Feature: Status report\n",
  [topFeaturePath]: "Feature: Disk space\n  Scenario: Report free space\n",
  [`${packagedPath}/packaged.feature`]: "Feature: Packaged\n",
};

// Pygardon's Intent body over a features location of four files in `jobs/`,
// `reports/` and at its top, beside a packaged location of one file.
async function mountScopeTree() {
  const work = makeMe.aPublishedWork
    .of(makeMe.aPublishedSource.pygardon.please())
    .at("d4".repeat(20))
    .please();
  const under = (location: string) =>
    Object.keys(files).filter((path) => path.startsWith(`${location}/`));
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(featuresPath)
        .ofKind("gherkin")
        .selecting(...under(featuresPath))
        .please(),
      makeMe.anIntentLocation
        .at(packagedPath)
        .ofKind("gherkin")
        .selecting(...under(packagedPath))
        .please(),
    )
    .please();
  const intent: IntentReadSource = {
    readLocations: (...[, revision]) => {
      expect(revision).toBe(work.revision);
      return Promise.resolve(locations);
    },
    readFile: (...[, path, revision]) => {
      expect(revision).toBe(work.revision);
      return Promise.resolve(fixtureFor(files, path));
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  await mountIntentCiPage({ work, reads: { intent, ci: unreadCiReads } });
  const tree = intentScopeTree();
  await tree.toggle("e2e_test").click();
  await tree.toggle("packaged").click();
  return tree;
}

test("location names select a Summary of their files without opening, while toggles open or close without moving selection", async () => {
  const tree = await mountScopeTree();
  const features = tree.toggle(featuresPath);
  const featuresName = tree.name(featuresPath);
  const packaged = tree.toggle(packagedPath);
  const packagedName = tree.name(packagedPath);

  await features.isExpanded(false);
  await featuresName.click();
  await features.isExpanded(false);
  await featuresName.isSelected(true);
  await tree.summarizes(featuresPath, "4 files");
  await tree.summaryLists(["jobs/", "reports/", "disk_space.feature"]);
  await tree.showsNoPurpose();

  // A toggle leaves selection in place, and selecting the same name keeps disclosure.
  await features.click();
  await features.isExpanded(true);
  await featuresName.isSelected(true);
  await tree.summarizes(featuresPath);
  await featuresName.click();
  await features.isExpanded(true);
  await featuresName.isSelected(true);
  await tree.summarizes("4 files");

  // A closed location's name selects it while another stays open.
  await packaged.isExpanded(false);
  await packagedName.click();
  await packaged.isExpanded(false);
  await features.isExpanded(true);
  await packagedName.isSelected(true);
  await tree.summarizes(packagedPath, "1 file");
  await packaged.click();
  await packaged.isExpanded(true);
  await features.isExpanded(true);
  await tree.summarizes(packagedPath);
});

test("folders start collapsed, and folder names select a Summary of their files while toggles open or close without moving selection", async () => {
  const tree = await mountScopeTree();
  const featuresName = tree.name(featuresPath);
  const jobs = tree.toggle("jobs");
  const jobsName = tree.name("jobs");
  const reportsName = tree.name("reports");
  await tree.toggle(featuresPath).click();

  // With no story selected, every folder of the opened location starts collapsed.
  await jobs.isExpanded(false);
  await tree.toggle("reports").isExpanded(false);
  await tree.hidesFile(stooqPath);
  await intentBrowser().listsUnselected(topFeaturePath);

  await featuresName.click();
  await jobs.click();
  await jobs.isExpanded(true);
  await tree.summarizes(featuresPath);
  await featuresName.isSelected(true);
  await jobs.click();
  await jobs.isExpanded(false);
  await tree.summarizes(featuresPath);
  await jobs.click();

  // Selecting either folder name preserves its disclosure.
  await jobsName.isSelected(false);
  await jobsName.click();
  await jobsName.isSelected(true);
  await jobs.isExpanded(true);
  await tree.summarizes(jobsFolder, "2 files");
  await tree.summaryLists(["batch.feature", "stooq_refresh.feature"]);
  await featuresName.isSelected(false);
  await jobsName.click();
  await jobsName.isSelected(true);
  await jobs.isExpanded(true);
  await tree.summarizes(jobsFolder, "2 files");

  await reportsName.click();
  await reportsName.isSelected(true);
  await jobsName.isSelected(false);
  await tree.summarizes(reportsFolder, "1 file");
  await tree.summaryExcludes(jobsFolder);
});

test("location and folder controls work by keyboard", async () => {
  const tree = await mountScopeTree();
  const features = tree.toggle(featuresPath);
  const reports = tree.toggle("reports");
  await features.click();
  await reports.click();
  await tree.name("reports").click();

  await features.press("{Enter}");
  await features.isExpanded(false);
  await features.press(" ");
  await features.isExpanded(true);
  await tree.summarizes(reportsFolder);
  await reports.press("{Enter}");
  await reports.isExpanded(false);
  await reports.press(" ");
  await reports.isExpanded(true);
  await (await tree.openFile(topFeaturePath)).shows("Feature: Disk space");
  await tree.name("jobs").press("{Enter}");
  await tree.name("jobs").isSelected(true);
  await tree.summarizes(jobsFolder);
  await tree.name(featuresPath).press("{Enter}");
  await tree.name(featuresPath).isSelected(true);
  await tree.summarizes(featuresPath);
});

test("a file's Purpose stays while a toggle opens another location, and the closed location's name then selects its Summary", async () => {
  const tree = await mountScopeTree();
  const features = tree.toggle(featuresPath);
  const packaged = tree.toggle(packagedPath);
  await features.click();
  await tree.toggle("jobs").click();
  await tree.name("jobs").click();

  const stooq = await tree.openFile(stooqPath);
  await stooq.shows("Feature: Stooq refresh");
  await tree.name("jobs").isSelected(false);
  await stooq.isSelected();
  await packaged.click();
  await packaged.isExpanded(true);
  await features.isExpanded(true);
  await features.click();
  await stooq.shows("Feature: Stooq refresh");
  await tree.showsNoSummary();

  await tree.name(featuresPath).click();
  await features.isExpanded(false);
  await packaged.isExpanded(true);
  await tree.name(featuresPath).isSelected(true);
  await tree.summarizes(featuresPath, "4 files");
  await tree.showsNoPurpose();
});
