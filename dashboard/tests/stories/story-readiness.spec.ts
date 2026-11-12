// Slice 7–8: published preparation, readiness, and inspectable slice progress.
// Setup obtains records through the real CLI, commits them, and serves those
// exact revision bytes at the GitHub HTTP boundary — not a display fixture.
// A second commit records two of five slices done with accepted proof in plan
// text; the shared reader interprets that outcome.

import { expect, test } from "../dashboardTest.ts";
import {
  contentPathsRead,
  publishCommittedOrigin,
} from "../committedOrigin.ts";
import {
  chooseProject,
  shortRevision,
  expectMembership,
  expectOwnersNotRecorded,
  parts,
} from "../dashboardPage.ts";
import { credit } from "../agentCredit.ts";
import {
  hideDetail,
  inspectedDetail,
  storyCard,
} from "../storyCardControls.ts";
import { expectBadges } from "../storyCardFacts.ts";
import {
  expectPlanlessDetailAbsentPlan,
  expectReadyDetailTwoCompleteAfterPublish,
  expectReadyDetailZeroComplete,
} from "../storyReadinessDetail.ts";
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
} from "../storyReadinessFixture.ts";
import {
  expectAgreeingFragment,
  expectQueuedPlanStoryCardAndDetail,
  expectPlanKeyboardDestination,
} from "../queuedPlanNavigation.ts";
import { publishTwoSlicesDone } from "../storyReadinessPublications.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";

const openDoughRepository = "terryyin/open-dough";
const doughnutRepository = "nerds-odd-e/doughnut";

test("story readiness shows labeled preparation on backlog cards from CLI-committed Git bytes", async ({
  page,
  afterGitHubStops,
}) => {
  const openDough = await buildOpenDoughReadinessRepo(afterGitHubStops, {
    canonicalOnlyQueued: true,
  });
  const doughnut = await buildDoughnutReadinessRepo(afterGitHubStops);

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
  const { backlog, taken, readRevision } = parts(page);
  const readyCard = storyCard(taken, plannedReady.title);

  await test.step("membership and order arrive before inventing not-refined", async () => {
    await expectMembership(page, {
      taken: [plannedReady.title],
      backlog: [unrefined.title, plannedBlocked.title],
    });
    await expect(page.getByText("Reading preparation…").first()).toBeVisible();
    await expect(page.locator(".story-card .badge-not-refined")).toHaveCount(0);
    await expect(
      page.getByText("Unpushed local edit that must stay invisible"),
    ).toHaveCount(0);
    releaseSeed();
  });

  await test.step("labeled colors and independent facts from one pinned revision", async () => {
    await expectBadges(readyCard, {
      shown: ["Slice planned", "Ready for execution"],
    });
    await expectBadges(storyCard(backlog, unrefined.title), {
      shown: ["Not refined"],
    });
    await expectBadges(storyCard(backlog, plannedBlocked.title), {
      shown: ["Slice planned", "Not ready"],
      absent: ["Ready for execution"],
    });

    await expect(readRevision).toContainText(shortRevision(openDough.revision));
    await expectOwnersNotRecorded(page);
    await parts(page).preparationHelp.click();
    const legend = page.getByRole("dialog", { name: "Preparation badges" });
    await expect(legend).toBeVisible();
    await legend.getByRole("button", { name: "Close" }).click();
    await expect(
      page.getByText("Unpushed local edit that must stay invisible"),
    ).toHaveCount(0);
  });

  await expectQueuedPlanStoryCardAndDetail(
    backlog,
    openDoughRepository,
    openDough,
    () => openDoughOrigin.requests.length,
  );
  await expectAgreeingFragment(taken, openDoughRepository, openDough.revision);

  await test.step("the gh request budget is 3 + S + P for three stories in one seed with two plans (the third is the agent setting file)", () => {
    const paths = contentPathsRead(openDoughOrigin);
    expect(paths[0]).toBe("main");
    expect(paths).toContain(
      `.planning/PRODUCT-BACKLOG.md?ref=${openDough.revision}`,
    );
    expect(paths).toContain(
      `.planning/seeds/SEED-075-readiness.md?ref=${openDough.revision}`,
    );
    expect(paths).toContain(
      `.planning/slice-plans/075-blocked/PLAN.md?ref=${openDough.revision}`,
    );
    expect(paths).toContain(
      `.planning/slice-plans/075-ready/PLAN.md?ref=${openDough.revision}`,
    );
    expect(paths).toContain(
      `.planning/open-dough.json?ref=${openDough.revision}`,
    );
    expect(paths).toHaveLength(6);
    const distinctFiles = new Set(
      paths.filter((path) => path !== "main").map((path) => path.split("?")[0]),
    );
    expect(distinctFiles.size).toBe(5);
  });

  await test.step("opening already-loaded preparation facts and identity costs no extra read", async () => {
    // The scan view keeps the badges; what they summarize, and the story's
    // full identity, are inspected detail.
    await expect(readyCard.getByText("Approach:")).toHaveCount(0);
    await expect(readyCard).not.toContainText(plannedReady.identity);
    const before = openDoughOrigin.requests.length;
    const detail = await inspectedDetail(readyCard);
    await expect(detail.getByText("Approach:")).toContainText("Slice planned");
    await expect(detail.getByText("Assessment:")).toHaveText(
      "Assessment: Ready",
    );
    await expect(detail.locator(".record-identity")).toHaveText(
      plannedReady.identity,
    );
    expect(openDoughOrigin.requests.length).toBe(before);
    await hideDetail(readyCard);
    await expect(readyCard).toBeFocused();
  });

  await test.step("inspecting Taken detail shows purpose and zero of five slices recorded complete without extra reads", async () => {
    await expectReadyDetailZeroComplete(taken, openDoughOrigin);
  });

  await test.step("after publishing two done slices with accepted proof, a reload shows two of five", async () => {
    await expectReadyDetailTwoCompleteAfterPublish(
      page,
      taken,
      openDough,
      openDoughOrigin,
      publishTwoSlicesDone,
    );
  });

  await test.step("Doughnut shows planless ready and legacy not recorded", async () => {
    await chooseProject(page, "Doughnut");
    await expectMembership(page, {
      taken: [],
      backlog: [
        planless.title,
        legacy.title,
        malformed.title,
        externalPlan.title,
      ],
    });
    await expect(readRevision).toContainText(shortRevision(doughnut.revision));

    await expectBadges(storyCard(backlog, planless.title), {
      shown: ["Refined", "Planless", "Ready for execution"],
    });
    await expectBadges(storyCard(backlog, legacy.title), {
      shown: ["Not recorded"],
      absent: ["Not refined"],
    });

    await expectPlanlessDetailAbsentPlan(backlog);

    // The project setting file is read last, with the agent profiles, which
    // no card here shows as reading.
    await untilPageReadsAnswered(page);
    const doughnutPaths = contentPathsRead(doughnutOrigin);
    expect(doughnutPaths[0]).toBe("main");
    // main + backlog + planless seed + legacy + malformed + external seeds
    // + the agent setting file.
    expect(doughnutPaths).toHaveLength(7);
  });
  await chooseProject(page, "Open Dough");
  // Preparation may arrive before profiles. The no-extra-read check below
  // starts after that unrelated group has answered too.
  await expect(credit(readyCard).owner).toHaveText("Owner not recorded");
  await expectQueuedPlanStoryCardAndDetail(
    backlog,
    openDoughRepository,
    openDough,
    () => openDoughOrigin.requests.length,
  );
  await expectPlanKeyboardDestination(page, backlog, openDough);
});
