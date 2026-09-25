// A visible dashboard recovers from failed automatic reads without misstating
// what was published: a failed revision check, or a failed read of the
// newly found commit's backlog, keeps the last successful snapshot with its
// own revision and retrieval time and reports the failed attempt; checks go
// on only at the steady pace; and a later scheduled check that succeeds
// clears the failure. An unavailable detail of a shown revision stays labeled
// and is read again only when the person asks; so does a detail still unread
// when the read's wait bound gives it up, whose failed attempt a later
// unchanged check does not clear. A rate limit's directed wait:
// ./auto-refresh-rate-limit.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and fails answers. The
// page's clock is paused and advanced by the test.

import type { Locator, Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectWholeSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  callsSince,
  checksAskedWhilePassing,
  contentReads,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilChecked,
  recordsAt,
  headsChecks,
} from "./autoRefreshJourney.ts";
import { noConnection, type OriginAnswer } from "./publishedOrigin.ts";
import {
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";

// `gh` fails in a way the boundary cannot put a category to.
const unexplainedFailure: OriginAnswer = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

const claimsStory = "Publish shared backlog claims";
const claimsRecord = ".planning/seeds/SEED-040-claims.md";
const gap = "The canonical record could not be read for preparation facts.";

// Asking again (Refresh, or Retry after a failed attempt) reads the claims
// record at B and closes its gap, reading nothing at any other revision.
async function expectGapClosedAtB(page: Page, askAgain: Locator) {
  const { source, backlog, problem } = parts(page);
  const claimsCard = backlog.getByRole("article", { name: claimsStory });
  const from = githubFor(page).calls.length;
  await askAgain.click();
  await expect(claimsCard).not.toContainText(gap);
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  await claimsCard.getByRole("button", { name: "Inspect story" }).click();
  await expect(claimsCard).toContainText(`${claimsStory}, as published at B.`);
  await expect(source).toContainText(revisionB);
  await expect(problem).toHaveCount(0);
  await expect
    .poll(() => contentReads(callsSince(page, from)))
    .toContain(`${claimsRecord}?ref=${revisionB}`);
  expect(
    contentReads(callsSince(page, from)).every((read) =>
      read.endsWith(`?ref=${revisionB}`),
    ),
  ).toBe(true);
}

test("auto refresh recovery: a failed check, then a failed read of B's backlog, keep A with its own revision and retrieval time and retry only at the steady pace, until the next scheduled check reads B and clears the failure", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, stages, problem, retry, refresh } = parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  const restoreMain = origin.answerWith("main", unexplainedFailure);

  await test.step("a failed check is reported, and A is still named the last successful snapshot", async () => {
    expectSteadyPace(await passTimeUntilChecked(page, 502));
    await expect(problem).toContainText("Published work could not be read");
    await expect(problem).toContainText(
      "The local authenticated read failed while reading main of terryyin/open-dough.",
    );
    await expect(problem).toContainText(
      "What is shown is the earlier snapshot, retrieved at",
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expect(problem).toContainText(
      "Automatic checks continue every 15 seconds while this page is visible. Press Retry to read again now.",
    );
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [revisionB],
    );
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
    await expect(retry).toBeVisible();
  });

  restoreMain();
  origin.push(revisionB, backlogB, recordsAt("B"));
  const restoreBacklogAtB = origin.answerWith(revisionB, noConnection);
  const beforeB = githubFor(page).calls.length;

  await test.step("B is found at the steady pace, but its backlog cannot be read: A stays, and the failed read of B is reported", async () => {
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(problem).toContainText(
      `The local GitHub CLI could not reach GitHub while reading .planning/PRODUCT-BACKLOG.md at ${revisionB}.`,
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expectMembership(page, titlesOfA);
    await expect(source).toContainText(revisionA);
    await expect(source).not.toContainText(revisionB);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
    await expect(stages.locator(`a[href*="${revisionB}"]`)).toHaveCount(0);
    await expect(retry).toBeVisible();
    const calls = callsSince(page, beforeB);
    expect(headsChecks(calls)).toHaveLength(1);
    expect(contentReads(calls)).toEqual([
      `.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`,
    ]);
  });

  await test.step("nothing is asked again sooner than the steady pace", async () => {
    const quietFrom = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, 14_000)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
  });

  await test.step("the next scheduled check finds B again, reads it whole, and clears the failure", async () => {
    restoreBacklogAtB();
    const passed = await passTimeUntilChecked(page);
    expectSteadyPace(14_000 + passed);
    await expectMembership(page, titlesOfB);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA);
    await expect(problem).toHaveCount(0);
    await expect(refresh).toHaveAccessibleName("Refresh");
  });
});

