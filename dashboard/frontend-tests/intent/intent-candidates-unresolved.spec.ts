// A recorded path that cannot simply open explains what can: an ambiguous
// bare name lists the full paths it names, a path not published at the
// revision or outside configured Intent locations opens nothing, prose naming
// no path leaves no gap, and a unique bare feature name opens its file
// (SEED-192 examples 3, 4 and 6; ../../src/IntentCandidatesLocationsText.tsx).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { intentCandidates, textAsRead } from "./intent-candidates-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-candidates-publication.ts";

const revision = "7e".repeat(20);
const at = (path: string) => `${pygardonFeatures.folder}/${path}`;
const landed = at("review/landed_runs.feature");
const boundaryLanded = at("review/boundary/landed_runs.feature");
const lfs = at("cli/notebook_lfs.feature");
const moved = at("moved/gone.feature");
const clipPath = "tests/test_clip_core.py";
const featureOf = (path: string) => `Feature: ${path}\n  Scenario: Read it\n`;
const files = Object.fromEntries(
  [landed, boundaryLanded, lfs].map((path) => [path, featureOf(path)]),
);

const record = makeMe.aTestOptimizationCandidatesRecord
  .accepted("landed-runs-tail", "`landed_runs.feature`")
  .pending("moved-test-after-record", `\`${moved}\``)
  .accepted("real-h264-codec-roundtrip", `\`${clipPath}::test_clip\``)
  .pending(
    "frontend-browser-file-isolation",
    "browser file isolation across notebook tabs with no path named here",
  )
  .pending("e2e-batch-cold-start", "`notebook_lfs.feature` cold start")
  .please();

test("an unresolved recorded path explains what can be opened, and a unique bare feature name opens its file", async () => {
  const { readSource, fileReads } = publishedWithCandidates(record, files);
  await mountPageIntentReading(
    readSource,
    makeMe.aPublishedWork.ofPygardon.at(revision).please(),
  );
  const candidates = await (
    await intentCandidates().choose()
  ).isRecordedAt(revision);
  const reads = (entry: string) =>
    expect.poll(() => textAsRead(candidates.entry(entry)));

  await reads("moved-test-after-record").toContain(
    "not published at this revision",
  );
  await expect
    .element(candidates.sourceLink("moved-test-after-record", moved))
    .not.toBeInTheDocument();
  await reads("real-h264-codec-roundtrip").toContain(
    "outside configured Intent locations",
  );
  await expect
    .element(candidates.sourceLink("real-h264-codec-roundtrip", clipPath))
    .not.toBeInTheDocument();
  const prose = textAsRead(candidates.entry("frontend-browser-file-isolation"));
  expect(prose).toContain("no path named here");
  for (const gap of ["not published", "outside configured", "names several"])
    expect(prose).not.toContain(gap);

  await reads("landed-runs-tail").toContain("names several files");
  await expect
    .element(candidates.sourceLink("landed-runs-tail", landed))
    .toBeVisible();
  await (
    await candidates.openSource("landed-runs-tail", boundaryLanded)
  ).shows(`Feature: ${boundaryLanded}`);
  expect(fileReads.map(({ path }) => path)).not.toContain(landed);
  expect(fileReads.map(({ path }) => path)).not.toContain(clipPath);

  await candidates.choose();
  await (
    await candidates.openSource(
      "e2e-batch-cold-start",
      "notebook_lfs.feature",
      lfs,
    )
  ).shows(`Feature: ${lfs}`);
});
