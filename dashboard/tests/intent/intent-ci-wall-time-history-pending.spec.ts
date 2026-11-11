import { attemptLink } from "../ciEvidenceLabelsPage.ts";
// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx) while a landing's CI is pending, on a real
// bare origin (../support/startOrigin.ts) whose dashboard collects the
// landings this machine's launch records name and checks pending ones again
// at a test's pace: a landing recorded while its CI runs is a pending gap
// after the last point, which CI status reads again with each trunk reading
// and never on time alone, and which becomes a point once its CI completes
// and the trunk reading refreshes (SEED-285#see-landed-ci-wall-time-history
// example 2). The measured point and the empty history are in
// ./intent-ci-wall-time-history.spec.ts; a landing the publication reports
// is collected in
// ../../backend-tests/intent/landed-ci-history-collection.spec.ts.

import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { passTimeUntilCheckedAfterSettled } from "../autoRefreshJourney.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  showBuildHistoryEvidence,
  dayWords,
  historyOf,
  openProjectCiStatus,
  publishTrunk,
} from "../intentCiHistoryPage.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import type { CiRunAnswer } from "../support/baseCiActions.ts";
import {
  landedCiHistory,
  recheckingLandedCi,
  storyLandingRecord,
} from "../support/landedCiHistory.ts";
import {
  landedTrunk,
  passedBetween,
  trunkRun,
} from "../support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { expect, test } from "../support/preparationPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import type { StartOrigin } from "../support/startOrigin.ts";
import type { Page } from "@playwright/test";

// How many times the page has asked for the trunk's CI status judgment
// afresh, and for the CI wall time history, so far.
function intentCiReads(page: Page) {
  const reads = { judgment: 0, history: 0 };
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const intent = url.searchParams.get("intent");
    if (intent === "ci-status" && url.searchParams.get("kept") !== "1")
      reads.judgment += 1;
    if (intent === "ci-history") reads.history += 1;
  });
  return reads;
}

// Moves Open Dough's trunk on by a commit no recorded landing names.
async function advanceTrunk(origin: StartOrigin): Promise<void> {
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
      "Advance the trunk",
    )
  ).trim();
  await origin.originGit("update-ref", "refs/heads/main", next, main);
}

test.describe("checking pending landings again", () => {
  test.use({ extraEnv: recheckingLandedCi });

  test("a landing recorded while its CI runs is a pending gap after the last point, read again with each trunk reading and never on time alone, that becomes a point once its CI completes and the trunk reading refreshes", async ({
    page,
    dashboard,
    origin,
  }) => {
    await pausePageClockAt(page, new Date());
    // Two landings on trunk from ad hoc sessions, a minute apart: the
    // first's build took 6 min 5 s; the second landed while its CI runs.
    const { landing } = landedTrunk(
      origin,
      [
        { title: "first", kind: "code" },
        { title: "second", kind: "code" },
      ],
      ["first", "second"],
    );
    const first = landing("first");
    const second = landing("second");
    const firstRun = trunkRun(
      first.revision,
      41,
      passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
    );
    let runs: readonly CiRunAnswer[] = [
      firstRun,
      trunkRun(second.revision, 42, {
        status: "in_progress",
        createdAt: "2026-11-05T10:30:00Z",
      }),
    ];
    await publishTrunk(page, origin, () => runs);
    // The dashboard has recorded both landings; its next check collects
    // them.
    keepLaunchRecords(dashboard.home, [
      storyLandingRecord(first, "ad hoc"),
      storyLandingRecord(second, "ad hoc"),
    ]);
    await expect
      .poll(() => landedCiHistory(dashboard))
      .toMatchObject({
        body: {
          entries: [
            { kind: "point", revision: first.revision },
            { kind: "gap", waitsFor: "build", revision: second.revision },
          ],
        },
      });

    const reads = intentCiReads(page);
    await page.setViewportSize({ width: 390, height: 844 });
    const panel = await openProjectCiStatus(page);
    const history = historyOf(panel);
    const heading = buildHistoryReading(history).heading;
    const builds = buildHistoryReading(history).evidence;
    const firstPoint = `Nov 5 · 6 min 5 s · exact revision ${shortSha(first.revision)} · Run 41 · attempt 1`;
    // The day the dashboard recorded it, on the reader's clock.
    const pendingGap = `${dayWords(second.at)} · Pending · CI queued or running · landed revision ${shortSha(second.revision)} · Run 42 · attempt 1`;

    await test.step("CI status shows the pending gap after the last point, linked to its run", async () => {
      await expect(heading).toHaveText(
        "CI wall time history 1 measured build · Nov 5",
      );
      await expect(buildHistoryReading(history).chart).toBeVisible();
      await showBuildHistoryEvidence(history);
      await expect(buildEvidenceRows(builds)).toHaveText([
        firstPoint,
        pendingGap,
      ]);
      await expect(attemptLink(builds, "Run 42 · attempt 1")).toHaveAttribute(
        "href",
        "https://ci.invalid/runs/42",
      );
      await expectNoSidewaysScrollIn(page, history);
      await untilPageReadsAnswered(page);
      expect(reads).toEqual({ judgment: 1, history: 1 });
    });

    // Its CI completes in 7 min 10 s, and collection measures it.
    runs = [
      firstRun,
      trunkRun(
        second.revision,
        42,
        passedBetween("2026-11-05T10:30:00Z", "2026-11-05T10:37:10Z"),
      ),
    ];
    await expect
      .poll(() => landedCiHistory(dashboard))
      .toMatchObject({
        body: {
          entries: [
            { kind: "point", revision: first.revision },
            { kind: "point", revision: second.revision },
          ],
        },
      });

    await test.step("time alone, with a revision check that finds the trunk where it was, reads nothing again", async () => {
      await passTimeUntilCheckedAfterSettled(page);
      await untilPageReadsAnswered(page);
      expect(reads).toEqual({ judgment: 1, history: 1 });
      await expect(buildEvidenceRows(builds)).toHaveText([
        firstPoint,
        pendingGap,
      ]);
    });

    await test.step("the trunk moves on: the refreshed trunk reading reads the history again, and the point appears", async () => {
      await advanceTrunk(origin);
      await passTimeUntilCheckedAfterSettled(page);
      await untilPageReadsAnswered(page);
      await expect(buildEvidenceRows(builds)).toHaveText([
        firstPoint,
        `Nov 5 · 7 min 10 s · exact revision ${shortSha(second.revision)} · Run 42 · attempt 1`,
      ]);
      await expect(heading).toHaveText(
        "CI wall time history 2 measured builds · Nov 5",
      );
      expect(reads).toEqual({ judgment: 2, history: 2 });
    });

    await test.step("Check again reads the judgment and the history again, together", async () => {
      const checkAgain = panel.getByRole("button", {
        name: "Check again",
        exact: true,
      });
      await checkAgain.click();
      await untilPageReadsAnswered(page);
      await expect(checkAgain).toBeEnabled();
      expect(reads).toEqual({ judgment: 3, history: 3 });
    });
  });
});
