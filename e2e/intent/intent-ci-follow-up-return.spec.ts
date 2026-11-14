// Returning to a settled automatic CI repeat's comparison
// (./intent-ci-follow-up.spec.ts): opened at its own address, its own refresh
// and a page reload read the same comparison; opened from the card, so does a
// revisit from the card. Each reads what the machine keeps, by a dashboard
// that collects nothing (../../dashboard/tests/support/ciFollowUpSettledReading.ts). A new
// selection in Development yields to normal Intent, and the card opens the
// comparison again.
import {
  backToStory,
  projectIntentLink,
} from "../../dashboard/tests/intentModePage.ts";
import { selectStory } from "../../dashboard/tests/storyCardSelection.ts";
import {
  actionsRequests,
  expect,
  keepSettledRepeat,
  test,
} from "../../dashboard/tests/support/ciFollowUpSettledReading.ts";
import {
  ciFollowUpCard,
  gotoCiFollowUp,
  openCiFollowUp,
  refreshCiFollowUp,
  reloadCiFollowUp,
  retainedCiFollowUpReading,
  shownCiFollowUpCard,
} from "../../dashboard/tests/support/ciFollowUpReadingPage.ts";
import { chooseStoryTab } from "../../dashboard/tests/support/intentStoryPage.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";

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

test("a revisit from the card reads a settled request's same comparison without acquiring CI, and a new selection in Development yields to normal Intent until the card reopens it", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  await keepSettledRepeat(page, origin, github, settled);
  const before = actionsRequests(github);
  await page.goto(dashboard.baseURL);
  await openCiFollowUp(await shownCiFollowUpCard(page, "Story A"), "pointer");
  const { intent, development, intentChoice, comparison, reference } =
    retainedCiFollowUpReading(page);
  await expect(
    reference.evidence.locator("p"),
    "evidence rows opened from the card",
  ).toHaveCount(6);
  const read = (await comparison.textContent()) ?? "";
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
