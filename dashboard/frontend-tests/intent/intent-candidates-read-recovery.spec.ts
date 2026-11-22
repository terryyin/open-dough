// The candidates record recovers on the page's shared clock: a shorter
// transient backoff cannot bypass a standing GitHub wait, and a refusal or
// malformed answer waits for manual Retry (../../src/IntentCandidatesRecord.tsx,
// ../../src/intentReadRecovery.tsx, ../../src/limitRecovery.ts).
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { noteLimit, standingLimit } from "../../src/readingLimit.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-candidates-publication.ts";

const recordText = makeMe.aTestOptimizationCandidatesRecord.please();
const { record } = intentCandidates();
const retry = record.getByRole("button", { name: "Retry", exact: true });

type Answer = () => Promise<IntentCandidatesReadResult>;

// Each candidates answer in turn, the last repeated; counts every read.
function answering(first: Answer, ...later: Answer[]) {
  const { readSource } = publishedWithCandidates(recordText);
  const reads: string[] = [];
  const source: IntentReadSource = {
    ...readSource,
    readCandidates(...[, revision]) {
      reads.push(revision);
      const answer = [first, ...later][reads.length - 1];
      return (answer ?? later.at(-1) ?? first)();
    },
  };
  return { reads, source };
}

function onSharedClock() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}

async function mountRecord(source: IntentReadSource) {
  const work = makeMe.aPublishedWork.ofPygardon.at("c5".repeat(20)).please();
  await mountPageIntentReading(source, work);
  await intentCandidates().choose();
}

const present = () =>
  Promise.resolve<IntentCandidatesReadResult>({
    status: "present",
    text: recordText,
  });

test("candidates wait for the standing GitHub limit after their shorter backoff is due", async () => {
  onSharedClock();
  let resumesAt = 0;
  const { reads, source } = answering(
    () => Promise.reject(new ReadProblem("reset", undefined, "transient")),
    () => {
      noteLimit(45);
      const standing = standingLimit() ?? new Date(0);
      resumesAt = standing.getTime();
      return Promise.reject(
        new ReadProblem("GitHub limited the rate", {
          reading: "candidates",
          resumesAt: standing,
        }),
      );
    },
    present,
  );
  await mountRecord(source);
  await expect.element(retry).toBeVisible();
  expect(reads).toHaveLength(1);

  await vi.advanceTimersByTimeAsync(15_250);
  await expect.poll(() => reads.length).toBe(2);
  await expect.element(retry).toBeVisible();

  await vi.advanceTimersByTimeAsync(resumesAt - Date.now() - 1);
  expect(reads).toHaveLength(2);
  await expect.element(retry).toBeVisible();

  await vi.advanceTimersByTimeAsync(251);
  await expect.poll(() => reads.length).toBe(3);
  await expect
    .element(record.getByRole("region", { name: "Pending candidates" }))
    .toBeVisible();
  await intentCandidates().showsNoFailure();
});

test("candidate access refusal and unexpected answers wait for manual Retry", async () => {
  onSharedClock();
  const terminal = (message: string) => () =>
    Promise.reject(new ReadProblem(message));
  const { reads, source } = answering(
    terminal("Forbidden"),
    terminal("an answer in a shape this dashboard does not understand"),
    present,
  );
  await mountRecord(source);
  await expect.element(retry).toBeVisible();
  await vi.advanceTimersByTimeAsync(70_000);
  expect(reads, "no spontaneous reread after a refusal").toHaveLength(1);

  await retry.click();
  await expect.poll(() => reads.length).toBe(2);
  await expect.element(retry).toBeVisible();
  await vi.advanceTimersByTimeAsync(70_000);
  expect(reads, "no spontaneous reread when malformed").toHaveLength(2);

  await retry.click();
  await expect.poll(() => reads.length).toBe(3);
  await intentCandidates().showsNoFailure();
});

test.each([
  { state: "absent", answer: { status: "absent" } },
  {
    state: "mismatched",
    answer: { status: "present", text: "# Not A Candidates Record\n" },
  },
] as const)(
  "an $state record is not reread after the old retry windows",
  async ({ answer }) => {
    onSharedClock();
    const { reads, source } = answering(() => Promise.resolve(answer));
    await mountRecord(source);
    await expect.poll(() => reads.length).toBe(1);
    await vi.advanceTimersByTimeAsync(70_000);
    expect(reads).toHaveLength(1);
  },
);
