// A profile's addition commit GitHub's rate limit refused partway through
// the walk back from a trunk revision that does not move is read on its own
// once the wait ends: the history listing and the commit walked before the
// refusal are not asked again, and the human appears on its card, detail,
// and roster, with its Take clock beside it (./limitRecoveryCredit.ts).

import { expect, test } from "./dashboardTest.ts";
import {
  askedSince,
  expectRecovered,
  isCommit,
  openedWithYumaWithheld,
  waitedOut,
  yumaAddition,
} from "./limitRecoveryCredit.ts";
import { pathChange } from "./pathHistoryAnswers.ts";
import { takes } from "./sliceClockRecords.ts";

test("an addition commit limited during the walk is read once the wait ends, reusing the steps already answered", async ({
  page,
}) => {
  test.setTimeout(60_000);
  // Yuma's profile was modified after the commit that added it.
  const modified = pathChange(0x54, "modified", "Another Committer");
  const { limitSeenAt, asked } = await openedWithYumaWithheld(page, {
    yumaHistory: [modified, yumaAddition],
    // Sola's recent history only modifies its profile.
    solaHistory: [pathChange(0x53, "modified", "Another Committer")],
    refused: isCommit(takes.Yuma.sha),
  });
  await waitedOut(page, limitSeenAt);
  await expectRecovered(
    page,
    "Human developer unknown: no commit adding this agent profile was found in its recent published history.",
  );
  expect(askedSince(page, asked).sort()).toEqual(
    ["ref main", `commit ${takes.Yuma.sha}`].sort(),
  );
});
