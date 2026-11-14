// A profile history or addition-walk step that fails temporarily recovers on
// its own at an unchanged revision: human credit and Take clock share one
// addition, answered walk steps are not asked again, and card, inspection,
// and roster update without reload. Page time is paused.

import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { storyCard } from "../../dashboard/tests/storyCardControls.ts";
import { credit, detailHuman } from "../../dashboard/tests/agentCredit.ts";
import {
  askedSince,
  expectRecovered,
  isCommit,
  isYumaHistory,
  yumaAddition,
} from "../../dashboard/tests/limitRecoveryCredit.ts";
import { noConnection } from "../../dashboard/tests/originAnswers.ts";
import { untilPageReadsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  pathChange,
  type PathChange,
} from "../../dashboard/tests/pathHistoryAnswers.ts";
import { publishes } from "../../dashboard/tests/support/fakeGitHub.ts";
import type { GhRequest } from "../../dashboard/tests/support/ghRequest.ts";
import {
  committed,
  files,
  history,
  opened,
  justTaken,
  profilePath,
  revision,
  takes,
} from "../../dashboard/tests/sliceClockRecords.ts";
import { detailRecovery } from "../../dashboard/tests/transientRecoveryPage.ts";

type Page = Parameters<typeof parts>[0];

// Opens the clock records (../../dashboard/tests/limitRecoveryCredit.ts) with Yuma's profile
// history `yumaHistory` and Sola's `solaHistory`; GitHub cannot be reached for
// each request `refused` picks until `heal` is called. The page shows the
// snapshot with Yuma's human and clock unknown, and says it reads them again.
async function openWithYumaRefused(
  page: Page,
  {
    yumaHistory,
    solaHistory,
    refused,
  }: {
    readonly yumaHistory: readonly PathChange[];
    readonly solaHistory: readonly PathChange[];
    readonly refused: (request: GhRequest) => boolean;
  },
) {
  await pausePageClockAt(page, opened);
  let refuse = true;
  const published = publishes({
    revision,
    files: { ...files, ".planning/open-dough.json": "{}\n" },
    committed,
    history: {
      ...history,
      [profilePath("Yuma")]: yumaHistory,
      [profilePath("Sola")]: solaHistory,
    },
  });
  githubFor(page).serve("terryyin/open-dough", (call) =>
    refuse && refused(call.request)
      ? Promise.resolve(noConnection)
      : published(call),
  );
  await page.goto("/");
  await expectSettledPage(page);
  const yumaCard = storyCard(parts(page).taken, justTaken);
  await expect(credit(yumaCard).humanGap).toHaveText("Human developer unknown");
  await expect(yumaCard).toContainText("Current slice time unavailable");
  await expect(await detailHuman(yumaCard)).toContainText(
    "Human developer unknown",
  );
  await expect(parts(page).problem).toContainText(detailRecovery);
  await untilPageReadsAnswered(page);
  return {
    heal: () => {
      refuse = false;
    },
    asked: githubFor(page).calls.length,
  };
}

test("a refused profile history recovers human credit and Take clock from one shared addition without reload", async ({
  page,
}) => {
  const { heal, asked } = await openWithYumaRefused(page, {
    yumaHistory: [yumaAddition],
    solaHistory: [pathChange(0x53, "added", "   ")],
    refused: isYumaHistory,
  });
  heal();
  await page.clock.runFor(15_250);
  await untilPageReadsAnswered(page);
  await expectRecovered(
    page,
    "Human developer unknown: the commit that added this agent profile names no usable committer.",
  );
  expect(askedSince(page, asked).sort()).toEqual(
    [
      "ref main",
      `commit-list ${profilePath("Yuma")}@${revision}`,
      `commit ${takes.Yuma.sha}`,
    ].sort(),
  );
});

test("a refused addition commit mid-walk recovers without re-asking answered history steps", async ({
  page,
}) => {
  const modified = pathChange(0x54, "modified", "Another Committer");
  const { heal, asked } = await openWithYumaRefused(page, {
    yumaHistory: [modified, yumaAddition],
    solaHistory: [pathChange(0x53, "modified", "Another Committer")],
    refused: isCommit(takes.Yuma.sha),
  });
  heal();
  await page.clock.runFor(15_250);
  await untilPageReadsAnswered(page);
  await expectRecovered(
    page,
    "Human developer unknown: no commit adding this agent profile was found in its recent published history.",
  );
  expect(askedSince(page, asked).sort()).toEqual(
    ["ref main", `commit ${takes.Yuma.sha}`].sort(),
  );
});
