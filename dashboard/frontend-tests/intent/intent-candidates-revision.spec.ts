// Optimization Candidates, shown across a newer offered revision, stays the
// chosen view and keeps the record of the revision Intent reads until
// **Show latest**, which reads the record recorded at the new revision
// (../../src/IntentCandidatesRecord.tsx, ../../src/IntentRevisionNotice.tsx).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import { mountIntentReading } from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

const before = "ab".repeat(20);
const after = "e9".repeat(20);
const recordWith = (slug: string) =>
  makeMe.aTestOptimizationCandidatesRecord
    .pending(slug, "`dashboard/tests/launch.spec.ts`")
    .please();
const records: Record<string, string> = {
  [before]: recordWith("launch-records-poll-waits"),
  [after]: recordWith("launch-records-page-clock"),
};

// Every record read, by revision, answered with that revision's record.
function recordReads(): { reads: string[]; readSource: IntentReadSource } {
  const reads: string[] = [];
  return {
    reads,
    readSource: {
      readLocations: () =>
        Promise.resolve({ status: "configured", locations: [] }),
      readCandidates(...[, revision]) {
        reads.push(revision);
        const text = records[revision] ?? "";
        return Promise.resolve({ status: "present", text });
      },
      readFile: () => Promise.reject(new Error("no case reads a file")),
    },
  };
}

test("Optimization Candidates shown across a new revision stays chosen and reads that revision's record after Show latest", async () => {
  const { reads, readSource } = recordReads();
  const intent = await mountIntentReading(readSource, before, "candidates");
  const candidates = intentCandidates();
  await candidates.isChosen();
  await candidates.isRecordedAt(before);
  await candidates.shows("launch-records-poll-waits");

  intent.offerRevision(after);
  const notice = await intentRevisionNotice().isShownOnce();
  await candidates.isChosen();
  await candidates.isRecordedAt(before);
  await candidates.shows("launch-records-poll-waits");

  await notice.showLatest();
  await candidates.isChosen();
  await candidates.isRecordedAt(after);
  await candidates.shows("launch-records-page-clock");
  await candidates.lacks("launch-records-poll-waits");
  expect(reads).toContain(after);
});
