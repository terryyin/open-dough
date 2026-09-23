// Slice 7–8: published preparation, readiness, and inspectable slice progress.
// Setup obtains records through the real CLI, commits them, and serves those
// exact revision bytes at the GitHub HTTP boundary — not a display fixture.
// A second commit records two of five slices done with accepted proof in plan
// text; the shared reader interprets that outcome.

import { expect, test } from "@playwright/test";
import { contentPathsRead, publishCommittedOrigin } from "./committedOrigin";
import { expectMembership, parts } from "./dashboardPage";
import {
  expectPlanlessDetailAbsentPlan,
  expectReadyDetailTwoCompleteAfterPublish,
  expectReadyDetailZeroComplete,
} from "./storyReadinessDetail";
import {
  buildDoughnutReadinessRepo,
  buildOpenDoughReadinessRepo,
  externalPlan,
  legacy,
  malformed,
  plannedBlocked,
  plannedReady,
  planless,
  unrefined,
} from "./storyReadinessFixture";
import {
  expectAgreeingFragment,
  expectQueuedPlanCardAndDetail,
  expectPlanKeyboardDestination,
} from "./queuedPlanNavigation";
import { publishTwoSlicesDone } from "./storyReadinessPublications";

const openDoughRepository = "terryyin/open-dough";
const doughnutRepository = "nerds-odd-e/doughnut";

test("story readiness shows labeled preparation on public cards from CLI-committed Git bytes", async ({
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
    const releaseSeed = openDoughOrigin.hold(
      ".planning/seeds/SEED-075-readiness.md",
    );
    const doughnutOrigin = await publishCommittedOrigin(page, {
      repoDir: doughnut.directory,
      revision: doughnut.revision,
      repository: doughnutRepository,
    });

    await page.goto("/");
    const { project, source, backlog, taken, refresh } = parts(page);

    await test.step("membership and order arrive before inventing not-refined", async () => {
      await expectMembership(page, {
        taken: [plannedReady.title],
        backlog: [unrefined.title, plannedBlocked.title],
      });
      await expect(
        page.getByText("Reading preparation…").first(),
      ).toBeVisible();
      await expect(page.locator(".card .badge-not-refined")).toHaveCount(0);
      await expect(
        page.getByText("Unpushed local edit that must stay invisible"),
      ).toHaveCount(0);
      releaseSeed();
    });

    await test.step("labeled colors and independent facts from one pinned revision", async () => {
      const readyCard = taken.getByRole("article", {
        name: plannedReady.title,
      });
      const unrefinedCard = backlog.getByRole("article", {
        name: unrefined.title,
      });
      const blockedCard = backlog.getByRole("article", {
        name: plannedBlocked.title,
      });

      await expect(
        readyCard.getByText("Slice planned", { exact: true }),
      ).toBeVisible();
      await expect(
        readyCard.getByText("Ready for execution", { exact: true }),
      ).toBeVisible();
      await expect(
        unrefinedCard.getByText("Not refined", { exact: true }),
      ).toBeVisible();
      await expect(
        blockedCard.getByText("Slice planned", { exact: true }),
      ).toBeVisible();
      await expect(
        blockedCard.getByText("Not ready", { exact: true }),
      ).toBeVisible();
      await expect(
        blockedCard.getByText("Ready for execution", { exact: true }),
      ).toHaveCount(0);

      await expect(source).toContainText(openDough.revision);
      await parts(page).preparationHelp.click();
      const legend = page.getByRole("dialog", { name: "Preparation badges" });
      await expect(legend).toBeVisible();
      await legend.getByRole("button", { name: "Close" }).click();
      await expect(
        page.getByText("Unpushed local edit that must stay invisible"),
      ).toHaveCount(0);
    });

    await expectQueuedPlanCardAndDetail(
      backlog,
      openDoughRepository,
      openDough,
      () => openDoughOrigin.requests.length,
    );
    await expectAgreeingFragment(
      taken,
      openDoughRepository,
      openDough.revision,
    );

    await test.step("public request budget is 2 + S + P for three stories in one seed with two plans", () => {
      const paths = contentPathsRead(openDoughOrigin);
      expect(paths[0]).toBe("main");
      expect(paths).toContain(
        `.planning/PRODUCT-BACKLOG.md?ref=${openDough.revision}`,
      );
      expect(paths).toContain(
        `.planning/seeds/SEED-075-readiness.md?ref=${openDough.revision}`,
      );
      expect(paths).toContain(
        `.planning/quick/075-blocked/PLAN.md?ref=${openDough.revision}`,
      );
      expect(paths).toContain(
        `.planning/quick/075-ready/PLAN.md?ref=${openDough.revision}`,
      );
      expect(paths).toHaveLength(5);
      const distinctFiles = new Set(
        paths
          .filter((path) => path !== "main")
          .map((path) => path.split("?")[0]),
      );
      expect(distinctFiles.size).toBe(4);
    });

    await test.step("opening already-loaded preparation facts costs no extra read", async () => {
      const before = openDoughOrigin.requests.length;
      const readyCard = taken.getByRole("article", {
        name: plannedReady.title,
      });
      await readyCard.getByText("Preparation facts").click();
      await expect(readyCard.getByText("Approach:")).toContainText(
        "Slice planned",
      );
      await expect(readyCard.getByText("Assessment:")).toContainText(
        "Ready for execution",
      );
      expect(openDoughOrigin.requests.length).toBe(before);
    });

    await test.step("inspecting Taken detail shows purpose and zero of five recorded complete without extra reads", async () => {
      await expectReadyDetailZeroComplete(taken, openDoughOrigin);
    });

    await test.step("after publishing two done slices with accepted proof, refresh shows two of five", async () => {
      await expectReadyDetailTwoCompleteAfterPublish(
        page,
        taken,
        source,
        refresh,
        openDough,
        openDoughOrigin,
        publishTwoSlicesDone,
      );
    });

    await test.step("Doughnut shows planless ready and legacy not recorded", async () => {
      await project.selectOption("doughnut");
      await expectMembership(page, {
        taken: [],
        backlog: [
          planless.title,
          legacy.title,
          malformed.title,
          externalPlan.title,
        ],
      });
      await expect(source).toContainText(doughnut.revision);

      const planlessCard = backlog.getByRole("article", {
        name: planless.title,
      });
      const legacyCard = backlog.getByRole("article", {
        name: legacy.title,
      });
      await expect(
        planlessCard.getByText("Refined", { exact: true }),
      ).toBeVisible();
      await expect(
        planlessCard.getByText("Planless", { exact: true }),
      ).toBeVisible();
      await expect(
        planlessCard.getByText("Ready for execution", { exact: true }),
      ).toBeVisible();
      await expect(
        legacyCard.getByText("Not recorded", { exact: true }),
      ).toBeVisible();
      await expect(
        legacyCard.getByText("Not refined", { exact: true }),
      ).toHaveCount(0);

      await expectPlanlessDetailAbsentPlan(backlog);

      const doughnutPaths = contentPathsRead(doughnutOrigin);
      expect(doughnutPaths[0]).toBe("main");
      // main + backlog + planless seed + legacy + malformed + external seeds.
      expect(doughnutPaths).toHaveLength(6);
    });
    await project.selectOption("open-dough");
    await expectQueuedPlanCardAndDetail(
      backlog,
      openDoughRepository,
      openDough,
      () => openDoughOrigin.requests.length,
    );
    await expectPlanKeyboardDestination(page, backlog, openDough);
  } finally {
    for (const cleanup of cleanups.reverse()) {
      cleanup();
    }
  }
});
