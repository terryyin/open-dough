// A fresh collecting dashboard reads the provider’s repeat for saved accepted
// requests, without a receipt journey. Raw conclusion fields are exact
// provider input under test, not supplied outcomes.
import { historyWallTimeMs } from "../../src/landedCiHistory.ts";
import {
  expect,
  queuedClaudeBoundaryTest as test,
} from "../../tests/support/landedCiHistoryTest.ts";
import {
  rerunRuns,
  saveRepeatRequests,
  savedRepeatComparison,
  savedRepeatRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";

test.use({ serverMode: "boundary" });

test("saved accepted requests never invent a failure or a success from an absent or unknown completed repeat verdict", async ({
  origin,
  github,
  startServer,
}) => {
  const accepted = {
    seconds: 120,
    averageSeconds: 100,
    submission: { kind: "accepted" },
  } as const;
  const repeats = [
    { run: 71, verdict: undefined, reads: "has no provider verdict" },
    { run: 72, verdict: null, reads: "has no provider verdict" },
    { run: 73, verdict: "neutral", reads: "CI reported neutral" },
    { run: 74, verdict: "skipped", reads: "CI reported skipped" },
    {
      run: 75,
      verdict: "provider-future-state",
      reads: "CI reported provider-future-state",
    },
  ] as const;
  const named = (verdict: string | null | undefined) =>
    `conclusion ${verdict === undefined ? "absent" : String(verdict)}`;
  const provider = await saveRepeatRequests(
    origin,
    github,
    repeats.map(({ run }) => ({ run, ...accepted })),
  );
  for (const { run, verdict } of repeats) {
    provider(run).setRepeat({ seconds: 106 });
    provider(run).providerVerdict(verdict);
  }
  const server = await startServer();
  const outcome = (run: number) => savedRepeatRequest(server, run)?.outcome;
  // One expectation per conclusion, in the order the ledger holds the requests.
  for (const { run, verdict, reads } of repeats) {
    const conclusion = named(verdict);
    await expect
      .poll(() => outcome(run), conclusion)
      .toMatchObject({
        kind: "unverified",
        explanation: expect.stringContaining(reads),
      });
    expect(outcome(run)?.explanation, conclusion).not.toContain("failed");
  }
  for (const { run } of repeats)
    expect(savedRepeatComparison(server, run)).toEqual({
      run,
      attempt: 1,
      originalMs: 120000,
      averageMs: 100000,
    });
  const undecided = repeats.filter(
    ({ verdict }) => verdict === undefined || verdict === null,
  );
  for (const { run } of undecided) provider(run).providerVerdict("success");
  for (const { run, verdict } of undecided) {
    const decided = `${named(verdict)}, then success`;
    await expect
      .poll(() => outcome(run), decided)
      .toMatchObject({ kind: "slow", explanation: "Possible CI slowdown" });
    const repeat = outcome(run)?.repeat;
    expect(
      historyWallTimeMs(repeat?.startedAt, repeat?.completedAt),
      decided,
    ).toBe(106000);
  }
  expect(rerunRuns(github)).toEqual([]);
});

test("saved accepted requests read the outcome their provider repeat decides beside the original and average", async ({
  origin,
  github,
  startServer,
}) => {
  const accepted = {
    seconds: 120,
    averageSeconds: 100,
    submission: { kind: "accepted" },
  } as const;
  const unverified = (naming: string) => ({
    kind: "unverified",
    explanation: expect.stringContaining(naming),
  });
  const repeats = [
    {
      run: 71,
      repeat: { seconds: 104 },
      reads: "recovered",
      outcome: {
        kind: "recovered",
        explanation: "CI timing returned to range",
      },
    },
    {
      run: 72,
      repeat: { conclusion: "failure" },
      reads: "failed",
      outcome: unverified("failed"),
    },
    {
      run: 73,
      repeat: { conclusion: "cancelled" },
      reads: "cancelled",
      outcome: unverified("cancelled"),
    },
    {
      run: 74,
      repeat: { full: false },
      reads: "partial proof",
      outcome: unverified("Full comparable repeat is unverified"),
    },
  ] as const;
  const provider = await saveRepeatRequests(
    origin,
    github,
    repeats.map(({ run }) => ({ run, ...accepted })),
  );
  for (const { run, repeat } of repeats) provider(run).setRepeat(repeat);
  const server = await startServer();
  // One expectation per outcome, in the order the ledger holds the requests.
  for (const { run, reads, outcome } of repeats)
    await expect
      .poll(() => savedRepeatRequest(server, run)?.outcome, reads)
      .toMatchObject(outcome);
  for (const { run } of repeats)
    expect(savedRepeatComparison(server, run)).toEqual({
      run,
      attempt: 1,
      originalMs: 120000,
      averageMs: 100000,
    });
  expect(rerunRuns(github)).toEqual([]);
});
