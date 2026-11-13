import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../../dashboard/tests/intentScopeHistoryPage.ts";
// Real collector → Project Intent, without selecting a story. Independent
// scope totals include a measured descendant absent from the visible tree.
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../dashboard/tests/pageRequestNotes.ts";
import { expectNoSidewaysScrollIn } from "../../dashboard/tests/pageLayout.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import { childName } from "../../dashboard/tests/intentScopeProofPage.ts";
import { openSummary } from "../../dashboard/tests/intentSummaryCiProofFixtures.ts";
import { intentFile } from "../../dashboard/tests/support/intentStoryPage.ts";
import { publishSummaryComparisonStory } from "../../dashboard/tests/support/intentSummaryStoryComparisonFixture.ts";
import {
  recheckingLandedCi,
  restartAsLandedCiReader,
} from "../../dashboard/tests/support/landedCiHistory.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeFileRuns,
} from "../../dashboard/tests/support/scopeHistoryCollection.ts";
import {
  collectedScopeHistory,
  expectUnreadableHistoryAnswer,
  withBrokenCollectedHistory,
} from "../../dashboard/tests/support/collectedScopeHistory.ts";
import { git } from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { originMain } from "../../dashboard/tests/support/sessionDialog.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../../dashboard/tests/support/preparationPage.ts";

test.use({ serverMode: "boundary", extraEnv: recheckingLandedCi });

