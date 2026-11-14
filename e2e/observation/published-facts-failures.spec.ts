// Failed fact groups settle as explicit gaps while the same observation keeps
// its completed groups. The fixture supplies raw GitHub records and held or
// failed answers behind the built preview's real local `gh` boundary. The core
// wait bound uses the page's paused clock; later-detail bounds retain their
// proof in recently-done-read-latency and profile-addition-latency.

import type { Page } from "@playwright/test";
import { agentNames } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  callsSince,
  contentReads,
  headsChecks,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { inspectedDetail } from "../../dashboard/tests/storyCardControls.ts";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  shortRevision,
  parts,
  rosterParts,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  heldFactGroups,
  takenCanonicalPath,
  purpose,
} from "../../dashboard/tests/publishedFactsArrival.ts";
import { revision } from "../../dashboard/tests/sliceClockRecords.ts";
import {
  expectCanonicalFacts,
  expectStoryCardAssignments,
  expectDoneFacts,
  expectNoOrphanReading,
} from "../../dashboard/tests/publishedFactsAssertions.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { credit } from "../../dashboard/tests/agentCredit.ts";
import {
  badges,
  preparationFacts,
  sliceProgress,
  storyPurpose,
} from "../../dashboard/tests/storyCardFacts.ts";
import { watchPageErrors } from "../../dashboard/tests/pageErrors.ts";

const preparationGap =
  "The canonical record could not be read for preparation facts.";
const profilesGap = "Agent profiles could not be read.";
const pageErrors = new WeakMap<Page, Error[]>();

test.beforeEach(({ page }) => {
  pageErrors.set(page, watchPageErrors(page));
});

