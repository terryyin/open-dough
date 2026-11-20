// One selected case's source survives Show latest when the new revision's
// file read fails: the reading keeps the old answer until Retry reads it.
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import { mountIntentReading } from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

const clipPath = "tests/test_clip_core.py";
const clipCase = "test_clip_segments_h264_reencodes_video";
const before = "ab".repeat(20);
const after = "cd".repeat(20);
const beforeText = [
  "def test_example():",
  '    assert "ok"',
  "",
  ...[...Array(40).keys()].map((index) => `# pad ${index}`),
  `def ${clipCase}():`,
  "    assert True",
  "",
  ...[...Array(60).keys()].map((index) => `# after ${index}`),
].join("\n");
const afterText = beforeText.replace("assert True", "assert 2 == 2");
const candidatesRecord = makeMe.aTestOptimizationCandidatesRecord
  .accepted("real-h264-codec-roundtrip", `\`${clipPath}::${clipCase}\``)
  .please();
const locations = {
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at("tests")
      .ofKind("python")
      .selecting(clipPath)
      .please(),
  ],
} as const;

test("a selected source case keeps line 44 and reading while the new revision's file read failed then retried", async () => {
  const fileReads: string[] = [];
  const readSource: IntentReadSource = {
    readLocations: () => Promise.resolve(locations),
    readCandidates: () =>
      Promise.resolve({ status: "present", text: candidatesRecord }),
    readFile(...[, path, revision]) {
      fileReads.push(`${path}@${revision}`);
      if (revision === after && fileReads.length === 2)
        return Promise.reject(
          new ReadProblem("file read failed", undefined, "transient"),
        );
      return Promise.resolve(revision === before ? beforeText : afterText);
    },
  };
  const intent = await mountIntentReading(readSource, before, "candidates");
  const browser = intentBrowser();

  const source = await intentCandidates().openSource(
    "real-h264-codec-roundtrip",
    clipPath,
  );
  await source.shows("assert True");
  await source.targets(44);
  await source.isAt(before);
  await source.focusSource();
  const offset = await browser.scrolledOffset();

  intent.offerRevision(after);
  await intentRevisionNotice().showLatest();
  await browser.isAt(after);
  await browser.failsWith(
    `${clipPath} could not be read at revision cdcdcdc; showing abababa. Retry`,
  );
  await source.shows("assert True");
  await source.isAt(before);
  await source.targets(44);
  await source.isFocused();
  await browser.isScrolledTo(offset);

  await browser.retryRead();
  await source.shows("assert 2 == 2");
  await source.isAt(after);
  await source.targets(44);
  await browser.isScrolledTo(offset);
  await browser.showsNoReadFailure();
});
