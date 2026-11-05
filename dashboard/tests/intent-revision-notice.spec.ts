// Newer revisions wait behind one polite notice, read nothing until **Show
// latest**, which keeps the reading while the latest locations are read, then
// the selection by path; Development follows them meanwhile; a deleted
// selected feature is explained, with nothing else selected
// (../src/IntentRevisionNotice.tsx, ../src/pageIntentReading.tsx).

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { shortRevision } from "./dashboardParts.ts";
import { openUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";
import {
  expandIntentGroup,
  intentGroupToggle,
  purposeRegion,
  revisionNotice,
} from "./intentPerspectivePage.ts";
import { holdAuthenticatedReadsWhere } from "./holdAuthenticatedReads.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "./autoRefreshJourney.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherFeature,
  otherPath,
  publishedFeature,
  settings,
} from "./intentJobsFeatureFixtures.ts";

const features = { [featurePath]: publishedFeature, [otherPath]: otherFeature };

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

// Intent's reads of the boundary from here on, as `<what>@<revision>`: the
// locations, the Optimization Candidates record, or a file under the location.
function intentReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const params = url.searchParams;
    const what = params.get("intent") ?? params.get("path") ?? "";
    if (params.has("intent") || what.startsWith("e2e_test/")) {
      reads.push(`${what}@${params.get("revision")}`);
    }
  });
  return reads;
}

// A feature long enough for the reading pane to scroll.
const longFeature = (scenario: string) =>
  publishedFeature.replace("Archive a job", scenario) +
  [...Array(60).keys()]
    .map((n) => `\n  Scenario: Keep job ${n}\n    Then it stays\n`)
    .join("");

// Pygardon's published files with Intent locations and `features`.
const publishedFiles = (features: Readonly<Record<string, string>>) => ({
  ...filesOf(pygardon),
  ".planning/open-dough.json": `${settings}\n`,
  ...features,
});

// Pygardon published at `pygardon.revision` with the jobs feature selected
// and its Purpose read, on a page whose clock is paused; `moveTrunk` publishes
// a newer revision and lets the page observe it.
async function openWithFeatureSelected(
  page: Page,
  files: Readonly<Record<string, string>>,
) {
  await page.setViewportSize({ width: 1280, height: 600 });
  await pausePageClock(page);
  const origin = publishMovingFiles(page, {
    repository: pygardon.repository,
    ref: pygardon.ref,
    revision: pygardon.revision,
    files,
  });
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  const feature = intent.getByRole("button", {
    name: featurePath,
    exact: true,
  });
  await feature.click();
  const source = intent.getByLabel(`${featurePath} source`);
  await expect(source).toContainText("Scenario: Archive a job");
  const moveTrunk = async (
    revision: string,
    moved: Readonly<Record<string, string>>,
  ) => {
    origin.moveTrunk({ revision, files: moved });
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
  };
  return { moveTrunk, intent, feature, source };
}

test("newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read", async ({
  page,
}) => {
  const files = publishedFiles({
    [featurePath]: longFeature("Archive a job"),
    [otherPath]: otherFeature,
  });
  const reads = intentReads(page);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    files,
  );
  const pane = intent.locator(".intent-reading");
  await pane.evaluate((element) => {
    element.scrollTo({ top: 300, behavior: "instant" });
  });
  const scrolled = await pane.evaluate((element) => element.scrollTop);
  expect(scrolled).toBeGreaterThan(0);
  // The expanded group, the selected feature and the pane's scroll stay.
  const expectReadingKept = async () => {
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(feature).toHaveAttribute("aria-pressed", "true");
    expect(await pane.evaluate((element) => element.scrollTop)).toBe(scrolled);
  };
  const focused = () =>
    page.evaluate(() => document.activeElement?.textContent ?? "");
  const focusedBefore = await focused();
  expect(reads).toEqual([
    `locations@${pygardon.revision}`,
    `${featurePath}@${pygardon.revision}`,
  ]);

  const [b, c] = ["e7".repeat(20), "e8".repeat(20)];
  for (const [revision, scenario] of [
    [b, "Restore a job"],
    [c, "Purge a job"],
  ] as const) {
    await moveTrunk(revision, {
      ...files,
      [featurePath]: longFeature(scenario),
    });
  }
  const notice = revisionNotice(intent);
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveAttribute("aria-live", "polite");
  await expect(notice).toContainText(
    `New revision available — showing ${shortRevision(pygardon.revision)}`,
  );
  await expect(notice.getByRole("button")).toHaveText(["Show latest"]);
  expect(await focused()).toBe(focusedBefore);
  await expect(source).toContainText("Scenario: Archive a job");
  await expectReadingKept();
  expect(reads).toHaveLength(2);

  const latest = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "locations" && params.get("revision") === c,
    releases,
  );
  await notice.getByRole("button", { name: "Show latest" }).click();
  await expect.poll(latest.held).toBe(1);
  await expect(notice).toContainText("Updating…");
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(feature).toHaveAttribute("aria-pressed", "true");

  latest.release();
  await expect(source).toContainText("Scenario: Purge a job");
  await untilPageReadsAnswered(page);
  await expect(notice).toHaveCount(0);
  await expectReadingKept();
  await expect(feature).toBeFocused();
  expect(reads.slice(2)).toEqual([`locations@${c}`, `${featurePath}@${c}`]);
});

test("Development follows a new revision while Intent, opened again, keeps its reading behind the notice", async ({
  page,
}) => {
  const files = publishedFiles(features);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    files,
  );
  const { development, intentChoice, status } = parts(page);
  await development.click();
  await expect(intent).toBeHidden();

  const revision = "ea".repeat(20);
  await moveTrunk(revision, {
    ...files,
    [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
  });
  await expect(status).toContainText(
    `Published work read at revision ${shortRevision(revision)}`,
  );

  await intentChoice.click();
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(revisionNotice(intent)).toContainText(
    `New revision available — showing ${shortRevision(pygardon.revision)}`,
  );
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  await untilPageReadsAnswered(page);
  expect(reads).toEqual([
    `locations@${pygardon.revision}`,
    `${featurePath}@${pygardon.revision}`,
  ]);
});

test("a selected feature the latest revision deleted is explained, with nothing else selected", async ({
  page,
}) => {
  const files = publishedFiles(features);
  const reads = intentReads(page);
  const { moveTrunk, intent } = await openWithFeatureSelected(page, files);

  const revision = "e9".repeat(20);
  const remaining = Object.fromEntries(
    Object.entries(files).filter(([path]) => path !== featurePath),
  );
  await moveTrunk(revision, remaining);
  await revisionNotice(intent)
    .getByRole("button", { name: "Show latest" })
    .click();

  await expect(purposeRegion(intent)).toContainText(
    `${featurePath} is not in revision ${shortRevision(revision)}`,
  );
  await untilPageReadsAnswered(page);
  await expect(
    intent.getByRole("button", { name: otherPath, exact: true }),
  ).toBeVisible();
  await expect(
    intent.locator('.intent-locations [aria-pressed="true"]'),
  ).toHaveCount(0);
  await expect(intent.getByLabel(/ source$/)).toHaveCount(0);
  await expect(intent.locator(".intent-reading")).toBeFocused();
  expect(reads.slice(2)).toEqual([`locations@${revision}`]);
});
