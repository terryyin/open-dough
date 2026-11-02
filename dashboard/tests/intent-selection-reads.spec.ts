// Intent's Purpose and Proof show only what was read for the selected file,
// and the selection outlives reads of the same revision
// (../src/IntentBrowser.tsx, ../src/IntentPerspective.tsx): while another
// feature's text is still being read, neither pane pairs it with the
// previous feature's text, not even for one rendered frame; and the
// published work's detail completing during startup, at the same revision,
// neither reads the locations again nor clears the expanded group, the
// selected feature, its Purpose or its Proof, while a new published revision
// reads them again and starts with nothing selected.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";
import {
  countLocationsReads,
  expandIntentGroup,
  intentGroupToggle,
  intentModeTab,
} from "./intentPerspectivePage.ts";
import { holdAuthenticatedReadsOf } from "./holdAuthenticatedReads.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "./autoRefreshJourney.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { publishIntentProject, pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherFeature,
  otherFeatureOnlyFiles,
  otherPath,
  publishedFeature,
  runFiles,
  settings,
} from "./intentCucumberProofFixtures.ts";

const features = { [featurePath]: publishedFeature, [otherPath]: otherFeature };

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("selecting another feature never shows the previous feature's text in Purpose or Proof", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, pygardon, settings, {
    ...features,
    ...otherFeatureOnlyFiles,
  });
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: otherPath, exact: true }).click();
  const proof = intent.getByRole("region", { name: "Proof" });
  const purpose = intent.getByRole("region", { name: "Purpose" });
  await expect(
    proof.getByRole("table", { name: `${otherPath} proof` }),
  ).toContainText("Report free space");

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
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  await expect.poll(jobsRead.held).toBe(1);
  await expect(purpose).toContainText(`Reading ${featurePath}…`);
  await expect(proof).toContainText(
    `Proof is shown once ${featurePath} is read.`,
  );
  await expect(intent).not.toContainText("Report free space");

  jobsRead.release();
  const jobs = proof.getByRole("table", { name: `${featurePath} proof` });
  await expect(jobs).toContainText("Archive a job");
  await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
    "Feature: Jobs",
  );
  const labelled = await page.evaluate(
    () => (window as unknown as { labelled: string[] }).labelled,
  );
  expect(labelled.length).toBeGreaterThan(0);
  expect(
    labelled.filter((each) => /Disk space|Report free space/.test(each)),
  ).toEqual([]);
});

test("a feature selected while startup detail completes stays selected with its Purpose and Proof", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const locationsReads = countLocationsReads(page);
  await publishIntentProject(page, pygardon, settings, {
    ...features,
    ...runFiles,
  });
  // The queued story's Goal is part of the published work's detail; holding
  // it keeps startup unfinished while the developer picks a feature.
  const detail = await holdAuthenticatedReadsOf(
    page,
    pygardon.queuedPath,
    releases,
  );
  await page.goto("/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  const source = intent.getByLabel(`${featurePath} source`);
  const proof = intent.getByRole("region", { name: "Proof" });
  const table = proof.getByRole("table", { name: `${featurePath} proof` });
  await expect(source).toContainText("Feature: Jobs");
  await expect(table).toContainText("Archive a job");
  await expect.poll(detail.held).toBeGreaterThan(0);
  expect(locationsReads()).toBe(1);

  detail.release();
  await untilPageReadsAnswered(page);
  await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(
    intent.getByRole("button", { name: featurePath, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(source).toContainText("Feature: Jobs");
  await expect(table).toContainText("Archive a job");
  expect(locationsReads()).toBe(1);
});

test("a new published revision reads the locations again and starts with nothing selected", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClock(page);
  const locationsReads = countLocationsReads(page);
  const files = {
    ...filesOf(pygardon),
    ".planning/open-dough.json": `${settings}\n`,
    ...features,
    ...runFiles,
  };
  const origin = publishMovingFiles(page, {
    repository: pygardon.repository,
    ref: pygardon.ref,
    revision: pygardon.revision,
    files,
  });
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
    "Scenario: Archive a job",
  );
  expect(locationsReads()).toBe(1);

  origin.moveTrunk({
    revision: "e7".repeat(20),
    files: {
      ...files,
      [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
    },
  });
  await passTimeUntilCheckedAfterSettled(page);
  await untilPageReadsAnswered(page);
  await expect.poll(locationsReads).toBe(2);
  // Remount clears Intent selection and returns to the Intent tab's
  // nothing-selected Purpose and Proof.
  await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(intent.getByRole("region", { name: "Purpose" })).toContainText(
    "Select a feature file to read its Purpose.",
  );
  await expect(intent.getByRole("region", { name: "Proof" })).toContainText(
    "Select a feature file to see its Proof.",
  );
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
    "Scenario: Purge a job",
  );
});
