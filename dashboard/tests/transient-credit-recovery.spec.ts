// A profile history or addition-walk step that fails temporarily recovers on
// its own at an unchanged revision: human credit and Take clock share one
// addition, answered walk steps are not asked again, and card, inspection,
// and roster update without reload. Page time is paused.

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage, parts, rosterParts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import { noConnection } from "./originAnswers.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { pathChange } from "./pathHistoryAnswers.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  committed,
  files,
  history,
  opened,
  afterTake,
  justTaken,
  profilePath,
  revision,
  takes,
  timeUnread,
} from "./sliceClockRecords.ts";

const recoveredHuman = "Yuri Credited";
const yumaAddition = {
  ...takes.Yuma,
  committer: recoveredHuman,
  login: "yuri-credited",
};
const detailRecovery = "this page reads it";
const isYumaHistory = (request: GhRequest) =>
  request.kind === "commit-list" && request.path === profilePath("Yuma");
const isCommit = (sha: string) => (request: GhRequest) =>
  request.kind === "commit" && request.sha === sha;

const card = (page: Parameters<typeof parts>[0], title: string) =>
  parts(page).taken.getByRole("article", { name: title });

function askedSince(page: Parameters<typeof parts>[0], from: number): string[] {
  return githubFor(page)
    .calls.slice(from)
    .map((call) =>
      call.request.kind === "commit"
        ? `commit ${call.request.sha}`
        : (readsBesideChecks([call])[0] ?? call.request.kind),
    );
}

async function openWithYumaRefused(
  page: Parameters<typeof parts>[0],
  {
    yumaHistory,
    solaHistory,
    refused,
  }: {
    readonly yumaHistory: readonly ReturnType<typeof pathChange>[];
    readonly solaHistory: readonly ReturnType<typeof pathChange>[];
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
  const yumaCard = card(page, justTaken);
  await expect(yumaCard.locator(".card-owner .owner-human-gap")).toHaveText(
    "Human developer unknown",
  );
  await expect(yumaCard).toContainText("Current slice time unavailable");
  await expect(
    (await inspectedDetail(yumaCard)).locator(".owner-human"),
  ).toContainText("Human developer unknown");
  await expect(parts(page).problem).toContainText(detailRecovery);
  await untilPageReadsAnswered(page);
  return {
    heal: () => {
      refuse = false;
    },
    asked: githubFor(page).calls.length,
  };
}

async function expectCreditRecovered(
  page: Parameters<typeof parts>[0],
  solaExplained: string,
) {
  // Credit is restored; an unrelated unread plan time may still schedule
  // project-local recovery of its own eligible gap.
  await expect(page.locator("body")).not.toContainText(
    "GitHub limited the rate",
  );
  const yumaCard = card(page, justTaken);
  await expect(yumaCard.locator(".card-owner")).toContainText(recoveredHuman);
  await expect(yumaCard).toContainText("Current slice started 5 min ago");
  await expect(
    (await inspectedDetail(yumaCard)).locator(".owner-human"),
  ).toHaveText(`Human developer: ${recoveredHuman}`);
  await expect(
    (await inspectedDetail(card(page, afterTake))).locator(".owner-human"),
  ).toHaveText("Human developer: Fixture Committer");
  await expect(card(page, timeUnread)).not.toContainText(
    "Current slice started",
  );
  const { member, opener, back } = rosterParts(page);
  await opener("Yuma-chan").click();
  await expect(member("Yuma-chan").locator(".owner-human")).toHaveText(
    `Human developer: ${recoveredHuman}`,
  );
  await expect(member("Sola-chan").locator(".owner-human")).toHaveText(
    solaExplained,
  );
  await back.click();
}

test("a refused profile history recovers human credit and Take clock from one shared addition without reload", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const { heal, asked } = await openWithYumaRefused(page, {
    yumaHistory: [yumaAddition],
    solaHistory: [pathChange(0x53, "added", "   ")],
    refused: isYumaHistory,
  });
  heal();
  await page.clock.runFor(15_250);
  await untilPageReadsAnswered(page);
  await expectCreditRecovered(
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
  test.setTimeout(60_000);
  const modified = pathChange(0x54, "modified", "Another Committer");
  const { heal, asked } = await openWithYumaRefused(page, {
    yumaHistory: [modified, yumaAddition],
    solaHistory: [pathChange(0x53, "modified", "Another Committer")],
    refused: isCommit(takes.Yuma.sha),
  });
  heal();
  await page.clock.runFor(15_250);
  await untilPageReadsAnswered(page);
  await expectCreditRecovered(
    page,
    "Human developer unknown: no commit adding this agent profile was found in its recent published history.",
  );
  expect(askedSince(page, asked).sort()).toEqual(
    ["ref main", `commit ${takes.Yuma.sha}`].sort(),
  );
});
