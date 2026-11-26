// One selected case's source survives Show latest while the new revision's
// file read is held or fails: the reading keeps the old answer until the
// read is released or Retry reads it.
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { shortRevision as short } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import { mountIntentReading } from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

const clipPath = "tests/test_clip_core.py";
const clipCase = "test_clip_segments_h264_reencodes_video";
const before = "ab".repeat(20);
// Each case reads its own new revision: file reads are cached per revision.
const failedAfter = "cd".repeat(20);
const heldAfter = "ef".repeat(20);
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

// Every read the reading makes, as `<what>@<revision>`, with the file's
// reply chosen by the case.
function recordedReads(readFile: (revision: string) => Promise<string>): {
  reads: string[];
  readSource: IntentReadSource;
} {
  const reads: string[] = [];
  return {
    reads,
    readSource: makeMe.anIntentReadSource
      .reading({
        readLocations(...[, revision]) {
          reads.push(`locations@${revision}`);
          return Promise.resolve(locations);
        },
        readCandidates(...[, revision]) {
          reads.push(`candidates@${revision}`);
          return Promise.resolve({ status: "present", text: candidatesRecord });
        },
        readFile(...[, path, revision]) {
          reads.push(`${path}@${revision}`);
          return readFile(revision);
        },
      })
      .please(),
  };
}

// At the new revision, locations are read first; the record and the file
// both follow them, neither waiting on the other.
async function readsAtNewRevision(
  reads: string[],
  after: string,
  fileReads: number,
) {
  const atAfter = () => reads.filter((read) => read.endsWith(`@${after}`));
  await expect.poll(() => atAfter().length).toBe(2 + fileReads);
  const [first, ...rest] = atAfter();
  expect(first).toBe(`locations@${after}`);
  expect(rest.sort()).toEqual(
    [
      `candidates@${after}`,
      ...Array<string>(fileReads).fill(`${clipPath}@${after}`),
    ].sort(),
  );
}

async function openClipSource(readSource: IntentReadSource) {
  const intent = await mountIntentReading(readSource, before, "candidates");
  const source = await intentCandidates().openSource(
    "real-h264-codec-roundtrip",
    clipPath,
  );
  await source.shows("assert True");
  await source.targets(44);
  await source.isAt(before);
  await source.focusSource();
  const offset = await intentBrowser().scrolledOffset();
  return { intent, source, offset };
}

type ClipSource = Awaited<ReturnType<typeof openClipSource>>["source"];

// The opened case reads `text` at `revision`, still targeting line 44 with
// its focus and reading offset kept.
async function readsLine44(
  source: ClipSource,
  offset: number,
  revision: string,
  text: string,
) {
  await source.shows(text);
  await source.isAt(revision);
  await source.targets(44);
  await source.isFocused();
  await intentBrowser().isScrolledTo(offset);
}

test("a selected source case keeps line 44 and reading while the new revision's file read is held then released", async () => {
  const after = heldAfter;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  const { reads, readSource } = recordedReads(async (revision) => {
    if (revision === before) return beforeText;
    await held;
    return afterText;
  });
  const { intent, source, offset } = await openClipSource(readSource);
  const browser = intentBrowser();

  await intent.offerRevision(after);
  await intentRevisionNotice().showLatest();
  await browser.isAt(after);
  await expect.poll(() => reads).toContain(`${clipPath}@${after}`);
  await readsLine44(source, offset, before, "assert True");
  await browser.showsNoReadFailure();

  release();
  await readsLine44(source, offset, after, "assert 2 == 2");
  await browser.showsNoReadFailure();
  await readsAtNewRevision(reads, after, 1);
});

test("a selected source case keeps line 44 and reading while the new revision's file read failed then retried", async () => {
  const after = failedAfter;
  let failed = false;
  const { reads, readSource } = recordedReads((revision) => {
    if (revision === before) return Promise.resolve(beforeText);
    if (failed) return Promise.resolve(afterText);
    failed = true;
    return Promise.reject(
      new ReadProblem("file read failed", undefined, "transient"),
    );
  });
  const { intent, source, offset } = await openClipSource(readSource);
  const browser = intentBrowser();

  await intent.offerRevision(after);
  await intentRevisionNotice().showLatest();
  await browser.isAt(after);
  await browser.failsWith(
    `${clipPath} could not be read at revision ${short(after)}; showing ${short(before)}. Retry`,
  );
  await readsLine44(source, offset, before, "assert True");
  await readsAtNewRevision(reads, after, 1);

  await browser.retryRead();
  await source.shows("assert 2 == 2");
  await source.isAt(after);
  await source.targets(44);
  await browser.isScrolledTo(offset);
  await browser.showsNoReadFailure();
  await readsAtNewRevision(reads, after, 2);
});