test("Project Intent reads dated entry, nested folder and file history through its observed uncollected trunk head", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  // The shared publisher already leaves an actual later trunk commit.
  const newest = { revision: await originMain(origin) };
  const revisions = [setup.baseline, setup.completion, newest.revision];
  recordScopeHistoryLandings(
    dashboard,
    origin,
    setup.identity,
    revisions.map((revision, index) => ({
      revision,
      at: `2026-11-0${String(index + 5)}T10:10:00.000Z`,
      workflow: "execution" as const,
      receipt: `31000000-0000-4000-8000-00000000000${String(index + 1)}`,
      title: `Collected project build ${String(index + 1)}`,
    })),
  );
  serveCollectedScopeFileRuns(
    setup,
    revisions.map(
      (revision, index) =>
        [
          revision,
          101 + index,
          `2026-11-0${String(index + 5)}T10:00:00Z`,
          [
            [
              "folder/nested/c.spec.ts",
              [8000, 11000, 9000][index] ?? 0,
              [80, 110, 90][index],
            ],
            ["folder/ghost.spec.ts", 1000, 10],
            ["root.spec.ts", 2000, 20],
          ],
        ] as const,
    ),
  );
  for (const runId of [101, 102, 103]) {
    await expect
      .poll(
        () => retainedProofs(dashboard.home)[`run/${String(runId)}/1`]?.kind,
      )
      .toBe("summary");
  }
  // Publish a head without a recorded landing or measurement. It stays the
  // endpoint even though the live CI judgment can show an older measured build.
  const main = await originMain(origin);
  const endpoint = (
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
      "Uncollected project head",
    )
  ).trim();
  await origin.originGit("update-ref", "refs/heads/main", endpoint, main);
  git(origin.project, "fetch", "--quiet", "origin", "main");
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  try {
    const collected = await collectedScopeHistory(
      reader.origin,
      "dashboard/tests",
      endpoint,
      new Date().toISOString(),
    );
    expect(collected.body).toMatchObject({
      selectedRevision: endpoint,
      availability: "uncollected",
      entries: [
        { kind: "point" },
        { kind: "point" },
        { kind: "point" },
        { kind: "gap" },
      ],
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await openUntilRead(
      page,
      `${reader.origin}/?project=open-dough&perspective=intent`,
    );
    const { intent } = parts(page);
    await expect(
      intent.getByRole("heading", { name: "No story selected", exact: true }),
    ).toBeVisible();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    const summary = await openSummary(intent, "dashboard/tests");
    await untilPageReadsAnswered(page);
    const historicalAcquisitions = () =>
      github.calls.filter(
        ({ request }) => request.kind === "actions-artifact-zip",
      ).length;
    const before = historicalAcquisitions();
    const history = scopeHistory(intent);
    const shown = scopeHistoryReading(history);
    const { evidence, rows } = shown;
    const expectBuildRows = async (
      cases: readonly string[],
      files: readonly string[],
    ) => {
      await expect(rows.filter({ hasText: /Run \d/ })).toHaveText(
        revisions.map(
          (revision, index) =>
            `Nov ${String(index + 5)} · ${cases[index]} · test cases · entry dashboard/tests · ${files[index]} · test files · entry dashboard/tests · Exact build ${shortSha(revision)} · Run ${String(index + 101)} · attempt 1 · Represents ${shortSha(revision)} (exact build)`,
        ),
      );
    };
    await expect(history).toContainText(
      `Observed trunk endpoint main ${shortSha(endpoint)}`,
    );
    await expect(shown.endpointTime).toHaveAttribute("datetime", /T.*Z$/);
    await expect(history).toContainText(
      "The observed trunk endpoint has no matching collected observation; earlier retained evidence is shown.",
    );
    await expect(history).toContainText("3 measured builds · Nov 5–Nov 7");
    await expectBuildRows(
      ["11.0 s", "14.0 s", "12.0 s"],
      ["110 ms", "140 ms", "120 ms"],
    );
    await expect(rows.last()).toContainText(
      "Observed trunk endpoint was not collected",
    );
    await childName(summary, "folder/").first().click();
    await expectBuildRows(
      ["9.0 s", "12.0 s", "10.0 s"],
      ["90 ms", "120 ms", "100 ms"],
    );
    await childName(summary, "nested/").first().click();
    await expectBuildRows(
      ["8.0 s", "11.0 s", "9.0 s"],
      ["80 ms", "110 ms", "90 ms"],
    );
    await expect(
      intentFile(intent, "dashboard/tests/folder/ghost.spec.ts"),
    ).toHaveCount(0);
    await childName(summary, "c.spec.ts").first().click();
    await expect(purposeRegion(intent)).toBeVisible();
    await fileReadingTab(intent, "Proof").click();
    const file = proofRegion(intent);
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toContainText("8.0 s · test cases");
    await expect(rows.nth(1)).toContainText("11.0 s · test cases");
    await expect(rows.nth(2)).toContainText("9.0 s · test cases");
    await expect(
      scopeHistoryChart(history, "test cases", "observed trunk endpoint"),
    ).toBeVisible();
    await expect(
      scopeHistoryChart(history, "test files", "observed trunk endpoint"),
    ).toBeVisible();
    await fileReadingTab(intent, "Purpose").click();
    await expect(purposeRegion(intent)).toBeVisible();
    await fileReadingTab(intent, "Proof").click();
    await expect(rows.nth(2)).toContainText("9.0 s · test cases");
    const links = evidence.getByRole("link");
    await shown.disclosure.focus();
    await expect(shown.disclosure).toBeFocused();
    for (const [index, id] of [101, 102, 103].entries()) {
      await page.keyboard.press("Tab");
      await expect(links.nth(index)).toBeFocused();
      await expect(links.nth(index)).toHaveAttribute(
        "href",
        `https://ci.invalid/runs/${String(id)}`,
      );
    }
    await expectNoSidewaysScrollIn(page, history);
    // Real store corruption fails the HTTP read; navigation keeps file Proof.
    await withBrokenCollectedHistory(dashboard.home, async (restore) => {
      const failed = await collectedScopeHistory(
        reader.origin,
        "dashboard/tests",
        endpoint,
        new Date().toISOString(),
      );
      expectUnreadableHistoryAnswer(failed);
      await intentFile(intent, "dashboard/tests/root.spec.ts").click();
      await expect(shown.failure).toContainText(
        "The collected CI history could not be read.",
      );
      await expect(shown.failure).not.toContainText("gh auth");
      await expect(file).toContainText("dashboard/tests/root.spec.ts");
      restore();
      await shown.retry.click();
      await expect(shown.failure).toHaveCount(0);
      await expect(rows).toHaveCount(4);
    });
    expect(historicalAcquisitions()).toBe(before);
  } finally {
    await reader.close();
  }
});
