import {
  closeSessionDetails,
  sessionActions,
  sessionDetails,
} from "../support/sessionEntryDisclosure.ts";
import {
  failFirstHistoricalCreditRead,
  historicalCreditReads,
  holdFirstHistoricalCreditRead,
  profileListingsAt,
  readsAtRevision,
} from "../support/historicalCreditReads.ts";
import { openSessionAttributionBoard } from "../support/sessionAttributionFixture.ts";
import { expect, test } from "../dashboardTest.ts";
import { storyCardSessions, parts } from "../dashboardPage.ts";
import {
  publishPreparingJourney,
  storyA,
  storyC,
} from "../preparingJourney.ts";
import { authenticatedReadRoute } from "../holdAuthenticatedReads.ts";

test.use({ projectFolders: ["open-dough"] });

// Each worker publishes the preparation history the board reads.
test.beforeAll(async () => {
  await publishPreparingJourney();
});

test("a retained session keeps its allocation credit after release and a later preparation, and preserves known facts when history is missing", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const {
    journey,
    reused,
    unreadableRevision,
    authenticatedReads,
    show,
    sessionId,
    matchingId,
    card,
    original,
    legacySession,
    missing,
    duplicate,
    historical,
    unknown,
  } = await openSessionAttributionBoard(page, dashboard, afterGitHubStops);
  await expect(card.locator(".story-card-preparing .owner-line")).toHaveText(
    `${journey.preparers.refining} · Integration Checkout · Claude Code · claude-opus-5-5`,
  );
  await expect(original.locator(".session-entry-host")).toHaveCount(0);
  await expect(original.locator(".session-entry-model")).toHaveText(
    "Model: Fable (requested)",
  );
  await expect(original.locator(".session-assignment")).toHaveCount(0);
  expect(
    historicalCreditReads(authenticatedReads, journey.refiningAllocation),
  ).toEqual([]);
  expect(historicalCreditReads(authenticatedReads, unreadableRevision)).toEqual(
    [],
  );
  expect(
    profileListingsAt(authenticatedReads, journey.announced).length,
  ).toBeGreaterThan(0);

  const beforeOriginalOpen = authenticatedReads.length;
  await sessionDetails(original);
  await expect(original).toContainText(historical);
  await expect(original).toContainText("Model: Fable (requested)");
  const afterOriginalOpen = authenticatedReads.slice(beforeOriginalOpen);
  expect(
    historicalCreditReads(afterOriginalOpen, journey.refiningAllocation).length,
  ).toBeGreaterThan(0);
  expect(historicalCreditReads(afterOriginalOpen, unreadableRevision)).toEqual(
    [],
  );
  await closeSessionDetails(original);
  await expect(original.locator(".session-assignment")).toHaveCount(0);

  await sessionDetails(legacySession);
  await expect(legacySession).toContainText(unknown);
  await closeSessionDetails(legacySession);

  const beforeMissingOpen = authenticatedReads.length;
  await sessionDetails(missing);
  await expect(missing).toContainText(unknown);
  await expect(missing).toContainText("Model: claude-opus-5-5 (requested)");
  expect(
    readsAtRevision(
      authenticatedReads.slice(beforeMissingOpen),
      unreadableRevision,
    ).length,
  ).toBeGreaterThan(0);
  await closeSessionDetails(missing);
  await expect(missing.locator(".session-assignment")).toHaveCount(0);
  const beforeMissingReopen = authenticatedReads.length;
  await sessionDetails(missing);
  await expect(missing).toContainText(unknown);
  expect(
    readsAtRevision(
      authenticatedReads.slice(beforeMissingReopen),
      unreadableRevision,
    ).length,
  ).toBeGreaterThan(0);
  await closeSessionDetails(missing);

  await expect(duplicate).toContainText("Ready for slice planning");
  await expect(duplicate.locator(".session-entry-host")).toHaveCount(0);
  await expect(duplicate.locator(".session-entry-model")).toHaveCount(0);
  await sessionDetails(duplicate);
  await expect(duplicate.locator(".session-assignment")).toHaveCount(0);
  await expect(
    duplicate.getByText("Model: claude-opus-5-5 (requested)", { exact: true }),
  ).toBeVisible();
  await expect(
    duplicate.getByText(/^Refinement started in Claude Code/),
  ).toBeVisible();
  await closeSessionDetails(duplicate);
  await expect(duplicate).toContainText(
    "Workspace ~/git/open-dough/.worktrees/c-refine",
  );
  await expect(
    duplicate.getByRole("button", { name: "Mark as read" }),
  ).toBeVisible();
  await expect(
    duplicate.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(
    (await sessionActions(duplicate)).getByRole("button", {
      name: "Mark as done",
    }),
  ).toBeVisible();
  await expect(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: matchingId }),
  ).toHaveCount(0);

  const held = await holdFirstHistoricalCreditRead(
    page,
    journey.refiningAllocation,
  );
  await sessionDetails(original);
  await expect(original).toContainText("Reading human developer…");
  await closeSessionDetails(original);
  held.release();
  await expect(original.locator(".session-assignment")).toHaveCount(0);
  await page.unroute(authenticatedReadRoute);
  await sessionDetails(original);
  await expect(original).toContainText(historical);
  await closeSessionDetails(original);

  await failFirstHistoricalCreditRead(page, journey.refiningAllocation);
  await sessionDetails(original);
  await expect(original).toContainText(unknown);
  await expect(original).toContainText("Model: Fable (requested)");
  await closeSessionDetails(original);
  await page.unroute(authenticatedReadRoute);
  await sessionDetails(original);
  await expect(original).toContainText(historical);
  await closeSessionDetails(original);

  await show(journey.refinedLanded);
  await expect(duplicate.locator(".session-entry-host")).toBeVisible();
  await expect(duplicate.locator(".session-entry-model")).toBeVisible();
  await sessionDetails(duplicate);
  await expect(duplicate).toContainText(historical);
  await expect(duplicate).toContainText("Model: claude-opus-5-5 (requested)");
  await sessionDetails(original);
  await expect(original).toContainText(historical);
  await expect(original).toContainText("Model: Fable (requested)");
  await expect(original.locator(".session-state")).toHaveText("Working");
  await expect(
    original.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(card.locator(".preparing-activity")).toHaveCount(0);
  await sessionDetails(legacySession);
  await expect(legacySession).toContainText(unknown);
  await sessionDetails(missing);
  await expect(missing).toContainText(unknown);
  await expect(missing).toContainText("Model: claude-opus-5-5 (requested)");
  await show(journey.planningAnnounced);
  await expect(card.locator(".story-card-preparing")).toContainText(
    journey.preparers.planning,
  );
  await sessionDetails(original);
  await expect(original).toContainText(historical);
  await expect(original).not.toContainText(journey.preparers.planning);
  await expect(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: sessionId }),
  ).toHaveCount(0);
  await show(reused);
  await expect(
    parts(page)
      .backlog.getByRole("article", { name: storyA })
      .locator(".owner-line")
      .filter({ hasText: journey.preparers.refining }),
  ).toHaveText(
    `${journey.preparers.refining} · Later Allocator · Cursor · later-model`,
  );
  const originalAfterReuse = storyCardSessions(
    parts(page).backlog.getByRole("article", { name: storyC }),
  ).filter({ hasText: sessionId });
  await sessionDetails(originalAfterReuse);
  await expect(originalAfterReuse).toContainText(historical);
  await expect(originalAfterReuse).not.toContainText("Later Allocator");
});
