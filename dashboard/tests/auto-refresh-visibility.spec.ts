// A dashboard nobody can see does not keep asking GitHub about it: while the
// page is hidden (another tab, a minimized window) no revision check is
// made, and when it is seen again it asks once, at once, then resumes its
// steady pace. The page, its local authenticated read boundary, the `gh`
// invocation, and the interpretation are the production ones, as in
// ./auto-refresh.spec.ts; the page's clock is paused and advanced by the
// test, and the document's visibility is set as the browser would set it.

import { expect, githubFor, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectWholeSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  callsSince,
  checkedAtOnce,
  checksAskedWhilePassing,
  contentReads,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilAsked,
  passTimeUntilChecked,
  queueStory,
  recordsAt,
  headsCheckArgv,
  headsChecks,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import {
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";

const canonical = { name: /^Canonical record/ };

test("auto refresh: a hidden page makes no checks, and a page seen again checks once at once, then at its steady pace", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, problem, backlog, notice } = parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = await retrievedAt.getAttribute("datetime");
  // The schedule is running: one ordinary check has been answered.
  await passTimeUntilChecked(page);

  await test.step("hidden for a minute of page time, the page asks nothing", async () => {
    const beforeHidden = githubFor(page).calls.length;
    await setPageVisibility(page, "hidden");
    expect(await checksAskedWhilePassing(page, 60_000)).toBe(0);
    expect(callsSince(page, beforeHidden)).toEqual([]);
    await expectMembership(page, titlesOfA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
  });

  await test.step("seen again, it checks at once, and only once before its steady pace resumes", async () => {
    const beforeSeen = githubFor(page).calls.length;
    await setPageVisibility(page, "visible");
    await checkedAtOnce(page);
    expectSteadyPace(await passTimeUntilChecked(page));
    const calls = callsSince(page, beforeSeen);
    expect(calls.map(({ argv }) => argv)).toEqual([
      headsCheckArgv(revisionA),
      headsCheckArgv(revisionA),
    ]);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
  });

  const queueLink = backlog
    .getByRole("article", { name: queueStory })
    .getByRole("link", canonical);
  await queueLink.focus();

  await test.step("hiding the page abandons its outstanding check; nothing it would have said is shown", async () => {
    const releaseMain = origin.hold("main");
    origin.push(revisionB, backlogB, recordsAt("B"));
    const beforeHidden = githubFor(page).calls.length;
    await passTimeUntilAsked(page);
    // The check has reached GitHub and waits there for its answer.
    await expect
      .poll(() => headsChecks(callsSince(page, beforeHidden)).length)
      .toBe(1);
    await setPageVisibility(page, "hidden");
    releaseMain();
    expect(await checksAskedWhilePassing(page, 60_000)).toBe(0);
    const calls = callsSince(page, beforeHidden);
    expect(calls.map(({ argv }) => argv)).toEqual([headsCheckArgv(revisionA)]);
    expect(contentReads(calls)).toEqual([]);
    await expectMembership(page, titlesOfA);
    await expect(source).toContainText(revisionA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
    await expect(queueLink).toBeFocused();
  });

  await test.step("seen again, its one prompt check finds what was published meanwhile and reads exactly that", async () => {
    const beforeSeen = githubFor(page).calls.length;
    await setPageVisibility(page, "visible");
    await checkedAtOnce(page);
    await expectMembership(page, titlesOfB);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    const calls = callsSince(page, beforeSeen);
    expect(headsChecks(calls).map(({ argv }) => argv)).toEqual([
      headsCheckArgv(revisionA),
    ]);
    // The check found B; main was not resolved again.
    expect(calls.filter(({ request }) => request.kind === "ref")).toEqual([]);
    const reads = contentReads(calls);
    expect(reads.length).toBeGreaterThan(1);
    expect(reads.every((read) => read.endsWith(`?ref=${revisionB}`))).toBe(
      true,
    );
  });

  await test.step("focus stays on the still-listed work's link", async () => {
    await expect(queueLink).toBeFocused();
    await expect(notice).toBeEmpty();
  });

  await test.step("the steady pace resumes from B's read, not another prompt check", async () => {
    const beforeNext = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    expect(callsSince(page, beforeNext).map(({ argv }) => argv)).toEqual([
      headsCheckArgv(revisionB),
    ]);
  });
});
