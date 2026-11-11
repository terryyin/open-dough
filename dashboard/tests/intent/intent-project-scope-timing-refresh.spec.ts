// Real collected history separates a middle Done landing from observed trunk.
import { shortSha } from "../../src/baseCiWording.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { openProjectIntent, returnToStory } from "../intentModePage.ts";
import {
  fileReadingTab,
  proofRegion,
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";
import { passTimeUntilCheckedAfterSettled } from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import {
  recheckingLandedCi,
  restartAsLandedCiReader,
} from "../support/landedCiHistory.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeFileRuns,
} from "../support/scopeHistoryCollection.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import { git } from "../support/storyReviewWorktree.ts";
import { expect, test } from "../support/preparationPage.ts";

test.use({ serverMode: "boundary", extraEnv: recheckingLandedCi });

test("visiting Project Intent reads later collected trunk builds and returning restores the middle Done history, selected file and reading place", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  // The publisher already leaves an actual later trunk commit. Collection
  // needs its recorded landing, not another launch/publication workflow.
  const latest = { revision: await originMain(origin) };
  const revisions = [setup.baseline, setup.completion, latest.revision];
  recordScopeHistoryLandings(
    dashboard,
    origin,
    setup.identity,
    revisions.map((revision, index) => ({
      revision,
      at: `2026-11-0${String(index + 5)}T10:10:00.000Z`,
      workflow: "execution" as const,
      receipt: `31000000-1000-4000-8000-00000000000${String(index + 1)}`,
      title: `History build ${String(index + 1)}`,
    })),
  );
  serveCollectedScopeFileRuns(setup, [
    [
      setup.baseline,
      101,
      "2026-11-05T10:00:00Z",
      [["folder/a.spec.ts", 8000, 80]],
    ],
    [
      setup.branchSide,
      102,
      "2026-11-06T09:00:00Z",
      [["folder/a.spec.ts", 10000, 100]],
    ],
    [
      setup.completion,
      103,
      "2026-11-06T10:00:00Z",
      [["folder/a.spec.ts", 11000, 110]],
    ],
    [
      latest.revision,
      104,
      "2026-11-07T10:00:00Z",
      [["folder/a.spec.ts", 9000, 90]],
    ],
  ]);
  for (const id of [101, 103, 104])
    await expect
      .poll(() => retainedProofs(dashboard.home)[`run/${String(id)}/1`]?.kind)
      .toBe("summary");
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  try {
    await pausePageClockAt(page, new Date());
    await page.setViewportSize({ width: 1280, height: 700 });
    const { intent } = await openCollectedHistoryStory(page, reader.origin);
    await openSummary(intent, "dashboard/tests");
    const path = "dashboard/tests/folder/a.spec.ts";
    await intentFile(intent, `Modified ${path}`).click();
    await fileReadingTab(intent, "Proof").click();
    const history = proofRegion(intent).getByRole("region", {
      name: "Test execution time history",
      exact: true,
    });
    const rows = history
      .getByRole("list", { name: "Test execution history evidence" })
      .getByRole("listitem");
    await expect(history).toContainText(
      `Selected landing ${shortSha(setup.completion)}`,
    );
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("8.0 s");
    await expect(rows.nth(1)).toContainText("11.0 s");
    await expect(history).not.toContainText(shortSha(latest.revision));
    const offset = await scrollIntentReadingHalfway(intent);
    const acquisitions = () =>
      github.calls.filter(
        ({ request }) =>
          request.kind === "actions-artifact-zip" &&
          [1001, 1002, 1003].includes(request.artifactId),
      ).length;
    await untilPageReadsAnswered(page);
    // The first Project visit legitimately acquires its current live Proof
    // (run104). History navigation must not reacquire earlier build artifacts.
    const before = acquisitions();
    await openProjectIntent(intent);
    await expect(intent).toHaveAttribute("data-selected-story", setup.identity);
    const projectSummary = await openSummary(intent, "dashboard/tests");
    await childName(projectSummary, "folder/").first().click();
    await childName(projectSummary, "a.spec.ts").first().click();
    await fileReadingTab(intent, "Proof").click();
    await expect(history).toContainText(
      `Observed trunk endpoint main ${shortSha(latest.revision)}`,
    );
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(2)).toContainText("9.0 s");
    await returnToStory(intent);
    await expect(intentFile(intent, `Modified ${path}`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(history).toContainText(
      `Selected landing ${shortSha(setup.completion)}`,
    );
    await expect(rows).toHaveCount(2);
    await expect(history).not.toContainText(shortSha(latest.revision));
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);

    await openProjectIntent(intent);
    const observed = await history
      .locator("time")
      .first()
      .getAttribute("datetime");
    const main = await originMain(origin);
    const next = (
      await origin.originGit(
        "-c",
        "user.name=Trunk Mover",
        "-c",
        "user.email=trunk@example.invalid",
        "commit-tree",
        `${main}^{tree}`,
        "-p",
        main,
        "-m",
        "New observed trunk head",
      )
    ).trim();
    await origin.originGit("update-ref", "refs/heads/main", next, main);
    git(origin.project, "fetch", "--quiet", "origin", "main");
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    await expect(history).toContainText(
      `Observed trunk endpoint main ${shortSha(next)}`,
    );
    await expect(
      proofRegion(intent).getByRole("list", {
        name: "CI evidence",
        exact: true,
      }),
    ).toContainText(`Revision ${shortSha(latest.revision)}`);
    await expect(history).toContainText("no matching collected observation");
    await expect(rows.filter({ hasText: /Run \d/ })).toHaveCount(3);
    await expect(history.locator("time").first()).not.toHaveAttribute(
      "datetime",
      observed ?? "",
    );
    expect(acquisitions()).toBe(before);
    await returnToStory(intent);
    await expect(history).toContainText(
      `Selected landing ${shortSha(setup.completion)}`,
    );
    await expect(rows).toHaveCount(2);
  } finally {
    await reader.close();
  }
});
