// A profile history GitHub's rate limit refused, at a trunk revision that
// does not move, is read on its own once the wait ends: its human appears on
// its card, detail, and roster, and its Take clock beside it, asking GitHub
// only the ref, that history, and its addition (../../dashboard/test-support/limitRecoveryCredit.ts).

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  askedSince,
  expectRecovered,
  isYumaHistory,
  openedWithYumaWithheld,
  waitedOut,
  yumaAddition,
} from "../../dashboard/test-support/limitRecoveryCredit.ts";
import { pathChange } from "../../dashboard/test-support/pathHistoryAnswers.ts";
import {
  profilePath,
  takes,
} from "../../dashboard/test-support/sliceClockRecords.ts";

test("a limited profile history is read once the wait ends, crediting its human and Take clock without a reload", async ({
  page,
}) => {
  const { revision, limitSeenAt, asked } = await openedWithYumaWithheld(page, {
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
  // Unrelated empty/missing plan history stays terminal; recovery asks only
  // the limited credit walk.
  expect(askedSince(page, asked).sort()).toEqual(
    [
      "ref main",
      `commit-list ${profilePath("Yuma")}@${revision}`,
      `commit ${takes.Yuma.sha}`,
    ].sort(),
  );
});
