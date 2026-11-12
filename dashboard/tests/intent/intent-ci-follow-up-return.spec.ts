// Returning to a settled automatic CI repeat's comparison
// (./intent-ci-follow-up.spec.ts): its own refresh, a page reload and a
// revisit from the card read the same comparison from what the machine
// keeps, by a dashboard that collects nothing
// (../support/ciFollowUpSettledReading.ts); a new selection in Development
// yields to normal Intent, and the card opens the comparison again.
import { backToStory, projectIntentLink } from "../intentModePage.ts";
import { selectStory } from "../storyCardSelection.ts";
import {
  actionsRequests,
  expect,
  keepSettledRepeat,
  test,
} from "../support/ciFollowUpSettledReading.ts";
import {
  ciFollowUpCard,
  openCiFollowUp,
  refreshCiFollowUp,
  retainedCiFollowUpReading,
  shownCiFollowUpCard,
} from "../support/ciFollowUpReadingPage.ts";
import { chooseStoryTab } from "../support/intentStoryPage.ts";

test.use({ viewport: { width: 390, height: 844 } });

test("refresh, reload and revisit read a settled request's same comparison without acquiring CI, and a new selection in Development yields to normal Intent until the card reopens it", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  // Story A's run 71 first passed in 120 s against five prior builds of 100 s
  // each, and its repeat in 100 s.
  await keepSettledRepeat(page, origin, github, {
    run: 71,
    seconds: 120,
    repeatSeconds: 100,
    averageSeconds: 100,
  });
  const before = actionsRequests(github);
  await page.goto(dashboard.baseURL);
  await openCiFollowUp(await shownCiFollowUpCard(page, "Story A"), "pointer");
  const { intent, development, intentChoice, comparison, reference } =
    retainedCiFollowUpReading(page);
  await expect(
    reference.evidence.locator("p"),
    "evidence rows on first render",
  ).toHaveCount(6);
  const read = (await comparison.textContent()) ?? "";
  expect(read, "both attempts read").toContain("Attempt wall time: 1 min 40 s");
  await refreshCiFollowUp(page);
  await expect(comparison, "same after refresh").toHaveText(read);
  expect(actionsRequests(github), "no CI request from refresh").toEqual(before);
  await page.reload();
  await expect(comparison, "same after reload").toHaveText(read);
  expect(actionsRequests(github), "no CI request from reload").toEqual(before);
  await chooseStoryTab(intent, "Changed tests");
  await page.goBack();
  await openCiFollowUp(await shownCiFollowUpCard(page, "Story A"), "pointer");
  await expect(comparison, "same on revisit").toHaveText(read);
  expect(actionsRequests(github), "no CI request from revisit").toEqual(before);
  // An explicit new selection in Development, with room for the whole Board,
  // yields to normal Intent.
  await page.setViewportSize({ width: 1440, height: 900 });
  await development.check();
  await selectStory(
    page.getByRole("article", { name: "Story B", exact: true }),
  ).click();
  await expect
    .poll(
      () => new URL(page.url()).searchParams.get("followUp"),
      "the selection leaves the comparison's address",
    )
    .toBeNull();
  await expect(development, "still in Development").toBeChecked();
  await intentChoice.check();
  await expect(intent, "Intent reads the new selection").toHaveAttribute(
    "data-selected-story",
    "SEED-B#b",
  );
  await expect(comparison, "no comparison in normal Intent").toHaveCount(0);
  await development.check();
  await openCiFollowUp(ciFollowUpCard(page, "Story A"), "pointer");
  await expect(comparison, "the card reopens the comparison").toBeVisible();
  await projectIntentLink(intent).click();
  await expect(backToStory(intent), "project Intent").toBeVisible();
  await expect(comparison, "project Intent leaves it").toHaveCount(0);
});
