// An unavailable detail of a revision the dashboard shows stays labeled and is
// read again only when the page is reloaded; so does a detail still unread
// when the read's wait bound gives it up, whose failed attempt a later
// unchanged check does not clear. Failed checks and reads of a newly found
// commit: ./auto-refresh-recovery.spec.ts. The page, its local authenticated
// read boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and holds answers. The
// page's clock is paused and advanced by the test.

import type { Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  callsSince,
  contentReads,
  expectSteadyPace,
  headsChecks,
  openSettledAtA,
  passTimeUntilChecked,
  recordsAt,
} from "./autoRefreshJourney.ts";
import { backlogB, revisionB, titlesOfB } from "./refreshJourney.ts";

const claimsStory = "Publish shared backlog claims";
const claimsRecord = ".planning/seeds/SEED-040-claims.md";
const gap = "The canonical record could not be read for preparation facts.";

// Reloading the page reads the claims record at B and closes its gap,
// reading nothing at any other revision.
async function expectGapClosedAtB(page: Page) {
  const { source, backlog, problem } = parts(page);
  const claimsCard = backlog.getByRole("article", { name: claimsStory });
  const from = githubFor(page).calls.length;
  await page.reload();
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

test("auto refresh recovery: an unavailable detail of B stays labeled, is not read again while main stays at B, and a reload reads it at the same revision", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, backlog, problem } = parts(page);
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

  await test.step("a reload reads the record again at B, and the gap closes", async () => {
    origin.push(revisionB, backlogB, recordsB);
    await expectGapClosedAtB(page);
  });
});

test("auto refresh recovery: a detail of B still unread at the wait bound is labeled as a gap, the failed attempt says B's membership was read, an unchanged check keeps that failure and reads nothing, and a reload reads the detail at B", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, backlog, problem, status } = parts(page);
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
  });

  await test.step("a reload reads the record again at B, and the gap closes", async () => {
    releaseClaims();
    await expectGapClosedAtB(page);
  });
});
