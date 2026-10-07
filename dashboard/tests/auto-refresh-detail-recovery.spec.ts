// A missing detail of a revision the dashboard shows stays labeled and is
// read again only when the page is reloaded. A detail still unread when the
// read's wait bound gives it up recovers on the page's transient schedule at
// that same revision. Failed checks and reads of a newly found commit:
// ./auto-refresh-recovery.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and holds answers. The
// page's clock is paused and advanced by the test.

import type { Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectOwnersNotRecorded,
  expectSettledPage,
  parts,
} from "./dashboardPage.ts";
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
  await expect(claimsCard).toBeVisible();
  await expectSettledPage(page);
  await expectOwnersNotRecorded(page);
  await expect(claimsCard).not.toContainText(gap);
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
    await expectSettledPage(page, titlesOfB);
    await expectOwnersNotRecorded(page);
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

test("auto refresh recovery: a detail of B still unread at the wait bound is labeled as a gap, the failed attempt says B's membership was read, and the page's recovery reads the detail at B without reload", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, backlog, problem } = parts(page);
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
    await expect(problem).toContainText("this page reads it");
    await expect(claimsCard).toContainText(gap);
    await expectSettledPage(page);
    await expect(source).toContainText(revisionB);
  });

  await test.step("while recovery waits, checks do not run and the gap stays", async () => {
    const from = githubFor(page).calls.length;
    await page.clock.runFor(14_000);
    expect(headsChecks(callsSince(page, from))).toHaveLength(0);
    expect(contentReads(callsSince(page, from))).toEqual([]);
    await expect(problem).toContainText(readAtB);
    await expect(claimsCard).toContainText(gap);
  });

  await test.step("due recovery reads the record again at B, and the gap closes", async () => {
    releaseClaims();
    const from = githubFor(page).calls.length;
    await page.clock.runFor(1_250);
    await expect(claimsCard).toBeVisible();
    await expectSettledPage(page);
    await expectOwnersNotRecorded(page);
    await expect(claimsCard).not.toContainText(gap);
    await claimsCard.getByRole("button", { name: "Inspect story" }).click();
    await expect(claimsCard).toContainText(
      `${claimsStory}, as published at B.`,
    );
    await expect(source).toContainText(revisionB);
    await expect(problem).toHaveCount(0);
    await expect
      .poll(() => contentReads(callsSince(page, from)))
      .toContain(`${claimsRecord}?ref=${revisionB}`);
  });
});
