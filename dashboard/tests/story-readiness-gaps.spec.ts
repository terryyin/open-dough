// Slice 9: truthful evidence gaps and refreshes. Setup mutates committed Git
// bytes and fails HTTP routes; shared readers project badges. Gap labels are
// never planted in fixtures.

import { expectChangedQueuedAssociations } from "./queuedPlanGaps";
import { expect, test } from "./dashboardTest";
import { publishCommittedOrigin } from "./committedOrigin";
import { expectMembership, parts } from "./dashboardPage";
import {
  buildDoughnutReadinessRepo,
  buildOpenDoughReadinessRepo,
  plannedBlocked,
  plannedReady,
  unrefined,
} from "./storyReadinessFixture";
import {
  publishAssessedContentChange,
  publishConflictingPlanAssociation,
} from "./storyReadinessPublications";
import {
  expectFailedPlanKeepsSupportedFacts,
  expectNeedsReassessmentAfterContentChange,
  expectPlanAssociationConflict,
} from "./storyReadinessGaps";
import { expectMalformedExternalAndLegacy } from "./storyReadinessRecordGaps";
import {
  expectFailedRefreshKeepsPriorRevision,
  expectNoRereadAfterSettlement,
  expectProjectSwitchRejectsLateHeldRead,
} from "./storyReadinessRefresh";

const openDoughRepository = "terryyin/open-dough";
const doughnutRepository = "nerds-odd-e/doughnut";

test("story readiness keeps evidence gaps and refreshes truthful", async ({
  page,
}) => {
  const cleanups: Array<() => void> = [];
  const after = (cleanup: () => void) => {
    cleanups.push(cleanup);
  };
  try {
    const openDough = buildOpenDoughReadinessRepo(after, {
      canonicalOnlyQueued: true,
    });
    const doughnut = buildDoughnutReadinessRepo(after);

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

    await page.goto("/");
    const { project, source, backlog, taken, refresh, retry, problem } =
      parts(page);

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

    await test.step("changed assessed content without reassessment names Needs reassessment and keeps planning facts", async () => {
      await expectNeedsReassessmentAfterContentChange(
        taken,
        backlog,
        source,
        refresh,
        openDough,
        openDoughOrigin,
        publishAssessedContentChange,
      );
    });

    await test.step("conflicting plan association is reported without preferring a source", async () => {
      await expectPlanAssociationConflict(
        page,
        taken,
        source,
        refresh,
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
        refresh,
        openDough,
        openDoughOrigin,
      );
    });

    await test.step("failed refresh keeps prior evidence labeled with its original revision; Retry recovers", async () => {
      await expectFailedRefreshKeepsPriorRevision(
        source,
        refresh,
        retry,
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
        refresh,
        openDoughOrigin,
        openDough,
        doughnut,
      );
    });

    await test.step("malformed blocks, external navigation-only links, and old records stay truthful", async () => {
      await expectMalformedExternalAndLegacy(backlog, doughnutOrigin);
    });

    await test.step("no immediate re-read or unbounded retries after settlement", async () => {
      await expectNoRereadAfterSettlement(doughnutOrigin, page);
      await expectNoRereadAfterSettlement(openDoughOrigin, page);
    });
  } finally {
    for (const cleanup of cleanups.reverse()) {
      cleanup();
    }
  }
});

test("queued plan navigation follows changed associations and qualifies unsupported, invalid and conflicting source records", async ({
  page,
}) => {
  const cleanups: Array<() => void> = [];
  try {
    const repo = buildOpenDoughReadinessRepo(
      (cleanup) => cleanups.push(cleanup),
      { canonicalOnlyQueued: true },
    );
    const origin = await publishCommittedOrigin(page, {
      repoDir: repo.directory,
      revision: repo.revision,
      repository: openDoughRepository,
    });
    await page.goto("/");
    await expectChangedQueuedAssociations(page, repo, origin);
  } finally {
    for (const cleanup of cleanups.reverse()) cleanup();
  }
});
