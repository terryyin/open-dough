import { prepareFrontendReuseJobs } from "../../test-support/support/frontendIntentReuseAnswers.ts";
import {
  fileSource,
  sourceFile,
} from "../../test-support/intentCodeBrowsePage.ts";
// Intent's Purpose shows only what was read for the selected file,
// and the selection outlives reads of the same revision
// (../../src/IntentBrowser.tsx, ../../src/IntentPerspective.tsx): while another
// feature's text is still being read, Purpose never pairs it with the
// previous feature's text, not even for one rendered frame; and the
// published work's detail completing during startup, at the same revision,
// neither reads the locations again nor clears the expanded group, the
// selected feature or its Purpose. Newer revisions:
// ./intent-revision-notice.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../test-support/pageRequestNotes.ts";
import {
  countLocationsReads,
  expandIntentGroup,
  intentGroupToggle,
  purposeRegion,
} from "../../test-support/intentPerspectivePage.ts";
import { holdAuthenticatedReadsOf } from "../../test-support/holdAuthenticatedReads.ts";
import {
  featurePath,
  otherPath,
} from "../../test-support/intentJobsFeatureFixtures.ts";

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("selecting another feature never shows the previous feature's text in Purpose", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await prepareFrontendReuseJobs(page, frontendServices);
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await sourceFile(intent, otherPath).click();
  const purpose = purposeRegion(intent);
  await expect(fileSource(intent, otherPath)).toContainText(
    "Report free space",
  );

  // Every element labelled for the jobs feature from here on, and the text
  // each held when it was so labelled, rendered frames in between included.
  await page.evaluate((path) => {
    const labelled: string[] = [];
    (window as unknown as { labelled: string[] }).labelled = labelled;
    const note = (node: Node) => {
      if (!(node instanceof Element)) return;
      for (const each of [node, ...node.querySelectorAll("[aria-label]")]) {
        const label = each.getAttribute("aria-label") ?? "";
        if (label.startsWith(path)) {
          labelled.push(`${label}: ${each.textContent}`);
        }
      }
    };
    new MutationObserver((records) => {
      for (const record of records) {
        note(record.target);
        record.addedNodes.forEach(note);
      }
    }).observe(document.querySelector(".intent-reading") as Node, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });
  }, featurePath);

  const jobsRead = await holdAuthenticatedReadsOf(page, featurePath, releases);
  await sourceFile(intent, featurePath).click();
  await expect.poll(jobsRead.held).toBe(1);
  await expect(purpose).toContainText(`Reading ${featurePath}…`);
  await expect(intent).not.toContainText("Report free space");

  jobsRead.release();
  await expect(fileSource(intent, featurePath)).toContainText(
    "Scenario: Archive a job",
  );
  const labelled = await page.evaluate(
    () => (window as unknown as { labelled: string[] }).labelled,
  );
  expect(labelled.length).toBeGreaterThan(0);
  expect(
    labelled.filter((each) => /Disk space|Report free space/.test(each)),
  ).toEqual([]);
});

test("a feature selected while startup detail completes stays selected with its Purpose", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const locationsReads = countLocationsReads(page);
  await prepareFrontendReuseJobs(page, frontendServices);
  // The queued story's Goal is part of the published work's detail; holding
  // it keeps startup unfinished while the developer picks a feature.
  const detail = await holdAuthenticatedReadsOf(
    page,
    ".planning/seeds/SEED-303-queued.md",
    releases,
  );
  await page.goto("/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  await sourceFile(intent, featurePath).click();
  const source = fileSource(intent, featurePath);
  await expect(source).toContainText("Scenario: Archive a job");
  await expect.poll(detail.held).toBeGreaterThan(0);
  expect(locationsReads()).toBe(1);

  detail.release();
  await untilPageReadsAnswered(page);
  await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(sourceFile(intent, featurePath)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(source).toContainText("Scenario: Archive a job");
  expect(locationsReads()).toBe(1);
});
