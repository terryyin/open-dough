// A visible dashboard keeps its published work fresh by itself: at a steady
// pace it asks only whether the selected project's `main` still names the
// shown revision, and reads a new snapshot only when it names another. The
// Board uses the real authenticated read boundary and a routed Git origin.
// The page clock is paused so the cadence is observed in page time.

import { boardConfirmedAt } from "../../dashboard/test-support/boardRefreshPage.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import {
  backlogPath,
  defaultRepository,
} from "../../dashboard/test-support/publishedOriginBasics.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
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
  contentReads,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilChecked,
  queueStory,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  dashboardStory,
  inspectDashboardStory,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
import {
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  canonicalRecord,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";

test("auto refresh: quiet main is only checked, and newly published main appears with its own detail and keeps focus", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { A: revisionA, B: revisionB } = origin.revisions;
  const { status, problem, taken, backlog, notice, retrievedAt, readRevision } =
    parts(page);
  const retrievedA = await retrievedAt.getAttribute("datetime");
  const settledAt = githubFor(page).calls.length;

  await test.step("several quiet checks stay on pace and read no records", async () => {
    await whileNotingChecks(page, async (askedAfter) => {
      for (let check = 0; check < 3; check += 1) {
        expectSteadyPace(await passTimeUntilChecked(page));
        expect(await askedAfter()).toHaveLength(check + 1);
      }
    });
    expect(contentReads(callsSince(page, settledAt))).toEqual([]);
  });

  await test.step("an unchanged answer leaves membership, revision and retrieval time as they were", async () => {
    await expectMembership(page, titlesOfA);
    await expect(readRevision).toContainText(shortRevision(revisionA));
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
    await expect(status).toHaveText(
      new RegExp(
        `^Published work read at revision ${shortRevision(revisionA)}, retrieved `,
      ),
    );
  });

  const dashboardCard = page.getByRole("article", { name: dashboardStory });
  await dashboardCard.getByRole("button", { name: "Inspect story" }).click();
  await expect(dashboardCard).toContainText("as published at A");
  const queueControl = backlog
    .getByRole("article", { name: queueStory })
    .getByRole("button", { name: "Inspect story" });
  await queueControl.focus();
  const beforeB = githubFor(page).calls.length;
  const confirmationA = await boardConfirmedAt(page);
  origin.advanceTo("B");

  await test.step("B is found by the next check, within 30 seconds, and read at exactly B", async () => {
    await whileNotingChecks(page, async (askedAfter) => {
      expect(await passTimeUntilChecked(page)).toBeLessThanOrEqual(15_250);
      await expectSettledPage(page, titlesOfB);
      await untilPageRequestsAnswered(page);
      expect(await askedAfter()).toHaveLength(1);
    });
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
    await expectOwnersNotRecorded(page);
  });

  await test.step("focus stays on the still-listed work's control", async () => {
    await expect(queueControl).toBeFocused();
    await expect(notice).toBeEmpty();
  });

  await test.step("detail and links come from B", async () => {
    await expect(
      taken.getByRole("article", { name: dashboardStory }),
    ).toContainText(`${dashboardStory}, as published at B.`);
    await expect(page.locator("body")).not.toContainText("as published at A");
    await expect(
      canonicalRecord(storyCard(taken, dashboardStory)),
    ).toHaveAttribute("href", new RegExp(`/blob/${revisionB}/`));
  });

  await test.step("the check leads to reads of B's pinned records", () => {
    const calls = callsSince(page, beforeB);
    expect(calls.filter(({ request }) => request.kind === "ref")).toEqual([]);
    const reads = contentReads(calls).filter(
      (read) => !read.startsWith(`${backlogPath}?`),
    );
    expect(reads.every((read) => read.endsWith(`?ref=${revisionB}`))).toBe(
      true,
    );
    expect(reads.sort()).toEqual(
      [
        ".planning/open-dough.json",
        ".planning/seeds/SEED-008-sync.md",
        ".planning/seeds/SEED-021-progress.md",
        ".planning/seeds/SEED-040-claims.md",
        ".planning/slice-plans/059-installer-update-report/PLAN.md",
      ].map((path) => `${path}?ref=${revisionB}`),
    );
  });

  await test.step("an unchanged B advances only its confirmation", async () => {
    const confirmationB = await boardConfirmedAt(page);
    expect(Date.parse(confirmationB)).toBeGreaterThan(
      Date.parse(confirmationA),
    );
    const retrievedB = await retrievedAt.getAttribute("datetime");
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect
      .poll(async () => Date.parse(await boardConfirmedAt(page)))
      .toBeGreaterThan(Date.parse(confirmationB));
    await expect(readRevision).toContainText(shortRevision(revisionB));
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedB ?? "");
    expect(restMembershipAsked(origin.requests)).toEqual([]);
  });
});

test("auto refresh: main moving again while B's records are read leaves one snapshot pinned to B, and the next check finds C", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { A: revisionA, B: revisionB, C: revisionC } = origin.revisions;
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(defaultRepository),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(revisionA);
  const { problem, readRevision } = parts(page);
  await inspectDashboardStory(page);
  const beforeB = githubFor(page).calls.length;
  origin.advanceTo("B");
  const heldRecord = ".planning/seeds/SEED-021-progress.md";
  const releaseRecordAtB = origin.hold(heldRecord);
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(defaultRepository),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(revisionB);

  await passTimeUntilChecked(page);
  await expect
    .poll(() => contentReads(callsSince(page, beforeB)))
    .toContain(`${heldRecord}?ref=${revisionB}`);
  origin.advanceTo("C");
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(defaultRepository),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(revisionC);
  releaseRecordAtB();

  await test.step("B's membership, detail, and evidence are all B's", async () => {
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA, revisionC],
    );
    await expect(problem).toHaveCount(0);
    const reads = contentReads(callsSince(page, beforeB));
    expect(reads.length).toBeGreaterThan(1);
    expect(reads.every((read) => read.endsWith(`?ref=${revisionB}`))).toBe(
      true,
    );
    // B's read is whole once every read beside its backlog is answered too,
    // so the next check's pace is measured from there.
    await untilPageRequestsAnswered(page);
  });

  await test.step("the next check finds C and reads it whole", async () => {
    const beforeC = githubFor(page).calls.length;
    expect(await passTimeUntilChecked(page)).toBeLessThanOrEqual(15_250);
    await expectMembership(page, {
      taken: [],
      backlog: ["Publish shared backlog claims"],
    });
    await expect(readRevision).toContainText(shortRevision(revisionC));
    const reads = contentReads(callsSince(page, beforeC));
    expect(reads.every((read) => read.endsWith(`?ref=${revisionC}`))).toBe(
      true,
    );
  });
});
