// Returning to a settled automatic CI repeat's comparison
// (./intent-ci-follow-up.spec.ts): opened at its own address, its own refresh
// and a page reload read the same comparison; opened from the card, so does a
// revisit from the card. Each reads what the machine keeps, by a dashboard
// that collects nothing (../../dashboard/test-support/support/ciFollowUpSettledReading.ts). A new
// selection in Development yields to normal Intent, and the card opens the
// comparison again.
import { expectIntentModeChosen } from "../../dashboard/test-support/intentModePage.ts";
import { chooseWholeProject } from "../../dashboard/test-support/recentStoriesPage.ts";
import { emptyArea } from "../../dashboard/test-support/storyCardSelection.ts";
import {
  actionsRequests,
  expect,
  keepSettledRepeat,
  test,
} from "../../dashboard/test-support/support/ciFollowUpSettledReading.ts";
import {
  ciFollowUpCard,
  gotoCiFollowUp,
  openCiFollowUp,
  refreshCiFollowUp,
  reloadCiFollowUp,
  retainedCiFollowUpReading,
  shownCiFollowUpCard,
} from "../../dashboard/test-support/support/ciFollowUpReadingPage.ts";
import { chooseStoryTab } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";

test.use({ viewport: { width: 390, height: 844 } });

// Story A's run 71 first passed in 120 s against five prior builds of 100 s
// each, and its repeat in 100 s.
const settled = {
  run: 71,
  seconds: 120,
  repeatSeconds: 100,
  averageSeconds: 100,
} as const;

test("refresh and reload read a settled request's same comparison, opened at its address, without acquiring CI", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const { completion } = await keepSettledRepeat(page, origin, github, settled);
  const before = actionsRequests(github);
  await gotoCiFollowUp(page, dashboard.baseURL, {
    identity: queuedIdentity,
    revision: completion,
  });
  const { comparison, reference } = retainedCiFollowUpReading(page);
  await expect(
    reference.evidence.locator("p"),
    "evidence rows on first render",
  ).toHaveCount(6);
  const read = (await comparison.textContent()) ?? "";
  expect(read, "both attempts read").toContain("Attempt wall time: 1 min 40 s");
  await refreshCiFollowUp(page);
  await expect(comparison, "same after refresh").toHaveText(read);
  expect(actionsRequests(github), "no CI request from refresh").toEqual(before);
  await reloadCiFollowUp(page);
  await expect(comparison, "same after reload").toHaveText(read);
  expect(actionsRequests(github), "no CI request from reload").toEqual(before);
});

test("a revisit keeps the original pin while a new story or Whole project leaves it", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const { completion, before } =
    await test.step("Given a settled repeat is stored", async () => {
      const { completion } = await keepSettledRepeat(
        page,
        origin,
        github,
        settled,
      );
      return { completion, before: actionsRequests(github) };
    });
  const { intent, development, intentChoice, comparison, reference } =
    await test.step("When I open the pinned comparison from Story A", async () => {
      await page.goto(dashboard.baseURL);
      await openCiFollowUp(
        await shownCiFollowUpCard(page, "Story A"),
        "pointer",
      );
      return retainedCiFollowUpReading(page);
    });
  const read =
    await test.step("Then retained comparison shows the saved evidence", async () => {
      await expect(
        reference.evidence.locator("p"),
        "evidence rows opened from the card",
      ).toHaveCount(6);
      return (await comparison.textContent()) ?? "";
    });
  await test.step("When I revisit the card after switching tabs and going back", async () => {
    await chooseStoryTab(intent, "Changes");
    await page.goBack();
    await openCiFollowUp(await shownCiFollowUpCard(page, "Story A"), "pointer");
  });
  await test.step("Then the saved comparison is read without acquiring CI", async () => {
    await expect(comparison, "same on revisit").toHaveText(read);
    expect(actionsRequests(github), "no CI request from revisit").toEqual(
      before,
    );
  });
  await test.step("When I select Story B in Development", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await development.check();
    await emptyArea(
      page.getByRole("article", { name: "Story B", exact: true }),
    ).click();
  });
  await test.step("Then Development keeps the new selection and drops the pin", async () => {
    await expect
      .poll(() => new URL(page.url()).searchParams.get("followUp"))
      .toBeNull();
    await expect(development, "still in Development").toBeChecked();
  });
  await test.step("When I open Intent for Story B", () => intentChoice.check());
  await test.step("Then Intent reads Story B independently", async () => {
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-B#b");
    await expect(comparison).toHaveCount(0);
  });
  await test.step("When I reopen the retained comparison from Story A", async () => {
    await development.check();
    await openCiFollowUp(ciFollowUpCard(page, "Story A"), "pointer");
  });
  await test.step("Then the card still arrives at its pinned comparison", async () => {
    await expect(comparison).toHaveText(read);
    expect(new URL(page.url()).searchParams.get("landing")).toBe(completion);
  });
  await test.step("When I select Whole project on the bookmark", () =>
    chooseWholeProject(page));
  await test.step("Then project CI shows without a story or retained comparison", async () => {
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectIntentModeChosen(intent, "CI status");
    await expect(
      comparison,
      "Whole project leaves pinned comparison",
    ).toHaveCount(0);
  });
  await test.step("And the retained landing leaves the address", () =>
    expect
      .poll(() => new URL(page.url()).searchParams.get("followUp"))
      .toBeNull());
});
