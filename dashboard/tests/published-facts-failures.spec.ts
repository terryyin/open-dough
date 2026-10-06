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
  expectSteadyPace,
  headsChecks,
  passTimeUntilChecked,
} from "./autoRefreshJourney.ts";
import { inspectedDetail } from "./cardControls.ts";
import { expect, githubFor, test } from "./dashboardTest.ts";
import { parts, rosterParts } from "./dashboardPage.ts";
import {
  heldFactGroups,
  takenCanonicalPath,
  purpose,
} from "./publishedFactsArrival.ts";
import { revision } from "./sliceClockRecords.ts";
import {
  expectCanonicalFacts,
  expectCardAssignments,
  expectDoneFacts,
} from "./publishedFactsAssertions.ts";

const preparationGap =
  "The canonical record could not be read for preparation facts.";
const profilesGap = "Agent profiles could not be read.";
const pageErrors = new WeakMap<Page, string[]>();

test.beforeEach(({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

async function expectNoOrphanReading(page: Page) {
  for (const reading of [
    "Reading preparation…",
    "Reading agent profile…",
    "Reading plan slices…",
    "Reading current slice time…",
    "Reading human developer…",
  ]) {
    await expect(page.getByText(reading, { exact: true })).toHaveCount(0);
  }
  await expect(parts(page).reading).toHaveCount(0);
}

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
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard).toContainText("Reading preparation…");

  fail("preparation");
  await expect(branchCard.locator(".card-preparation")).toHaveText(
    preparationGap,
  );
  await expect(trunkCard.locator(".card-preparation")).toHaveText(
    preparationGap,
  );
  await expect(branchCard).not.toContainText("No associated plan is recorded");
  await expect(branchCard.locator(".card-progress")).toContainText(
    "The associated plan path could not be resolved.",
  );
  await expect(trunkCard.locator(".card-progress")).toContainText(
    preparationGap,
  );
  await expect(trunkCard).not.toContainText("No associated plan is recorded");
  await expect(branchCard.locator(".card-preparation .badge")).toHaveCount(0);
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  // This group's unread canonical record also prevents plan reachability.
  // The queued canonical purpose was read; its plan/readiness remain gaps.
  await expect(queuedCard).toContainText("Slice planned");
  await expect(queuedCard).toContainText("Readiness unavailable");
  const detail = await inspectedDetail(queuedCard);
  await expect(detail.locator(".story-purpose")).toHaveText(purpose);
  await expect(detail).toContainText(
    "The associated plan could not be read for readiness facts.",
  );
  await expectNoOrphanReading(page);
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
  await expect(branchCard.locator(".card-owner")).toHaveText(profilesGap);
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
  await page.goto("/?project=open-dough&view=roster");
  const { members, roster, back } = rosterParts(page);
  await expect(
    members.filter({ hasText: `Assignment unknown. ${profilesGap}` }),
  ).toHaveCount(agentNames.length);
  await expect(roster).not.toContainText("No assignment recorded");
  await expect(roster).not.toContainText("Reading agent profile…");
  await back.click();
  await expect(branchCard.locator(".card-owner")).toHaveText(profilesGap);
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
  await expectCardAssignments(branchCard, queuedCard);
  await expect(branchCard).toContainText("Current slice started 7 min ago");
  await expect(doneCard).toHaveCount(0);

  fail("done");
  await expect(parts(page).recentlyDone).toContainText(
    "Done stories could not be read.",
  );
  await expect(parts(page).recentlyDone).toContainText(
    "The local GitHub CLI could not reach GitHub",
  );
  await expect(doneCard).toHaveCount(0);
  await expectCanonicalFacts(queuedCard);
  await expectCardAssignments(branchCard, queuedCard);
  await expect(branchCard.locator(".card-progress")).toContainText(
    "0 of 2 slices recorded complete",
  );
  await expect(branchCard).toContainText("From story branch; not in trunk.");
  await expect(branchCard).toContainText("Current slice started 7 min ago");
  await expectNoOrphanReading(page);
  await expect(problem).toHaveCount(0);
});

test("the existing 30-second core bound keeps assignments and done facts, leaves a standing preparation gap through unchanged checks, and reload closes it", async ({
  page,
}) => {
  const { branchCard, queuedCard, doneCard, problem, release } =
    await heldFactGroups(page);
  release("profiles");
  release("done");
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard).toContainText("Reading preparation…");

  await page.clock.runFor(29_999);
  await expect(branchCard).toContainText("Reading preparation…");
  await expect(problem).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(problem).toContainText(
    "GitHub did not answer within 30 seconds, so the read was given up.",
  );
  const readAt = `after reading the published work at revision ${revision.slice(0, 7)}`;
  await expect(problem).toContainText(readAt);
  await expect(problem).toContainText("What is shown is what it read");
  await expect(problem).not.toContainText("added nothing");
  await expect(problem).toContainText(
    "Automatic checks continue every 15 seconds while this page is visible.",
  );
  await expect(branchCard.locator(".card-preparation")).toHaveText(
    preparationGap,
  );
  await expect(branchCard).not.toContainText("No associated plan is recorded");
  await expect(branchCard.locator(".card-progress")).toContainText(
    "The associated plan path could not be resolved.",
  );
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expectNoOrphanReading(page);
  await expect(parts(page).source).toContainText(revision);

  const from = githubFor(page).calls.length;
  expectSteadyPace(await passTimeUntilChecked(page));
  expect(headsChecks(callsSince(page, from))).toHaveLength(1);
  expect(contentReads(callsSince(page, from))).toEqual([]);
  await expect(problem).toContainText(readAt);
  await expect(parts(page).status).toHaveText("");
  await expect(branchCard).toContainText(preparationGap);
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);

  release("preparation");
  const beforeReload = githubFor(page).calls.length;
  await page.reload();
  await expectCanonicalFacts(queuedCard);
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard.locator(".card-progress")).toContainText(
    "0 of 2 slices recorded complete",
  );
  await expect(branchCard).not.toContainText(preparationGap);
  await expectNoOrphanReading(page);
  await expect(problem).toHaveCount(0);
  await expect(parts(page).source).toContainText(revision);
  expect(contentReads(callsSince(page, beforeReload))).toContain(
    `${takenCanonicalPath}?ref=${revision}`,
  );
});