test.afterEach(({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

test("an ordinary canonical failure keeps completed assignments and done stories, with a preparation gap rather than absent facts", async ({
  page,
}) => {
  const {
    branchCard,
    trunkCard,
    queuedCard,
    doneCard,
    problem,
    release,
    fail,
  } = await heldFactGroups(page);
  release("profiles");
  release("done");
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard).toContainText("Reading preparation…");

  fail("preparation");
  await expect(preparationFacts(branchCard)).toHaveText(preparationGap);
  await expect(preparationFacts(trunkCard)).toHaveText(preparationGap);
  await expect(branchCard).not.toContainText("No associated plan is recorded");
  await expect(sliceProgress(branchCard)).toContainText(
    "The associated plan path could not be resolved.",
  );
  await expect(sliceProgress(trunkCard)).toContainText(preparationGap);
  await expect(trunkCard).not.toContainText("No associated plan is recorded");
  await expect(badges(preparationFacts(branchCard))).toHaveCount(0);
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  // This group's unread canonical record also prevents plan reachability.
  // The queued canonical purpose was read; its plan/readiness remain gaps.
  await expect(queuedCard).toContainText("Slice planned");
  await expect(queuedCard).toContainText("Readiness unavailable");
  const detail = await inspectedDetail(queuedCard);
  await expect(storyPurpose(detail)).toHaveText(purpose);
  await expect(detail).toContainText(
    "The associated plan could not be read for readiness facts.",
  );
  await expectNoOrphanReading(page);
  // Terminal missing fact: labeled in place; does not arm detail recovery.
  await expect(problem).toHaveCount(0);
});

test("an ordinary profile failure keeps preparation and done facts and makes assignments unknown on cards and the roster", async ({
  page,
}) => {
  const { branchCard, queuedCard, doneCard, problem, release, fail } =
    await heldFactGroups(page);
  release("preparation");
  release("done");
  await expectCanonicalFacts(queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard).toContainText("Reading agent profile…");

  fail("profiles");
  await expect(credit(branchCard).owner).toHaveText(profilesGap);
  await expect(queuedCard).toContainText(
    `Preparation assignment unknown. ${profilesGap}`,
  );
  await expect(branchCard).not.toContainText("Owner not recorded");
  await expect(branchCard).toContainText(
    "Trunk copy; execution branch unknown because agent profiles could not be read.",
  );
  await expect(branchCard).toContainText(
    "The Take time cannot be determined because agent profiles could not be read.",
  );
  await expectCanonicalFacts(queuedCard);
  await expectDoneFacts(doneCard);
  await expectNoOrphanReading(page);
  await expect(problem).toHaveCount(0);

  // Without a readable assignment there is no portrait to open its roster.
  // Visit the ordinary roster URL with the same failed GitHub answer.
  await openUntilRead(page, "/?project=open-dough&view=roster");
  const { members, roster, back } = rosterParts(page);
  await expect(
    members.filter({ hasText: `Assignment unknown. ${profilesGap}` }),
  ).toHaveCount(agentNames.length);
  await expect(roster).not.toContainText("No assignment recorded");
  await expect(roster).not.toContainText("Reading agent profile…");
  await back.click();
  await expect(credit(branchCard).owner).toHaveText(profilesGap);
  await expectCanonicalFacts(queuedCard);
  await expectDoneFacts(doneCard);
  await expectNoOrphanReading(page);
  await expect(problem).toHaveCount(0);
});

test("an ordinary done-record failure stays in Recently done while preparation, assignments, branch progress, and clocks remain useful", async ({
  page,
}) => {
  const { branchCard, queuedCard, doneCard, problem, release, fail } =
    await heldFactGroups(page);
  release("preparation");
  release("profiles");
  await expectCanonicalFacts(queuedCard);
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expect(branchCard).toContainText("Current slice started 7 min ago");
  await expect(doneCard).toHaveCount(0);

  fail("done");
  await expect(parts(page).recentlyDone).toContainText(
    "Done stories could not be read.",
  );
  await expect(parts(page).recentlyDone).toContainText(
    "GitHub answered HTTP 404",
  );
  await expect(doneCard).toHaveCount(0);
  await expectCanonicalFacts(queuedCard);
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expect(sliceProgress(branchCard)).toContainText(
    "0 of 2 slices recorded complete",
  );
  await expect(branchCard).toContainText("From story branch; not in trunk.");
  await expect(branchCard).toContainText("Current slice started 7 min ago");
  await expectNoOrphanReading(page);
  await expect(problem).toHaveCount(0);
});

test("the existing 30-second core bound keeps assignments and done facts, leaves a standing preparation gap, and the page's recovery closes it without reload", async ({
  page,
}) => {
  const { branchCard, queuedCard, doneCard, problem, release } =
    await heldFactGroups(page);
  release("profiles");
  release("done");
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard).toContainText("Reading preparation…");

  await page.clock.runFor(29_999);
  await expect(branchCard).toContainText("Reading preparation…");
  await expect(problem).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(problem).toContainText(
    "GitHub did not answer within 30 seconds, so the read was given up.",
  );
  const readAt = `after reading the published work at revision ${shortRevision(revision)}`;
  await expect(problem).toContainText(readAt);
  await expect(problem).toContainText("What is shown is what it read");
  await expect(problem).not.toContainText("added nothing");
  await expect(problem).toContainText("this page reads it");
  await expect(preparationFacts(branchCard)).toHaveText(preparationGap);
  await expect(branchCard).not.toContainText("No associated plan is recorded");
  await expect(sliceProgress(branchCard)).toContainText(
    "The associated plan path could not be resolved.",
  );
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expectNoOrphanReading(page);
  // Failed after-membership attempt: short revision is named in the alert (readAt).

  const from = githubFor(page).calls.length;
  await page.clock.runFor(14_000);
  expect(headsChecks(callsSince(page, from))).toHaveLength(0);
  expect(contentReads(callsSince(page, from))).toEqual([]);
  await expect(problem).toContainText(readAt);
  await expect(branchCard).toContainText(preparationGap);
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);

  release("preparation");
  await page.clock.runFor(1_250);
  await expectCanonicalFacts(queuedCard);
  await expectStoryCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(sliceProgress(branchCard)).toContainText(
    "0 of 2 slices recorded complete",
  );
  await expect(branchCard).not.toContainText(preparationGap);
  await expectNoOrphanReading(page);
  await expect(problem).toHaveCount(0);
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
  expect(contentReads(callsSince(page, from))).toContain(
    `${takenCanonicalPath}?ref=${revision}`,
  );
});
