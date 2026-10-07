// A profile history GitHub's rate limit refused, at a trunk revision that
// does not move, is read on its own once the wait ends: its human appears on
// its card, detail, and roster, and its Take clock beside it, asking GitHub
// only the ref, that history, and its addition (./limitRecoveryCredit.ts).

import { expect, test } from "./dashboardTest.ts";
import {
  askedSince,
  expectRecovered,
  isYumaHistory,
  openedWithYumaWithheld,
  unreadPlanTime,
  waitedOut,
  yumaAddition,
} from "./limitRecoveryCredit.ts";
import { pathChange } from "./pathHistoryAnswers.ts";
import { profilePath, revision, takes } from "./sliceClockRecords.ts";

test("a limited profile history is read once the wait ends, crediting its human and Take clock without a reload", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const { limitSeenAt, asked } = await openedWithYumaWithheld(page, {
    yumaHistory: [yumaAddition],
    // Sola's addition names no usable committer.
    solaHistory: [pathChange(0x53, "added", "   ")],
    refused: isYumaHistory,
  });
  await waitedOut(page, limitSeenAt);
  await expectRecovered(
    page,
    "Human developer unknown: the commit that added this agent profile names no usable committer.",
  );
  expect(askedSince(page, asked).sort()).toEqual(
    [
      "ref main",
      `commit-list ${profilePath("Yuma")}@${revision}`,
      `commit ${takes.Yuma.sha}`,
      unreadPlanTime,
    ].sort(),
  );
});
