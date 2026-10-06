// Independent fact callbacks belong to one selected observation. Raw GitHub
// answers are held behind the built preview's actual local gh boundary; page
// selections, revision checks, interpretation, and displayed facts are real.

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import {
  doughnutRepository,
  doughnutSharedGoal,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { selectSettledDoughnut } from "./doughnutJourney.ts";
import { opened, repository } from "./sliceClockRecords.ts";
import {
  factsAt,
  publishFactsOrigin,
  revisionA,
  revisionB,
} from "./publishedFactsIsolation.ts";
import {
  expectCurrentFacts,
  expectCurrentRoster,
  factCards,
  expectHeldGroups,
  expectNextProjectCheck,
  expectNoEarlierFacts,
  expectOnlyProjectAsked,
  focusCanonical,
} from "./publishedFactsIsolationAssertions.ts";
import {
  expectOnlyDoughnut,
  expectPublishedReadState,
  openHeldPublication,
  pageErrors,
  publishedReadState,
} from "./publishedFactsIsolationJourney.ts";

const factsA = factsAt(revisionA, "A");
const factsB = factsAt(revisionB, "B");
const pendingB = ["preparation", "done"] as const;

test("new membership and fast B assignments replace a complete A without borrowing its held preparation or done facts", async ({
  page,
}) => {
  const errors = pageErrors(page);
  await pausePageClockAt(page, opened);
  const origin = publishFactsOrigin(page);
  origin.push(factsA);
  await page.goto("/");
  await expectMembership(page, factsA.membership);
  const link = await focusCanonical(page, factsA);
  await expectCurrentFacts(page, factsA);
  // Published status follows membership. The two credited humans and the
  // clock establish that A's remaining independent detail has really read.
  const cardsA = factCards(page, factsA);
  await expect(cardsA.taken.locator(".card-owner")).toContainText(
    "Fixture Committer",
  );
  await expect(cardsA.queued.locator(".card-preparing")).toContainText(
    "Fixture Committer",
  );
  await expect(cardsA.taken).toContainText("Current slice started 5 min ago");
  const beforeB = githubFor(page).calls.length;
  const current = origin.push(factsB, pendingB);
  await passTimeUntilChecked(page);
  await expectMembership(page, factsB.membership);
  await expectHeldGroups(page, factsB, pendingB);

  await test.step("B's available assignments and roster are usable while all A details disappear", async () => {
    await expectCurrentFacts(page, factsB, pendingB);
    await expectNoEarlierFacts(page, factsA);
    await expect(link).toBeFocused();
    await expectCurrentRoster(page, factsB);
    await focusCanonical(page, factsB);
  });
  await test.step("B's held groups add only B facts and retain the current inspection and focus", async () => {
    current.release("done");
    await expectCurrentFacts(page, factsB, ["preparation"]);
    await expectNoEarlierFacts(page, factsA);
    await expect(link).toBeFocused();
    current.release("preparation");
    await expectCurrentFacts(page, factsB);
    await expectNoEarlierFacts(page, factsA);
    await expect(link).toBeFocused();
  });
  await expectNextProjectCheck(page, repository, revisionB);
  expectOnlyProjectAsked(page, beforeB, repository, revisionB);
  expect(errors).toEqual([]);
});

test("the settled alternate project finishes its independent reads before a return checkpoint starts", async ({
  page,
}) => {
  await openHeldPublication(page, factsA);
  let profilesRead = false;
  let doneRead = false;
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.searchParams.get("source") !== "doughnut" || !response.ok()) return;
    if (url.searchParams.get("agents") === "profiles") profilesRead = true;
    if (url.searchParams.get("done") === "records") doneRead = true;
  });
  // Independent profile work can start later than preparation. Delay only
  // its local request dispatch; the real preview and gh still do the read.
  await page.route(
    /__authenticated-read\?source=doughnut&.*agents=profiles$/,
    async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 1_000));
      await route.continue();
    },
  );
  await selectSettledDoughnut(page);
  expect({ profilesRead, doneRead }).toEqual({
    profilesRead: true,
    doneRead: true,
  });
});

for (const outcome of ["success", "failure"] as const) {
  test(`switching projects abandons every unfinished fact group, including its late ${outcome}`, async ({
    page,
  }) => {
    const errors = pageErrors(page);
    const { abandoned } = await openHeldPublication(page, factsA);
    const atSwitch = githubFor(page).calls.length;
    const shown = await selectSettledDoughnut(page);
    const saved = await publishedReadState(page);
    await expectOnlyDoughnut(page, shown, factsA, saved);
    abandoned.releaseAll(outcome);
    // Selection aborts the browser requests. Releasing the raw answers lets
    // the fake gh finish; it does not revive a response in the selected page.
    await expectOnlyDoughnut(page, shown, factsA, saved);
    await expectNextProjectCheck(page, doughnutRepository);
    expectOnlyProjectAsked(
      page,
      atSwitch,
      doughnutRepository,
      revisionDoughnut,
    );
    await expectOnlyDoughnut(page, shown, factsA, saved);
    expect(errors).toEqual([]);
  });

  test(`returning reads partial B afresh while the same project's abandoned A still owes a ${outcome}`, async ({
    page,
  }) => {
    const errors = pageErrors(page);
    const { origin, abandoned } = await openHeldPublication(page, factsA);
    await selectSettledDoughnut(page);
    const current = origin.push(factsB, pendingB);
    const atReturn = githubFor(page).calls.length;
    await parts(page)
      .project.getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectMembership(page, factsB.membership);
    await expectHeldGroups(page, factsB, pendingB);
    const link = await focusCanonical(page, factsB);
    await expectCurrentFacts(page, factsB, pendingB);
    await expectNoEarlierFacts(page, factsA);
    const saved = await publishedReadState(page);

    await test.step(`A's late ${outcome} cannot change B's partial facts, status, source, or focus`, async () => {
      abandoned.releaseAll(outcome);
      await expectCurrentFacts(page, factsB, pendingB);
      await expectNoEarlierFacts(page, factsA);
      await expectPublishedReadState(page, saved);
      await expect(link).toBeFocused();
      await expect(
        parts(page).project.getByRole("radio", {
          name: "Open Dough",
          exact: true,
        }),
      ).toBeChecked();
      await expect(parts(page).stages).not.toContainText(doughnutSharedGoal);
      await expect(
        parts(page).stages.locator(`a[href*="${revisionDoughnut}"]`),
      ).toHaveCount(0);
    });
    await test.step("B's later real reads finish the same current observation", async () => {
      current.release("done");
      await expectCurrentFacts(page, factsB, ["preparation"]);
      await expect(link).toBeFocused();
      current.release("preparation");
      await expectCurrentFacts(page, factsB);
      await expectNoEarlierFacts(page, factsA);
      await expectPublishedReadState(page, saved);
      await expect(link).toBeFocused();
    });
    await expectNextProjectCheck(page, repository);
    expectOnlyProjectAsked(page, atReturn, repository, revisionB);
    await expectCurrentFacts(page, factsB);
    await expect(link).toBeFocused();
    expect(errors).toEqual([]);
  });
}
