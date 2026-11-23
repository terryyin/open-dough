// Opening a recorded case from Optimization Candidates reads its file once and
// shows Purpose at the case's line; highlighting that arrives later leaves the
// reader where they scrolled, and opening the case again after reading away
// returns to its line (../../src/IntentBrowser.tsx,
// ../../src/IntentFileReading.tsx), on the page's Intent body
// (./intent-ci-page-mount.ts). Case lines per record form:
// ./intent-candidates-case.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import {
  highlightSourceLines,
  type SourceHighlighter,
} from "../../src/sourceHighlight.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import { publishedWithCandidates } from "./intent-candidates-publication.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";

const revision = "5c".repeat(20);
const featurePath = `${pygardonFeatures.folder}/case_position.feature`;
const scenario = "unique cold path";
const feature = [
  "Feature: case position",
  ...[...Array(40).keys()].map((index) => `  # pad ${index}`),
  `  Scenario: ${scenario}`,
  "    Given unique",
].join("\n");
const record = makeMe.aTestOptimizationCandidatesRecord
  .pending("unique-scenario-once", `\`${featurePath}::${scenario}\``)
  .please();

test("a recorded case reads its file once at the case's line, keeps the reader's place as highlighting arrives, and returns to the line when opened again", async () => {
  const { readSource, fileReads } = publishedWithCandidates(record, {
    [featurePath]: feature,
  });
  // Highlighting waits until the case releases it.
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const highlight: SourceHighlighter = async (text, language) => {
    await released;
    return highlightSourceLines(text, language);
  };
  await mountIntentCiPage({
    work: makeMe.aPublishedWork.ofPygardon.at(revision).please(),
    reads: { intent: readSource, ci: unreadCiReads, highlight },
  });
  const candidates = await (
    await intentCandidates().choose()
  ).isRecordedAt(revision);

  const opened = await candidates.openSource(
    "unique-scenario-once",
    featurePath,
  );
  await (
    await (await opened.shows(`Scenario: ${scenario}`)).isSelected()
  ).targets(42);
  expect(fileReads.filter(({ path }) => path === featurePath)).toHaveLength(1);

  const pane = document.querySelector<HTMLElement>(".intent-reading");
  if (pane === null) throw new Error("No Intent reading pane");
  // The case sits below the start of Purpose; the reader scrolls back to it.
  expect(pane.scrollTop).toBeGreaterThan(0);
  pane.scrollTop = 0;
  release();
  await expect
    .poll(() => document.querySelectorAll(".source-token").length)
    .toBeGreaterThan(0);
  expect(pane.scrollTop).toBe(0);

  await candidates.choose();
  const again = await candidates.openSource(
    "unique-scenario-once",
    featurePath,
  );
  await (await again.isSelected()).targets(42);
});
