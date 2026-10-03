// Slice 9: truthful evidence gaps and refreshes. Setup mutates committed Git
// bytes and fails HTTP routes; shared readers project badges. Gap labels are
// never planted in fixtures.

import { expectChangedQueuedAssociations } from "./queuedPlanGaps.ts";
import { passTimeUntilChecked, pausePageClock } from "./autoRefreshJourney.ts";
import { expect, test } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  buildDoughnutReadinessRepo,
  buildOpenDoughReadinessRepo,
  plannedBlocked,
  plannedReady,
  unrefined,
} from "./storyReadinessFixture.ts";
import {
  publishAssessedContentChange,
  publishFreshAssessment,
  publishConflictingPlanAssociation,
} from "./storyReadinessPublications.ts";
import {
  expectFailedPlanKeepsSupportedFacts,
  expectChangedReviewAfterContentChange,
  expectPlanAssociationConflict,
} from "./storyReadinessGaps.ts";
import { expectMalformedExternalAndLegacy } from "./storyReadinessRecordGaps.ts";
import {
  expectFailedCheckKeepsPriorRevision,
  expectNoRereadAfterSettlement,
  expectProjectSwitchRejectsLateHeldRead,
} from "./storyReadinessRefresh.ts";

const openDoughRepository = "terryyin/open-dough";
const doughnutRepository = "nerds-odd-e/doughnut";

test("story readiness keeps evidence gaps and refreshes truthful", async ({
  page,
  afterGitHubStops,
}) => {
  const openDough = buildOpenDoughReadinessRepo(afterGitHubStops, {
    canonicalOnlyQueued: true,
  });
  const doughnut = buildDoughnutReadinessRepo(afterGitHubStops);

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
  const { project, source, backlog, taken, problem } = parts(page);

  await test.step("baseline membership arrives with supported preparation facts", async () => {
    await expectMembership(page, {
      taken: [plannedReady.title],
      backlog: [unrefined.title, plannedBlocked.title],
    });
    await expect(
      taken
        .getByRole("article", { name: plannedReady.title })
        .getByText("Ready for execution", { exact: true }),
    ).toBeVisible();
    await expect(source).toContainText(openDough.revision);
  });

  await test.step("changed assessed content without reassessment retains judgment with a change indication and keeps planning facts", async () => {
    await expectChangedReviewAfterContentChange(
      page,
      taken,
      backlog,
      source,
      openDough,
      openDoughOrigin,
      publishAssessedContentChange,
    );
  });

  await test.step("a fresh published assessment clears changes for both recorded judgments", async () => {
    const next = publishFreshAssessment(openDough);
    openDoughOrigin.advanceTo(next);
    await passTimeUntilChecked(page);
    await expect(source).toContainText(next);
    for (const [list, title, judgment] of [
      [taken, plannedReady.title, "Ready for execution"],
      [backlog, plannedBlocked.title, "Not ready"],
    ] as const) {
      const card = list.getByRole("article", { name: title });
      await expect(card.getByText(judgment, { exact: true })).toBeVisible();
      await expect(
        card.getByText("Changed since readiness review", { exact: true }),
      ).toHaveCount(0);
      await card.getByRole("button", { name: "Inspect story" }).click();
      await expect(
        card.getByRole("region", { name: `Detail for ${title}` }),
      ).not.toContainText("Changed since readiness review");
      await card.getByRole("button", { name: "Hide detail" }).click();
    }
  });

  await test.step("conflicting plan association is reported without preferring a source", async () => {
    await expectPlanAssociationConflict(
      page,
      taken,
      source,
      openDough,
      openDoughOrigin,
      publishConflictingPlanAssociation,
    );
  });

  await test.step("failed plan retrieval keeps supported facts and names only the dependent gap", async () => {
    await expectFailedPlanKeepsSupportedFacts(
      page,
      backlog,
      source,
      openDough,
      openDoughOrigin,
    );
  });

  await test.step("a failed check keeps prior evidence labeled with its original revision; a reload recovers", async () => {
    await expectFailedCheckKeepsPriorRevision(
      page,
      source,
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
      project,
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
  await expectChangedQueuedAssociations(page, repo, origin);
});
