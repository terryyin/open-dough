// Slice 11: preparation and progress remain understandable and operable by
// keyboard, narrow/zoomed reading, and color-independent badges. Extends the
// shared accessibility helpers against the real CLI-committed fixture.

import { expectQueuedPlanFocusDuringEnrichment } from "./queuedPlanFocus.ts";
import {
  passTimeUntilCheckedAfterSettled,
  pausePageClock,
} from "./autoRefreshJourney.ts";
import { expect, test } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  expectBadgeTextContrastAndReducedMotion,
  expectKeyboardOpensAndClosesDetail,
  expectNarrowZoomKeepsLabelsEvidenceAndFailure,
  expectNewSnapshotPreservesOrAnnouncesIdentity,
} from "./storyReadinessAccessible.ts";
import { expectScanToDetailAt420AndTwiceZoom } from "./storyReadinessScan.ts";
import {
  buildOpenDoughReadinessRepo,
  plannedBlocked,
  plannedReady,
  unrefined,
} from "./storyReadinessFixture.ts";
import {
  publishAssessedContentChange,
  publishRestoreUnrefined,
} from "./storyReadinessPublications.ts";

const openDoughRepository = "terryyin/open-dough";

test("story readiness reads preparation and progress accessibly", async ({
  page,
  afterGitHubStops,
}) => {
  const openDough = buildOpenDoughReadinessRepo(afterGitHubStops, {
    canonicalOnlyQueued: true,
  });
  const openDoughOrigin = await publishCommittedOrigin(page, {
    repoDir: openDough.directory,
    revision: openDough.revision,
    repository: openDoughRepository,
  });

  await pausePageClock(page);
  await page.goto("/");
  const { taken, backlog } = parts(page);

  await test.step("CLI-committed membership and labeled badges arrive", async () => {
    await expectMembership(page, {
      taken: [plannedReady.title],
      backlog: [unrefined.title, plannedBlocked.title],
    });
    await expect(
      taken
        .getByRole("article", { name: plannedReady.title })
        .getByText("Ready for execution", { exact: true }),
    ).toBeVisible();
  });

  await test.step("keyboard opens and closes detail, returning focus to the card", async () => {
    await expectKeyboardOpensAndClosesDetail(page, taken);
  });

  await test.step("a newly read snapshot preserves identity focus or announces removal", async () => {
    await expectNewSnapshotPreservesOrAnnouncesIdentity(
      page,
      backlog,
      openDough,
      openDoughOrigin,
    );
  });

  await test.step("the next newly read snapshot withdraws the removal announcement", async () => {
    publishRestoreUnrefined(openDough);
    const restored = publishAssessedContentChange(openDough);
    openDoughOrigin.advanceTo(restored);
    await passTimeUntilCheckedAfterSettled(page);
    await expect(parts(page).source).toContainText(restored);
    await expectMembership(page, {
      taken: [plannedReady.title],
      backlog: [unrefined.title, plannedBlocked.title],
    });
    await expect(parts(page).reading).toHaveCount(0);
    await expect(parts(page).notice).toBeEmpty();
  });

  await test.step("badge text, contrast, and reduced-motion settle immediately", async () => {
    await expectBadgeTextContrastAndReducedMotion(page, taken, backlog);
  });

  await test.step("at 420px and 200% zoom, the scan view reads whole and the keyboard reaches the detail's links and back", async () => {
    await expectScanToDetailAt420AndTwiceZoom(page, taken, backlog);
  });

  await test.step("at 320px and 400% zoom, labels, evidence, and the read failure stay reachable", async () => {
    await expectNarrowZoomKeepsLabelsEvidenceAndFailure(
      page,
      taken,
      backlog,
      openDoughOrigin,
    );
  });
});

test("queued plan focus deferral respects deliberate movement and a removed association", async ({
  page,
  afterGitHubStops,
}) => {
  const repo = buildOpenDoughReadinessRepo(afterGitHubStops, {
    canonicalOnlyQueued: true,
  });
  const origin = await publishCommittedOrigin(page, {
    repoDir: repo.directory,
    revision: repo.revision,
    repository: openDoughRepository,
  });
  await pausePageClock(page);
  await page.goto("/");
  await expectQueuedPlanFocusDuringEnrichment(page, repo, origin);
});
