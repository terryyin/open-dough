// A visible dashboard keeps its published work fresh by itself: at a steady
// pace it asks only whether the selected project's `main` still names the
// shown revision, and reads a new snapshot only when it names another. The
// page, its local authenticated read boundary, the conditional `gh api`
// invocation, and the shared interpretation are the production ones; the
// fake GitHub behind the synthetic `gh` (./support/fakeGitHub.ts) only
// publishes commits, answers `304 Not Modified` to an unchanged entity tag
// as GitHub does, and records every `gh` call. The page's clock is paused
// and advanced by the test, so "within 30 seconds" is observed in page time.

import { expect, githubFor, test } from "./dashboardTest";
import { expectMembership, expectWholeSnapshot, parts } from "./dashboardPage";
import {
  callsSince,
  contentReads,
  openSettledAtA,
  passTimeUntilChecked,
  queueStory,
  recordsAt,
  refCheckArgv,
} from "./autoRefreshJourney";
import {
  backlogB,
  backlogC,
  dashboardStory,
  revisionA,
  revisionB,
  revisionC,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney";

const canonical = { name: /^Canonical record/ };

test("auto refresh: quiet main is only checked, and newly published main appears with its own detail and keeps focus", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, status, problem, refresh, taken, backlog, notice } =
    parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = await retrievedAt.getAttribute("datetime");
  const settledAt = githubFor(page).calls.length;

  await test.step("several quiet checks ask only whether main moved, conditionally after the first", async () => {
    for (let check = 0; check < 3; check += 1) {
      // Paced: never sooner than 15 seconds after the last one settled.
      const passed = await passTimeUntilChecked(page);
      expect(passed).toBeGreaterThanOrEqual(15_000);
      expect(passed).toBeLessThanOrEqual(15_250);
    }
    const checks = callsSince(page, settledAt);
    expect(checks.map(({ argv }) => argv)).toEqual([
      refCheckArgv(),
      refCheckArgv(revisionA),
      refCheckArgv(revisionA),
    ]);
    expect(contentReads(checks)).toEqual([]);
  });

  await test.step("an unchanged answer, 304 included, leaves the snapshot, its revision, and its retrieval time as they were", async () => {
    await expectMembership(page, titlesOfA);
    await expect(source).toContainText(revisionA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
    await expect(refresh).toHaveAccessibleName("Refresh");
    await expect(status).toHaveText(
      /^Published work read at revision a1a1a1a, retrieved /,
    );
  });

  const dashboardCard = page.getByRole("article", { name: dashboardStory });
  await dashboardCard.getByRole("button", { name: "Inspect story" }).click();
  await expect(dashboardCard).toContainText("as published at A");
  const queueLink = backlog
    .getByRole("article", { name: queueStory })
    .getByRole("link", canonical);
  await queueLink.focus();
  const beforeB = githubFor(page).calls.length;
  origin.push(revisionB, backlogB, recordsAt("B"));

  await test.step("B is found by the next check, within 30 seconds, and read at exactly B", async () => {
    expect(await passTimeUntilChecked(page)).toBeLessThanOrEqual(15_250);
    await expectMembership(page, titlesOfB);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA ?? "");
    await expect(problem).toHaveCount(0);
  });

  await test.step("focus stays on the still-listed work's link", async () => {
    await expect(queueLink).toBeFocused();
    await expect(notice).toBeEmpty();
  });

  await test.step("detail and links come from B", async () => {
    // Its detail stays open as the work moves to Taken, now read at B.
    await expect(
      taken.getByRole("article", { name: dashboardStory }),
    ).toContainText(`${dashboardStory}, as published at B.`);
    await expect(page.locator("body")).not.toContainText("as published at A");
    await expect(
      backlog
        .getByRole("article", { name: queueStory })
        .getByRole("link", canonical),
    ).toHaveAttribute("href", new RegExp(`/blob/${revisionB}/`));
  });

  await test.step("main was not resolved again: one check, then one B backlog and its records", () => {
    const calls = callsSince(page, beforeB);
    expect(
      calls
        .filter(({ request }) => request.kind === "ref")
        .map(({ argv }) => argv),
    ).toEqual([refCheckArgv(revisionA)]);
    const reads = contentReads(calls);
    expect(
      reads.filter((read) => read.startsWith(".planning/PRODUCT-BACKLOG.md")),
    ).toEqual([`.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`]);
    expect(reads.every((read) => read.endsWith(`?ref=${revisionB}`))).toBe(
      true,
    );
    expect(reads.sort()).toEqual(
      [
        ".planning/PRODUCT-BACKLOG.md",
        ".planning/quick/059-installer-update-report/PLAN.md",
        ".planning/seeds/SEED-008-sync.md",
        ".planning/seeds/SEED-021-progress.md",
        ".planning/seeds/SEED-040-claims.md",
      ].map((path) => `${path}?ref=${revisionB}`),
    );
  });
});

test("auto refresh: main moving again while B's backlog is read leaves one snapshot pinned to B, and the next check finds C", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, problem } = parts(page);
  const beforeB = githubFor(page).calls.length;
  origin.push(revisionB, backlogB, recordsAt("B"));
  const releaseBacklogAtB = origin.hold(revisionB);

  await passTimeUntilChecked(page);
  await expect
    .poll(() => contentReads(callsSince(page, beforeB)))
    .toEqual([`.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`]);
  origin.push(revisionC, backlogC, recordsAt("C"));
  releaseBacklogAtB();

  await test.step("B's membership, detail, and evidence are all B's", async () => {
    await expectMembership(page, titlesOfB);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
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
  });

  await test.step("the next check finds C and reads it whole", async () => {
    const beforeC = githubFor(page).calls.length;
    expect(await passTimeUntilChecked(page)).toBeLessThanOrEqual(15_250);
    await expectMembership(page, {
      taken: [],
      backlog: ["Publish shared backlog claims"],
    });
    await expect(source).toContainText(revisionC);
    const reads = contentReads(callsSince(page, beforeC));
    expect(reads.every((read) => read.endsWith(`?ref=${revisionC}`))).toBe(
      true,
    );
  });
});
