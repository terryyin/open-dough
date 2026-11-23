// Intent's selection outlives reads of the same revision
// (../../src/IntentBrowser.tsx, ../../src/IntentPerspective.tsx): the
// published work's detail completing during startup, at the same revision,
// neither reads the locations again nor clears the expanded group, the
// selected feature or its Purpose. A feature still being read:
// ./intent-cached-reads.spec.ts. Newer revisions:
// ./intent-revision-notice.spec.ts.
import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { readRepositoryFileAt } from "../../src/authenticatedRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import {
  mountIntentRecovery,
  publishedDetailPath,
  workWithPublishedDetail,
} from "./intent-read-recovery-page.tsx";

const featurePath = pygardonFeatures.jobs;
const featureFiles = makeMe.somePublishedFiles.ofPygardonFeatures
  .openingJobsWith("Archive a job")
  .please();
const folder = pygardonFeatures.folder;
const goal = "Keep selection while startup detail settles.";
const seedText = `# Queued seed\n\n**Identity:** SEED-302#queued\n\n**Goal:** ${goal}\n`;
const development = page.getByRole("radio", {
  name: "Development",
  exact: true,
});
const intentChoice = page.getByRole("radio", { name: "Intent", exact: true });
const queuedCard = () =>
  page.getByRole("article", { name: "Queued seed", exact: true });

test("a feature selected while startup detail completes stays selected with its Purpose", async () => {
  const revision = "s8".repeat(20);
  const work = workWithPublishedDetail(revision);
  const locationsReads: unknown[] = [];
  let releaseDetail!: () => void;
  const detailHeld = new Promise<void>((resolve) => {
    releaseDetail = resolve;
  });
  onTestFinished(releaseDetail);
  let heldCount = 0;
  let detailSettled = false;
  const detailRead: typeof readRepositoryFileAt = async (
    source,
    path,
    askedRevision,
  ) => {
    expect([source.id, askedRevision]).toEqual([work.source.id, revision]);
    if (path === publishedDetailPath) {
      heldCount += 1;
      await detailHeld;
      detailSettled = true;
      return seedText;
    }
    return `# Detail for ${path}\n`;
  };
  const intent: IntentReadSource = {
    readLocations(source, asked) {
      expect([source.id, asked]).toEqual([work.source.id, revision]);
      locationsReads.push(asked);
      return Promise.resolve({
        status: "configured",
        locations: [
          makeMe.anIntentLocation
            .at(folder)
            .ofKind("gherkin")
            .selecting(featurePath)
            .please(),
        ],
      });
    },
    readFile: (...[, path]) =>
      Promise.resolve(featureFiles[path] ?? `${path}\n`),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };

  await mountIntentRecovery(intent, work, detailRead);
  const browser = intentBrowser();
  await browser.showsLocation(folder);
  await expect.poll(() => heldCount).toBeGreaterThan(0);
  expect(detailSettled).toBe(false);

  // Membership is already on the Board while the canonical detail stays held.
  await userEvent.click(development);
  await expect.element(queuedCard()).toBeVisible();
  await expect
    .element(queuedCard().getByText("Reading preparation…", { exact: true }))
    .toBeVisible();

  await userEvent.click(intentChoice);
  await (await browser.open(featurePath)).shows("Scenario: Archive a job");
  expect(locationsReads).toHaveLength(1);

  releaseDetail();
  await expect.poll(() => detailSettled).toBe(true);
  await userEvent.click(development);
  const card = queuedCard();
  await expect
    .element(card.getByText("Reading preparation…", { exact: true }))
    .not.toBeInTheDocument();
  await userEvent.click(card.getByRole("button", { name: "Inspect story" }));
  await expect
    .element(card.getByRole("region", { name: "Detail for Queued seed" }))
    .toBeVisible();
  await expect.element(card.getByText(goal, { exact: true })).toBeVisible();

  await userEvent.click(intentChoice);
  await browser.showsFolderExpanded(folder);
  const reading = intentFileReading(featurePath);
  await reading.isSelected();
  await reading.shows("Scenario: Archive a job");
  expect(locationsReads).toHaveLength(1);
});
