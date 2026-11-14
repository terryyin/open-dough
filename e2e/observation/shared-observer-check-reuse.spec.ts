// Staggered visible tabs of one dashboard process share one settled
// branch-head listing per refresh pace: a second tab opened seven seconds
// of page time after the first settled costs no listing of its own while
// origin is quiet, a commit published before the next pace appears on both
// within that pace after one backlog read, and a tab revealed after the
// other's listing settled checks at once from that listing. The page, its
// local read boundary, and the `gh` invocation are the production ones; the
// server uses the production reuse window (`checkReuseMs`), measured by a
// server clock the journey runs ahead past that window between paces, so a
// page's own next check still asks GitHub once under the fake page clock.

import {
  expect,
  githubFor,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  callsSince,
  checkedAtOnce,
  contentReads,
  headsChecks,
  openSettledAtA,
  passTimeUntilChecked,
  recordsAt,
  setPageVisibility,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";
import { checkReuseMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import {
  backlogB,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/tests/refreshJourney.ts";

test.use({ revisionCheckReuseMs: checkReuseMs, observationClock: true });

test("staggered tabs share one listing per pace, see a new commit together, and a revealed tab reuses the other's listing", async ({
  page,
  dashboard,
}) => {
  // Runs the server's clock past the reuse window so the next paced check
  // cannot reuse the listing that just settled (page time and server time
  // diverge under the fake page clock).
  const pastReuseWindow = () => {
    dashboard.advanceObservationClock(checkReuseMs);
  };
  const origin = await openSettledAtA(page);
  await page.clock.runFor(7_000);
  const other = await page.context().newPage();
  await other.goto("/");
  await expectSettledPage(other, titlesOfA);
  await expect(parts(other).problem).toHaveCount(0);

  await test.step("two quiet paces cost two listings where four checks asked", async () => {
    const before = githubFor(page).calls.length;
    // Page's first check (~8 s into this quiet span) asks; the other's first
    // (~15 s) reuses that listing.
    await passTimeUntilChecked(page);
    await passTimeUntilChecked(other);
    expect(headsChecks(callsSince(page, before))).toHaveLength(1);
    pastReuseWindow();
    // Page's second check asks again; the other's second reuses it.
    await passTimeUntilChecked(page);
    await passTimeUntilChecked(other);
    expect(headsChecks(callsSince(page, before))).toHaveLength(2);
    await expect(parts(page).problem).toHaveCount(0);
    await expect(parts(other).problem).toHaveCount(0);
    await expectSettledPage(page, titlesOfA);
    await expectSettledPage(other, titlesOfA);
  });

  await test.step("a commit published before the next check appears on both within one pace after one backlog read", async () => {
    pastReuseWindow();
    origin.push(revisionB, backlogB, recordsAt("B"));
    const before = githubFor(page).calls.length;
    await passTimeUntilChecked(page);
    await expectSettledPage(page, titlesOfB);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revisionB),
    );
    // The other's next check reuses the listing that found B.
    await passTimeUntilChecked(other);
    await expectSettledPage(other, titlesOfB);
    await expect(parts(other).readRevision).toContainText(
      shortRevision(revisionB),
    );
    await untilPageRequestsAnswered(page);
    await untilPageRequestsAnswered(other);
    await expect(parts(page).problem).toHaveCount(0);
    await expect(parts(other).problem).toHaveCount(0);
    const calls = callsSince(page, before);
    expect(headsChecks(calls)).toHaveLength(1);
    expect(
      contentReads(calls).filter((read) =>
        read.startsWith(".planning/PRODUCT-BACKLOG.md"),
      ),
    ).toEqual([`.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`]);
  });

  await test.step("a hidden tab revealed after the other's listing settled checks at once without a listing", async () => {
    await setPageVisibility(other, "hidden");
    pastReuseWindow();
    const before = githubFor(page).calls.length;
    await passTimeUntilChecked(page);
    expect(headsChecks(callsSince(page, before))).toHaveLength(1);
    await setPageVisibility(other, "visible");
    const beforeSeen = githubFor(page).calls.length;
    await checkedAtOnce(other);
    expect(headsChecks(callsSince(page, beforeSeen))).toHaveLength(0);
    await expectSettledPage(other, titlesOfB);
    await expect(parts(other).readRevision).toContainText(
      shortRevision(revisionB),
    );
    await expect(parts(other).problem).toHaveCount(0);
  });
});
