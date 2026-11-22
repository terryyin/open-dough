// A recorded case opens its source in Purpose at the case's line, marked and
// in view, with the file selected: a Python `::name`, a Gherkin scenario
// named exactly once, and an explicit `:line`. A case name the file repeats
// opens it at its start (SEED-192 commitments 23.1–23.3, 24;
// ../../src/intentCandidatesLocationMatch.ts).
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { intentCandidates } from "./intent-candidates-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-candidates-publication.ts";

const revision = "6d".repeat(20);
const padding = (prefix: string) =>
  [...Array(40).keys()].map((index) => `${prefix} pad ${index}`);

const clipPath = "tests/test_clip_core.py";
const clipCase = "test_clip_segments_h264_reencodes_video";
const clip = [
  "def test_example():",
  "    assert True",
  ...padding("#"),
  `def ${clipCase}():`,
  "    assert True",
].join("\n");

const featurePath = `${pygardonFeatures.folder}/case_position.feature`;
const uniqueScenario = "unique cold path";
const feature = [
  "Feature: case position",
  ...padding("  #"),
  `  Scenario: ${uniqueScenario}`,
  "    Given unique",
  ...padding("  #"),
  "  Scenario: shared scenario",
  "    Given first",
  "  Scenario: shared scenario",
  "    Given second",
].join("\n");

const anchoredPath = `${pygardonFeatures.folder}/anchored.feature`;
const anchored = [
  "Feature: anchored",
  ...padding("  #"),
  "  Scenario: line-anchored case",
].join("\n");

const record = makeMe.aTestOptimizationCandidatesRecord
  .accepted("real-h264-codec-roundtrip", `\`${clipPath}::${clipCase}\``)
  .pending("unique-scenario-once", `\`${featurePath}::${uniqueScenario}\``)
  .pending("path-line-case", `\`${anchoredPath}:42\``)
  .pending("duplicate-scenario-name", `\`${featurePath}::shared scenario\``)
  .please();

test("a recorded case opens its source at the case's line, and a repeated case name at the file start", async () => {
  const { readSource } = publishedWithCandidates(
    record,
    { [featurePath]: feature, [anchoredPath]: anchored },
    { [clipPath]: clip },
  );
  await mountPageIntentReading(
    readSource,
    makeMe.aPublishedWork.ofPygardon.at(revision).please(),
  );
  const candidates = await (
    await intentCandidates().choose()
  ).isRecordedAt(revision);

  for (const [name, path, text, line] of [
    ["real-h264-codec-roundtrip", clipPath, `def ${clipCase}`, 43],
    ["unique-scenario-once", featurePath, `Scenario: ${uniqueScenario}`, 42],
    ["path-line-case", anchoredPath, "line-anchored case", 42],
  ] as const) {
    const opened = await candidates.openSource(name, path);
    await (await (await opened.shows(text)).isSelected()).targets(line);
    await candidates.choose();
  }

  const duplicate = await candidates.openSource(
    "duplicate-scenario-name",
    featurePath,
  );
  await (await duplicate.shows("Scenario: shared scenario")).isAtStart();
});
