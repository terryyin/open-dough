// Intent reads a project's live Test Optimization Candidates record
// (../../src/IntentCandidatesRecord.tsx) on its Optimization Candidates tab:
// each live candidate under Live candidates with its five facts, its affected
// test opening in Purpose, and a live record holding `None.` as having no
// live candidates rather than as a missing record.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { PublishedWork } from "../../src/publishedWork.ts";
import {
  intentCandidates,
  textAsRead,
  textsOf,
} from "./intent-candidates-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-revision-fixtures.ts";

const revision = "97".repeat(20);
const work: PublishedWork = makeMe.aPublishedWork.ofPygardon
  .at(revision)
  .please();
const { record } = intentCandidates();
const live = record.getByRole("region", { name: "Live candidates" });

async function readLive(text: string) {
  const { readSource } = publishedWithCandidates(text);
  await mountPageIntentReading(readSource, work);
  return (await intentCandidates().choose()).isRecordedAt(revision);
}

test("Intent shows each live candidate with its five facts, and its affected test opens in Purpose", async () => {
  const facts = {
    observedCost: "115.3s for 10 cases in CI run 42550972063, 12 shards",
    uniqueProtection: "a failed production update reaches the watcher's report",
    alternativesTried:
      "boundary proof of each failure kind; the chain stays integrated",
    decisionOrEvidenceNeeded:
      "whether one dashboard per file keeps the isolation each case relies on",
  };
  const candidates = await readLive(
    makeMe.aTestOptimizationCandidatesRecord
      .live()
      .candidate(
        "production-watcher-failure-chains",
        `\`${pygardonFeatures.jobs}\``,
        facts,
      )
      .candidate("second-server-preview", "`tests/second_server.py`")
      .please(),
  );

  await candidates.shows("production-watcher-failure-chains");
  expect(textsOf(record.getByRole("heading", { level: 3 }))).toEqual([
    "Test Optimization Candidates",
    "Live candidates",
  ]);
  expect(textsOf(live.getByRole("heading", { level: 4 }))).toEqual([
    "production-watcher-failure-chains",
    "second-server-preview",
  ]);
  const candidate = live.getByRole("article", {
    name: "production-watcher-failure-chains",
  });
  expect(textsOf(candidate.getByRole("term"))).toEqual([
    "Affected test or fixture",
    "Observed cost and conditions",
    "Unique protection",
    "Alternatives tried",
    "Decision or evidence needed",
  ]);
  await expect
    .poll(() =>
      candidate
        .getByRole("definition")
        .elements()
        .map((definition) => textAsRead(page.elementLocator(definition))),
    )
    .toEqual([
      pygardonFeatures.jobs,
      facts.observedCost,
      facts.uniqueProtection,
      facts.alternativesTried,
      facts.decisionOrEvidenceNeeded,
    ]);
  expect(textAsRead(record)).not.toContain("This record has no");

  await (
    await candidates.openSource(
      "production-watcher-failure-chains",
      pygardonFeatures.jobs,
    )
  ).shows("Scenario: List jobs");
  await expect
    .element(page.getByRole("region", { name: "Purpose", exact: true }))
    .toBeVisible();
});

test("Intent reads a live record holding None. as having no live candidates, not as a missing record", async () => {
  const candidates = await readLive(
    makeMe.aTestOptimizationCandidatesRecord.live().please(),
  );

  await expect
    .poll(() => textAsRead(record))
    .toContain("This record has no live candidates.");
  await expect.poll(() => textAsRead(live)).toContain("None.");
  await candidates.showsNoFailure();
});
