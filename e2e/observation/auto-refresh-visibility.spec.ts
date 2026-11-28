// A hidden Board stops checking; when seen again it checks immediately and
// resumes its steady pace. Control page time and visibility, and observe
// the production HTTP requests, their cancellation, and the visible Board.

import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectMembership,
  expectOwnersNotRecorded,
  expectSettledPage,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
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
  setPageVisibility,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isCheck,
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  focusCanonicalRecord,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import {
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";

test("auto refresh: a hidden page makes no checks, and a page seen again checks once at once, then at its steady pace", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { A: revisionA, B: revisionB } = origin.revisions;
  const { problem, backlog, notice, retrievedAt, readRevision } = parts(page);
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
    await whileNotingChecks(page, async (askedAfter) => {
      await setPageVisibility(page, "visible");
      await checkedAtOnce(page);
      expect(await askedAfter()).toHaveLength(1);
      expectSteadyPace(await passTimeUntilChecked(page));
      expect(await askedAfter()).toHaveLength(2);
    });
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
  });

  const queueLink = await focusCanonicalRecord(storyCard(backlog, queueStory));

  await test.step("hiding cancels the outstanding HTTP wait and preserves A", async () => {
    const releaseMain = origin.hold("main");
    try {
      origin.advanceTo("B");
      const beforeHidden = githubFor(page).calls.length;
      const checking = page.waitForRequest((request) => isCheck(request.url()));
      await passTimeUntilAsked(page);
      const check = await checking;
      // For now the real endpoint settles its held REST listing after
      // the browser leaves. Keep the upstream synchronization until cutover.
      await expect
        .poll(() =>
          callsSince(page, beforeHidden).filter(
            ({ request }) => request.kind === "matching-refs",
          ),
        )
        .toHaveLength(1);
      const cancelled = page.waitForEvent(
        "requestfailed",
        (request) => request === check,
      );
      await setPageVisibility(page, "hidden");
      await cancelled;
      releaseMain();
      expect(await checksAskedWhilePassing(page, 60_000)).toBe(0);
      expect(contentReads(callsSince(page, beforeHidden))).toEqual([]);
      await expectMembership(page, titlesOfA);
      await expect(readRevision).toContainText(shortRevision(revisionA));
      await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
      await expect(problem).toHaveCount(0);
      await expect(queueLink).toBeFocused();
    } finally {
      releaseMain();
    }
  });

  await test.step("seen again, one prompt check finds B and reads its pinned records", async () => {
    const beforeSeen = githubFor(page).calls.length;
    await whileNotingChecks(page, async (askedAfter) => {
      await setPageVisibility(page, "visible");
      await checkedAtOnce(page);
      await expectSettledPage(page, titlesOfB);
      await expectOwnersNotRecorded(page);
      await expectWholeSnapshot(
        page,
        { revision: revisionB, titles: titlesOfB },
        [revisionA],
      );
      await untilPageRequestsAnswered(page);
      expect(await askedAfter()).toHaveLength(1);
    });
    const reads = contentReads(callsSince(page, beforeSeen));
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
    await whileNotingChecks(page, async (askedAfter) => {
      expectSteadyPace(await passTimeUntilChecked(page));
      expect(await askedAfter()).toHaveLength(1);
    });
  });
});

test("auto refresh: a page seen again while a read is under way checks once that read lands, so what was published meanwhile is shown", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { B: revisionB, C: revisionC } = origin.revisions;
  const { readRevision } = parts(page);
  const heldRecord = ".planning/seeds/SEED-021-progress.md";
  const releaseB = origin.hold(heldRecord);
  origin.advanceTo("B");
  const beforeB = githubFor(page).calls.length;
  await passTimeUntilChecked(page);
  // The check found B, whose read has reached GitHub and waits there.
  await expect
    .poll(() => contentReads(callsSince(page, beforeB)))
    .toContain(`${heldRecord}?ref=${revisionB}`);
  await setPageVisibility(page, "hidden");
  origin.advanceTo("C");
  await setPageVisibility(page, "visible");
  releaseB();
  await expectSettledPage(page, titlesOfB);
  await untilPageRequestsAnswered(page);
  await whileNotingChecks(page, async (askedAfter) => {
    await checkedAtOnce(page);
    await expect(readRevision).toContainText(shortRevision(revisionC));
    expect(await askedAfter()).toHaveLength(1);
  });
});
