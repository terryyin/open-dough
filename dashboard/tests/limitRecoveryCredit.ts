// The human-credit recovery journeys (limit-recovery-credit-*.spec.ts): a
// Taken profile's human and Take, withheld by GitHub's rate limit while trunk
// stays at the shown revision, are read on their own once the wait ends,
// asking GitHub only for the ref and the walk's steps not yet answered.
//
// The records are the slice clock journey's (./sliceClockRecords.ts): Yuma's
// story was Taken 5 minutes before the page opened, so its clock measures
// from its Take, the addition that also names its human. Akiho's profile is
// credited before the limit is met; Sola's profile names no human for a
// reason of its own, and its plan's last commit time is unreadable.

import type { Page } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage, parts, rosterParts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import { limiting } from "./limitedReadingJourney.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { untilReported } from "./support/directedWait.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import type { PathChange } from "./pathHistoryAnswers.ts";
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

// GitHub's limit directs a wait this journey waits out.
const directedSeconds = 2;

// The human Yuma's addition credits once it is read, matched to a GitHub
// account whose avatar GitHub's avatar host does not serve.
const recoveredHuman = "Yuri Credited";
export const yumaAddition: PathChange = {
  ...takes.Yuma,
  committer: recoveredHuman,
  login: "yuri-credited",
};

export const isYumaHistory = (request: GhRequest) =>
  request.kind === "commit-list" && request.path === profilePath("Yuma");
export const isCommit = (sha: string) => (request: GhRequest) =>
  request.kind === "commit" && request.sha === sha;

const card = (page: Page, title: string) =>
  parts(page).taken.getByRole("article", { name: title });

// What a recovery asks of GitHub, in the order it was asked, as
// `readsBesideChecks` names it, with each commit by its sha.
export function askedSince(page: Page, from: number): string[] {
  return githubFor(page)
    .calls.slice(from)
    .map((call) =>
      call.request.kind === "commit"
        ? `commit ${call.request.sha}`
        : (readsBesideChecks([call])[0] ?? call.request.kind),
    );
}

// The plan last-commit time GitHub cannot answer, asked again by every fresh
// read: a gap of its own, never the limit's.
export const unreadPlanTime = `commit-list .planning/slice-plans/091-time-unread/PLAN.md@${revision}`;

// Opens the clock records with Yuma's profile history `yumaHistory` and
// Sola's `solaHistory`; GitHub refuses each request `refused` picks with a
// short directed wait, once Akiho's and Sola's additions have reached
// GitHub. The page shows the snapshot with
// Yuma's human and clock withheld by the limit, and says so once.
export async function openedWithYumaWithheld(
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
  const answers = limiting(
    page,
    publishes({
      revision,
      // The project setting selects the current collection, so the roster
      // lists its agents.
      files: { ...files, ".planning/open-dough.json": "{}\n" },
      committed,
      history: {
        ...history,
        [profilePath("Yuma")]: yumaHistory,
        [profilePath("Sola")]: solaHistory,
      },
    }),
    directedSeconds,
  );
  githubFor(page).serve("terryyin/open-dough", answers.answer);
  answers.limit(
    refused,
    isCommit(takes.Akiho.sha),
    ...solaHistory.slice(0, 1).map(({ sha }) => isCommit(sha)),
  );
  await page.goto("/");
  await expectSettledPage(page);
  const limitSeenAt = answers.lift();
  const yumaCard = card(page, justTaken);
  await expect(yumaCard.locator(".card-owner .owner-human-gap")).toHaveText(
    "Human developer unknown",
  );
  await expect(yumaCard).toContainText(
    "Current slice time unavailable: GitHub limited the rate of the local GitHub CLI's requests",
  );
  await expect(
    (await inspectedDetail(yumaCard)).locator(".owner-human"),
  ).toContainText(
    "Human developer unknown. GitHub limited the rate of the local GitHub CLI's requests",
  );
  await expect(parts(page).problem).toHaveCount(1);
  return { limitSeenAt, asked: githubFor(page).calls.length };
}

// Lets the reported wait, which began before `limitSeenAt`, pass on the
// server's clock and then on the page's, with the page visible and trunk
// unchanged.
export async function waitedOut(page: Page, limitSeenAt: number) {
  await untilReported(limitSeenAt, directedSeconds);
  await page.clock.runFor(directedSeconds * 1_000 + 500);
  await expectSettledPage(page);
  await expect(page.getByText("Reading human developer…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
}

// Once the wait has passed: the notice is gone; Yuma's human appears on its
// card, in its detail, and in the roster, with its avatar's initials in
// place of an avatar GitHub's host does not serve; its Take clock comes from
// the same addition; Akiho stays credited; Sola keeps `solaExplained`; and
// the unreadable plan time keeps its own gap.
export async function expectRecovered(page: Page, solaExplained: string) {
  await test.step("the credited human appears on its card, detail, and roster, and its Take clock beside it, with the notice gone", async () => {
    // Rate-limit notice is gone; an unrelated unread plan time may still
    // schedule project-local recovery of its own eligible gap.
    await expect(page.locator("body")).not.toContainText(
      "GitHub limited the rate",
    );
    const yumaCard = card(page, justTaken);
    await expect(yumaCard.locator(".card-owner")).toContainText(recoveredHuman);
    await expect(yumaCard).toContainText("Current slice started 5 min ago");
    const human = (await inspectedDetail(yumaCard)).locator(".owner-human");
    await expect(human).toHaveText(`Human developer: ${recoveredHuman}`);
    await expect(
      (await inspectedDetail(card(page, afterTake))).locator(".owner-human"),
    ).toHaveText("Human developer: Fixture Committer");
    await expect(card(page, timeUnread)).not.toContainText(
      "Current slice started",
    );
    await expect(page.locator("body")).not.toContainText(
      "GitHub limited the rate",
    );
    const { member, opener, back } = rosterParts(page);
    await opener("Yuma-chan").click();
    await expect(member("Yuma-chan").locator(".owner-human")).toHaveText(
      `Human developer: ${recoveredHuman}`,
    );
    await expect(
      member("Yuma-chan").locator(".human-avatar-fallback"),
    ).toHaveText("YC");
    await expect(member("Sola-chan").locator(".owner-human")).toHaveText(
      solaExplained,
    );
    await back.click();
  });
}
