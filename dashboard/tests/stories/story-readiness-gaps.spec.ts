// Truthful readiness evidence, gaps and refreshes. Setup mutates committed Git
// bytes and fails HTTP routes; shared readers project badges. Gap labels are
// never planted in fixtures.

import type { Page } from "@playwright/test";
import { expectChangedQueuedAssociations } from "../queuedPlanGaps.ts";
import {
  passTimeUntilCheckedAfterSettled,
  pausePageClock,
} from "../autoRefreshJourney.ts";
import { expect, test } from "../dashboardTest.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { shortRevision, expectSettledPage, parts } from "../dashboardPage.ts";
import {
  buildDoughnutReadinessRepo,
  buildOpenDoughReadinessRepo,
  plannedBlocked,
  plannedReady,
  unrefined,
} from "../storyReadinessFixture.ts";
import {
  publishAssessedContentChange,
  publishFreshAssessment,
  publishConflictingPlanAssociation,
} from "../storyReadinessPublications.ts";
import {
  expectFailedPlanKeepsSupportedFacts,
  expectChangedReviewAfterContentChange,
  expectPlanAssociationConflict,
} from "../storyReadinessGaps.ts";
import { expectMalformedExternalAndLegacy } from "../storyReadinessRecordGaps.ts";
import {
  expectFailedCheckKeepsPriorRevision,
  expectNoRereadAfterSettlement,
  expectProjectSwitchRejectsLateHeldRead,
} from "../storyReadinessRefresh.ts";
import {
  hideDetail,
  inspectedDetail,
  storyCard,
} from "../storyCardControls.ts";
import { expectBadges } from "../storyCardFacts.ts";

const openDoughRepository = "terryyin/open-dough";
const doughnutRepository = "nerds-odd-e/doughnut";

// Both repositories published from their baselines, with origin's page open
// on a paused clock and its baseline membership settled.
async function openReadiness(
  page: Page,
  afterGitHubStops: (cleanup: () => void) => void,
) {
  const openDough = await buildOpenDoughReadinessRepo(afterGitHubStops, {
    canonicalOnlyQueued: true,
  });
  const doughnut = await buildDoughnutReadinessRepo(afterGitHubStops);

  const openDoughOrigin = await publishCommittedOrigin(page, {
    repoDir: openDough.directory,
    revision: openDough.revision,
    repository: openDoughRepository,
  });
  const doughnutOrigin = await publishCommittedOrigin(page, {
    repoDir: doughnut.directory,
    revision: doughnut.revision,
    repository: doughnutRepository,
  });

  await pausePageClock(page);
  await page.goto("/");
  await expectSettledPage(page, {
    taken: [plannedReady.title],
    backlog: [unrefined.title, plannedBlocked.title],
  });
  return {
    openDough,
    doughnut,
    openDoughOrigin,
    doughnutOrigin,
    ...parts(page),
  };
}

test("story readiness keeps changed and conflicting evidence truthful", async ({
  page,
  afterGitHubStops,
}) => {
  const { openDough, openDoughOrigin, backlog, taken, readRevision } =
    await openReadiness(page, afterGitHubStops);

  await test.step("baseline membership arrives with supported preparation facts", async () => {
    await expectBadges(storyCard(taken, plannedReady.title), {
      shown: ["Ready for execution"],
    });
    await expect(readRevision).toContainText(shortRevision(openDough.revision));
  });

  await test.step("changed assessed content without reassessment retains judgment with a change indication and keeps planning facts", async () => {
    await expectChangedReviewAfterContentChange(
      page,
      taken,
      backlog,
      openDough,
      openDoughOrigin,
      publishAssessedContentChange,
    );
  });

  await test.step("a fresh published assessment clears changes for both recorded judgments", async () => {
    const next = publishFreshAssessment(openDough);
    openDoughOrigin.advanceTo(next);
    await passTimeUntilCheckedAfterSettled(page);
    await expectSettledPage(page);
    await expect(readRevision).toContainText(shortRevision(next));
    for (const [list, title, judgment] of [
      [taken, plannedReady.title, "Ready for execution"],
      [backlog, plannedBlocked.title, "Not ready"],
    ] as const) {
      const card = storyCard(list, title);
      await expectBadges(card, {
        shown: [judgment],
        absent: ["Changed since readiness review"],
      });
      await expect(await inspectedDetail(card)).not.toContainText(
        "Changed since readiness review",
      );
      await hideDetail(card);
    }
  });

  await test.step("conflicting plan association is reported without preferring a source", async () => {
    await expectPlanAssociationConflict(
      page,
      taken,
      openDough,
      openDoughOrigin,
      publishConflictingPlanAssociation,
    );
  });
});

test("story readiness keeps evidence gaps and refreshes truthful", async ({
  page,
  afterGitHubStops,
}) => {
  const {
    openDough,
    doughnut,
    openDoughOrigin,
    doughnutOrigin,
    backlog,
    taken,
    problem,
  } = await openReadiness(page, afterGitHubStops);

  await test.step("failed plan retrieval keeps supported facts and names only the dependent gap", async () => {
    await expectFailedPlanKeepsSupportedFacts(
      page,
      backlog,
      openDough,
      openDoughOrigin,
    );
  });

  await test.step("a failed check keeps prior evidence labeled with its original revision; a reload recovers", async () => {
    await expectFailedCheckKeepsPriorRevision(
      page,
      problem,
      openDough,
      openDoughOrigin,
      taken,
      backlog,
    );
  });

  await test.step("switching projects during a held read cannot leak its late result", async () => {
    await expectProjectSwitchRejectsLateHeldRead(
      page,
      openDoughOrigin,
      openDough,
      doughnut,
    );
  });

  await test.step("malformed blocks, external navigation-only links, and old records stay truthful", async () => {
    await expectMalformedExternalAndLegacy(backlog, doughnutOrigin);
  });

  await test.step("no immediate re-read or unbounded retries after settlement", async () => {
    await expectNoRereadAfterSettlement(page, [
      doughnutOrigin,
      openDoughOrigin,
    ]);
  });
});

test("queued plan navigation follows changed associations and qualifies unsupported, invalid and conflicting source records", async ({
  page,
  afterGitHubStops,
}) => {
  const repo = await buildOpenDoughReadinessRepo(afterGitHubStops, {
    canonicalOnlyQueued: true,
  });
  const origin = await publishCommittedOrigin(page, {
    repoDir: repo.directory,
    revision: repo.revision,
    repository: openDoughRepository,
  });
  await pausePageClock(page);
  await page.goto("/");
  await expectChangedQueuedAssociations(page, repo, origin);
});
