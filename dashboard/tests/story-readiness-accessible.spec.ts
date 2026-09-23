// Slice 11: preparation and progress remain understandable and operable by
// keyboard, narrow/zoomed reading, and color-independent badges. Extends the
// shared accessibility helpers against the real CLI-committed fixture.

import { expectQueuedPlanFocusDuringEnrichment } from "./queuedPlanFocus";
import { expect, test } from "./dashboardTest";
import { publishCommittedOrigin } from "./committedOrigin";
import { expectMembership, parts } from "./dashboardPage";
import {
  expectBadgeTextContrastAndReducedMotion,
  expectKeyboardOpensAndClosesDetail,
  expectNarrowZoomKeepsLabelsEvidenceAndRetry,
  expectRefreshPreservesOrAnnouncesIdentity,
} from "./storyReadinessAccessible";
import {
  buildOpenDoughReadinessRepo,
  plannedBlocked,
  plannedReady,
  unrefined,
} from "./storyReadinessFixture";
import { publishRestoreUnrefined } from "./storyReadinessPublications";

const openDoughRepository = "terryyin/open-dough";

test("story readiness reads preparation and progress accessibly", async ({
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
    const openDoughOrigin = await publishCommittedOrigin(page, {
      repoDir: openDough.directory,
      revision: openDough.revision,
      repository: openDoughRepository,
    });

    await page.goto("/");
    const { taken, backlog, refresh } = parts(page);

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

    await test.step("refresh preserves identity focus or announces removal", async () => {
      await expectRefreshPreservesOrAnnouncesIdentity(
        page,
        backlog,
        refresh,
        openDough,
        openDoughOrigin,
      );
    });

    await test.step("badge text, contrast, and reduced-motion settle immediately", async () => {
      const restored = publishRestoreUnrefined(openDough);
      openDoughOrigin.advanceTo(restored);
      await parts(page).refresh.click();
      await expectMembership(page, {
        taken: [plannedReady.title],
        backlog: [unrefined.title, plannedBlocked.title],
      });
      await expectBadgeTextContrastAndReducedMotion(page, taken, backlog);
    });

    await test.step("at 320px and 400% zoom, labels, evidence, and Retry stay reachable", async () => {
      await expectNarrowZoomKeepsLabelsEvidenceAndRetry(
        page,
        taken,
        backlog,
        parts(page).refresh,
        openDoughOrigin,
      );
    });
  } finally {
    for (const cleanup of cleanups.reverse()) {
      cleanup();
    }
  }
});

test("queued plan focus deferral respects deliberate movement and a removed association", async ({
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
    await expectQueuedPlanFocusDuringEnrichment(page, repo, origin);
  } finally {
    for (const cleanup of cleanups.reverse()) cleanup();
  }
});