test("auto refresh recovery: an unavailable detail of B stays labeled, is not read again while main stays at B, and manual Refresh reads it at the same revision", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, backlog, problem, refresh } = parts(page);
  const recordsB = recordsAt("B");
  const { [claimsRecord]: claimsAtB, ...withoutClaims } = recordsB;
  expect(claimsAtB).toBeDefined();
  origin.push(revisionB, backlogB, withoutClaims);
  const claimsCard = backlog.getByRole("article", { name: claimsStory });

  await test.step("B is shown, with the unavailable record labeled on its own card", async () => {
    expect(await passTimeUntilChecked(page)).toBeLessThanOrEqual(15_250);
    await expectMembership(page, titlesOfB);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expect(source).toContainText(revisionB);
    await expect(claimsCard).toContainText(gap);
    await expect(problem).toHaveCount(0);
  });

  await test.step("unchanged checks never read the detail again", async () => {
    const from = githubFor(page).calls.length;
    for (let check = 0; check < 2; check += 1) {
      expectSteadyPace(await passTimeUntilChecked(page));
    }
    const calls = callsSince(page, from);
    expect(headsChecks(calls)).toHaveLength(2);
    expect(contentReads(calls)).toEqual([]);
    await expect(claimsCard).toContainText(gap);
  });

  await test.step("manual Refresh reads the record again at B, and the gap closes", async () => {
    origin.push(revisionB, backlogB, recordsB);
    await expectGapClosedAtB(page, refresh);
  });
});

test("auto refresh recovery: a detail of B still unread at the wait bound is labeled as a gap, the failed attempt says B's membership was read, an unchanged check keeps that failure and reads nothing, and Retry reads the detail at B", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, backlog, problem, retry, status } = parts(page);
  const recordsB = recordsAt("B");
  origin.push(revisionB, backlogB, recordsB);
  const releaseClaims = origin.hold(claimsRecord);
  const claimsCard = backlog.getByRole("article", { name: claimsStory });
  const readAtB = `after reading the published work at revision ${revisionB.slice(0, 7)}`;

  await test.step("B's membership is shown while one of its records is still being read", async () => {
    expectSteadyPace(await passTimeUntilChecked(page));
    await expectMembership(page, titlesOfB);
    await expect
      .poll(() =>
        contentReads(origin.requests).includes(
          `${claimsRecord}?ref=${revisionB}`,
        ),
      )
      .toBe(true);
    await expect(claimsCard).toContainText("Reading preparation…");
  });

  await test.step("at the wait bound the unread record is labeled as a gap, and the failed attempt says B's membership was read", async () => {
    await page.clock.runFor(30_000);
    await expect(problem).toContainText(
      "GitHub did not answer within 30 seconds, so the read was given up.",
    );
    await expect(problem).toContainText(readAtB);
    await expect(problem).toContainText("What is shown is what it read");
    await expect(problem).not.toContainText("added nothing");
    await expect(claimsCard).toContainText(gap);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expect(source).toContainText(revisionB);
    await expect(retry).toBeVisible();
  });

  await test.step("an unchanged check keeps the failure, settles no read status, and reads no content", async () => {
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    const calls = callsSince(page, from);
    expect(headsChecks(calls)).toHaveLength(1);
    expect(contentReads(calls)).toEqual([]);
    await expect(problem).toContainText(readAtB);
    await expect(status).toHaveText("");
    await expect(claimsCard).toContainText(gap);
    await expect(retry).toBeVisible();
  });

  await test.step("Retry reads the record again at B, and the gap closes", async () => {
    releaseClaims();
    await expectGapClosedAtB(page, retry);
  });
});
