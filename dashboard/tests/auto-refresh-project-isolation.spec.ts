// Selecting a project also abandons the previous project's automatic work:
// its outstanding revision check and its snapshot's detail reads. This is
// the automatic-check counterpart of ./project-read-isolation.spec.ts, which
// proves the same one-selected-source rule for membership reads. The page's
// clock is paused and advanced by the test (./autoRefreshJourney.ts), so no
// deselected project's work can time out on its own, and every later check
// is observed in the `gh` call log behind the page. As there, each held
// answer is released only after the newly selected project is shown, and
// "nothing changed" is asserted immediately after the release.

import type { Locator, Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest";
import { expectMembership, parts } from "./dashboardPage";
import {
  callsSince,
  contentReads,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilAsked,
  passTimeUntilChecked,
  recordsAt,
  refCheckArgv,
  refChecks,
} from "./autoRefreshJourney";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
  sharedStoryIdentity,
} from "./doughnutProject";
import { publishMovingOrigin } from "./publishedOrigin";
import {
  backlogA,
  backlogB,
  dashboardStory,
  revisionA,
  revisionB,
  titlesOfA,
} from "./refreshJourney";
import type { GhCall } from "./support/fakeGitHub";

test.describe("project read isolation of automatic checks", () => {
  const doughnutSharedGoal = "Doughnut's goal for the shared story.";
  const doughnutRecords = {
    ".planning/seeds/SEED-777-shared.md": `# Shared\n\n<a id="shared-story"></a>\n\n### ${doughnutSharedTitle}\n\n**Identity:** ${sharedStoryIdentity}\n\n**Goal:** ${doughnutSharedGoal}\n`,
  };

  // Selects Doughnut, published at its own revision, and waits until its
  // whole snapshot, detail included, is shown; then puts keyboard focus on
  // its shared story's canonical record link.
  async function selectSettledDoughnut(page: Page) {
    const doughnut = await publishMovingOrigin(page, doughnutRepository);
    doughnut.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
    const { project, backlog, source } = parts(page);
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expect(source).toContainText(revisionDoughnut);
    const link = backlog
      .getByRole("article", { name: doughnutSharedTitle })
      .getByRole("link", { name: /^Canonical record/ });
    await link.focus();
    return {
      link,
      retrievedAt: await source.locator("time").getAttribute("datetime"),
    };
  }

  // Doughnut still shows its own snapshot, evidence, and focus, and nothing
  // of Open Dough's.
  async function expectOnlyDoughnut(
    page: Page,
    shown: { link: Locator; retrievedAt: string | null },
  ) {
    const { project, source } = parts(page);
    await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
    await expect(source).toContainText(revisionDoughnut);
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      shown.retrievedAt ?? "",
    );
    await expect(
      project.getByRole("radio", { name: "Doughnut", exact: true }),
    ).toBeChecked();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("as published at");
    await expect(page.locator("body")).not.toContainText(dashboardStory);
    await expect(shown.link).toBeFocused();
    await expect(parts(page).notice).toBeEmpty();
  }

  const openDoughCalls = (calls: readonly GhCall[]) =>
    calls.filter(
      ({ request }) =>
        request.kind !== "unknown" &&
        request.repository === "terryyin/open-dough",
    );
  // Since the switch, GitHub was asked only for Doughnut: its membership
  // read, detail at its own revision, and then its own checks -- nothing a
  // late Open Dough answer could have started.
  function expectOnlyDoughnutAsked(calls: readonly GhCall[]) {
    expect(openDoughCalls(calls)).toEqual([]);
    expect(calls.filter(({ request }) => request.kind === "ref")).toHaveLength(
      2,
    );
    expect(refChecks(calls).map(({ argv }) => argv)).toEqual([
      doughnutCheckArgv,
    ]);
    const reads = contentReads(calls);
    expect(reads.length).toBeGreaterThan(1);
    expect(
      reads.every((read) => read.endsWith(`?ref=${revisionDoughnut}`)),
    ).toBe(true);
  }
  const doughnutCheckArgv = refCheckArgv(undefined, doughnutRepository);

  test("a deselected project's outstanding revision check is abandoned, its late answer changes nothing, and only the selected project is checked from then on", async ({
    page,
  }) => {
    const openDough = await openSettledAtA(page);
    const releaseCheck = openDough.hold("main");
    // What the held check would find: Open Dough's main moved on to B.
    openDough.push(revisionB, backlogB, recordsAt("B"));
    const beforeCheck = githubFor(page).calls.length;
    await passTimeUntilAsked(page);
    await expect
      .poll(() => refChecks(callsSince(page, beforeCheck)).length)
      .toBe(1);

    const atSwitch = githubFor(page).calls.length;
    const shown = await selectSettledDoughnut(page);

    await test.step("Open Dough's held check answers late, after Doughnut is shown", async () => {
      releaseCheck();
      await expectOnlyDoughnut(page, shown);
    });

    await test.step("the next check is Doughnut's own, at its steady pace, and Open Dough is never asked again", async () => {
      const beforeNext = githubFor(page).calls.length;
      expectSteadyPace(await passTimeUntilChecked(page));
      expect(callsSince(page, beforeNext).map(({ argv }) => argv)).toEqual([
        doughnutCheckArgv,
      ]);
      expectOnlyDoughnutAsked(callsSince(page, atSwitch));
      await expectOnlyDoughnut(page, shown);
    });
  });

  test("a deselected project's late detail read never lands in the newly selected project's view or schedule", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-09-23T09:00:00.000Z") });
    await page.clock.pauseAt(new Date("2026-09-23T09:00:00.000Z"));
    const openDough = await publishMovingOrigin(page);
    openDough.push(revisionA, backlogA, recordsAt("A"));
    const releaseDetail = openDough.hold(
      ".planning/seeds/SEED-021-progress.md",
    );
    await page.goto("/");
    await expectMembership(page, titlesOfA);
    // Every detail read of A, the held one included, has reached GitHub
    // before the switch, so no read sent before it counts as asked after it.
    await expect
      .poll(() => contentReads(openDough.requests))
      .toEqual(
        expect.arrayContaining(
          [
            ".planning/seeds/SEED-021-progress.md",
            ".planning/seeds/SEED-008-sync.md",
            ".planning/quick/059-installer-update-report/PLAN.md",
          ].map((path) => `${path}?ref=${revisionA}`),
        ),
      );
    await expect(page.getByText("Reading preparation…")).not.toHaveCount(0);

    const atSwitch = githubFor(page).calls.length;
    const shown = await selectSettledDoughnut(page);

    await test.step("Open Dough's held detail answers late, after Doughnut is shown", async () => {
      releaseDetail();
      await expectOnlyDoughnut(page, shown);
      const card = parts(page).backlog.getByRole("article", {
        name: doughnutSharedTitle,
      });
      await card.getByRole("button", { name: "Inspect story" }).click();
      await expect(card).toContainText(doughnutSharedGoal);
      await expect(page.locator("body")).not.toContainText("as published at");
    });

    await test.step("the next check is Doughnut's own, at its steady pace, and Open Dough is never asked again", async () => {
      const beforeNext = githubFor(page).calls.length;
      expectSteadyPace(await passTimeUntilChecked(page));
      expect(callsSince(page, beforeNext).map(({ argv }) => argv)).toEqual([
        doughnutCheckArgv,
      ]);
      expectOnlyDoughnutAsked(callsSince(page, atSwitch));
    });
  });
});
