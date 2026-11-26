// Intent reads each feature once at the revision shown
// (../../src/repositoryFileReads.ts): reopening a feature, or leaving for
// Development and returning, reads neither its text nor the locations again
// and shows it without a reading moment; a feature still being read never
// shows the previous feature's text in Purpose.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-candidates-publication.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";

const archivePath = `${pygardonFeatures.folder}/archive.feature`;
const diskPath = `${pygardonFeatures.folder}/disk.feature`;
const files = {
  [archivePath]: "Feature: Archive\n  Scenario: Archive a job\n",
  [diskPath]: "Feature: Disk space\n  Scenario: Report free space\n",
};

// The published features, counting locations reads and
// holding each read of `held` until released.
function publication(held?: string) {
  const published = publishedWithCandidates(
    makeMe.aTestOptimizationCandidatesRecord.please(),
    files,
  );
  const locationsReads: unknown[] = [];
  const releases: (() => void)[] = [];
  const intent: IntentReadSource = {
    ...published.readSource,
    readLocations(...args) {
      locationsReads.push(args);
      return published.readSource.readLocations(...args);
    },
    async readProjectFile(...args) {
      if (args[1] === held)
        await new Promise<void>((release) => releases.push(release));
      return published.readSource.readProjectFile(...args);
    },
  };
  const readsOf = (path: string) =>
    published.fileReads.filter((each) => each.path === path).length;
  return { ...published, intent, locationsReads, readsOf, releases };
}

// Each case reads at its own revision: read files stay cached per revision.
const mountPublication = (intent: IntentReadSource, revision: string) =>
  mountPageIntentReading(
    intent,
    makeMe.aPublishedWork.ofPygardon.at(revision).please(),
  );

const intentBody = page.getByRole("main", { name: "Intent", exact: true });

// Every "Reading …" text Intent shows from now on, however briefly.
function readingMoments() {
  const seen: string[] = [];
  const observer = new MutationObserver(() => {
    for (const quiet of document.querySelectorAll(
      'main[aria-label="Intent"] .quiet',
    )) {
      const text = quiet.textContent;
      if (text.startsWith("Reading ")) seen.push(text);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  return () => {
    observer.disconnect();
    return seen;
  };
}

test("reopening a feature and returning from Development ask nothing more and show without a reading moment", async () => {
  const { intent, locationsReads, readsOf } = publication();
  const shown = await mountPublication(intent, "a7".repeat(20));
  const browser = intentBrowser();
  await (await browser.open(archivePath)).shows("Scenario: Archive a job");
  await (await browser.open(diskPath)).shows("Report free space");

  const moments = readingMoments();
  await (await browser.open(archivePath)).shows("Scenario: Archive a job");
  await (await browser.open(diskPath)).shows("Report free space");
  expect(readsOf(archivePath)).toBe(1);

  await shown.showDevelopment();
  await expect.element(intentBody).not.toBeInTheDocument();
  await shown.showIntent();
  await intentFileReading(diskPath).shows("Report free space");
  expect(locationsReads).toHaveLength(1);
  expect(readsOf(archivePath)).toBe(1);
  expect(readsOf(diskPath)).toBe(1);
  expect(moments()).toEqual([]);
});

test("selecting another feature never shows the previous feature's text in Purpose", async () => {
  const { intent, releases } = publication(archivePath);
  await mountPublication(intent, "a8".repeat(20));
  const browser = intentBrowser();
  await (await browser.open(diskPath)).shows("Report free space");

  // Every element labelled for the archive feature from here on, with the
  // text it held when so labelled, rendered frames in between included.
  const labelled: string[] = [];
  const note = (node: Node) => {
    if (!(node instanceof Element)) return;
    for (const each of [node, ...node.querySelectorAll("[aria-label]")]) {
      const label = each.getAttribute("aria-label") ?? "";
      if (label.startsWith(archivePath))
        labelled.push(`${label}: ${each.textContent}`);
    }
  };
  const observer = new MutationObserver((records) => {
    for (const each of records) {
      note(each.target);
      each.addedNodes.forEach(note);
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-label"],
  });

  const archive = await browser.open(archivePath);
  await expect.poll(() => releases.length).toBe(1);
  await browser.explains(`Reading ${archivePath}…`);
  await expect.element(intentBody).not.toHaveTextContent("Report free space");

  releases[0]?.();
  await archive.shows("Scenario: Archive a job");
  observer.disconnect();
  expect(labelled.length).toBeGreaterThan(0);
  expect(
    labelled.filter((each) => /Disk space|Report free space/.test(each)),
  ).toEqual([]);
});
